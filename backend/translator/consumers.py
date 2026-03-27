import json
import io
from channels.generic.websocket import AsyncWebsocketConsumer
from groq import AsyncGroq
from django.conf import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

NOISE = {
    'you', 'thank you', 'thank you.', 'thanks for watching',
    'bye', '.', 'the', '', ' ', 'thanks for watching!',
    'thank you so much', 'please', 'subscribe', '...',
    'you.', 'the.', 'bye.', 'hi.', 'hey.', 'hi', 'hey',
}

GLOSS_SYSTEM_PROMPT = """You are an expert sign language translator.
Convert English text into Sign Language Gloss notation.

Rules:
- Use ALL CAPS
- Remove articles: a, an, the
- Remove helper verbs: am, is, are, was, were
- Use present tense only
- Keep nouns, verbs, adjectives, and question words
- For questions use WHAT, WHERE, WHO, WHEN, WHY at the END
- Output ONLY the glossed text — no explanation, no punctuation

Examples:
"What is your name?" -> YOUR NAME WHAT
"I am going to the store" -> STORE I GO
"She is very happy today" -> TODAY SHE VERY HAPPY
"Can you help me please" -> YOU HELP ME
"I love you" -> I LOVE YOU
"Where do you live" -> YOU LIVE WHERE"""


class TranscribeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.current_language = 'ASL'
        self.audio_chunks = []
        self.total_bytes = 0
        self.SEND_THRESHOLD = 25000
        await self.send(json.dumps({
            'type': 'status',
            'message': 'ZySignAI connected'
        }))

    async def disconnect(self, code):
        self.audio_chunks = []
        self.total_bytes = 0

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            await self.handle_audio(bytes_data)
        elif text_data:
            try:
                data = json.loads(text_data)
                t = data.get('type')
                if t == 'ping':
                    await self.send(json.dumps({'type': 'pong'}))
                elif t == 'language_change':
                    self.current_language = data.get('language', 'ASL')
                elif t == 'flush':
                    if self.audio_chunks:
                        await self.process()
            except Exception:
                pass

    async def handle_audio(self, chunk: bytes):
        if len(chunk) < 500:
            return
        self.audio_chunks.append(chunk)
        self.total_bytes += len(chunk)
        if self.total_bytes >= self.SEND_THRESHOLD:
            await self.process()

    async def process(self):
        if not self.audio_chunks:
            return
        data = b''.join(self.audio_chunks)
        self.audio_chunks = []
        self.total_bytes = 0
        if len(data) < 3000:
            return
        await self.transcribe(data)

    async def transcribe(self, audio: bytes):
        # Try in-memory WAV conversion first
        try:
            from pydub import AudioSegment
            audio_io = io.BytesIO(audio)
            segment = AudioSegment.from_file(audio_io, format='webm')
            wav_io = io.BytesIO()
            segment.set_frame_rate(16000).set_channels(1).export(
                wav_io, format='wav'
            )
            wav_io.seek(0)
            await self.send_to_groq(wav_io, 'audio.wav', 'audio/wav')
            return
        except Exception:
            pass

        # Fallback — raw formats
        for filename, mime in [
            ('audio.webm', 'audio/webm'),
            ('audio.ogg', 'audio/ogg'),
            ('audio.mp4', 'audio/mp4'),
        ]:
            success = await self.send_to_groq(
                io.BytesIO(audio), filename, mime
            )
            if success:
                return

    async def send_to_groq(
        self,
        stream: io.BytesIO,
        filename: str,
        mime: str
    ) -> bool:
        try:
            # Step 1 — Speech to Text
            response = await client.audio.transcriptions.create(
                model='whisper-large-v3-turbo',
                file=(filename, stream, mime),
                response_format='json',
                language='en'
            )

            english = response.text.strip()

            if not english or english.lower() in NOISE or len(english) < 3:
                return True

            # Step 2 — English to Sign Language Gloss
            gloss = await self.to_gloss(english)

            # Step 3 — Send both to frontend
            await self.send(json.dumps({
                'type': 'transcript',
                'text': english,
                'gloss': gloss,
                'sign_language': self.current_language
            }))

            return True

        except Exception as e:
            msg = str(e).lower()
            if 'could not process' in msg or '400' in msg:
                return False
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)[:100]
            }))
            return False

    async def to_gloss(self, english: str) -> str:
        """Convert English to Sign Language Gloss using Llama 3"""
        try:
            completion = await client.chat.completions.create(
                messages=[
                    {
                        'role': 'system',
                        'content': GLOSS_SYSTEM_PROMPT
                    },
                    {
                        'role': 'user',
                        'content': f'Translate to {self.current_language} Gloss: {english}'
                    }
                ],
                model='llama-3.3-70b-versatile',
                max_tokens=60,
                temperature=0.0,
            )
            return completion.choices[0].message.content.strip()
        except Exception:
            # Fallback — return uppercase English if gloss fails
            return english.upper()