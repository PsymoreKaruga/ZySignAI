import json
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from groq import AsyncGroq
from django.conf import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

NOISE = {
    'you', 'thank you', 'thank you.', 'thanks for watching',
    'bye', '.', 'the', '', ' ', 'thanks for watching!',
    'thank you so much', 'please', 'subscribe', '...'
}

class TranscribeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.current_language = 'ASL'
        self.chunks = []
        self.chunk_count = 0
        self.CHUNKS_BEFORE_SEND = 2  # Send every 2 chunks = ~10 seconds
        await self.send(json.dumps({
            'type': 'status',
            'message': 'ZySignAI engine connected'
        }))

    async def disconnect(self, code):
        self.chunks = []
        self.chunk_count = 0

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            await self.handle_audio(bytes_data)
        elif text_data:
            try:
                data = json.loads(text_data)
                msg_type = data.get('type')
                if msg_type == 'ping':
                    await self.send(json.dumps({'type': 'pong'}))
                elif msg_type == 'language_change':
                    self.current_language = data.get('language', 'ASL')
                    await self.send(json.dumps({
                        'type': 'status',
                        'message': f'Switching to {self.current_language}'
                    }))
                elif msg_type == 'flush':
                    if self.chunks:
                        await self.process_chunks()
            except Exception:
                pass

    async def handle_audio(self, chunk: bytes):
        # Ignore silence
        if len(chunk) < 1000:
            return

        # Each chunk is independent — do NOT accumulate across chunks
        # Send each chunk directly to Groq
        await self.transcribe_chunk(chunk)

    async def transcribe_chunk(self, audio_bytes: bytes):
        tmp_path = None
        try:
            # Try WAV conversion first via ffmpeg
            import subprocess

            with tempfile.NamedTemporaryFile(
                suffix='.webm', delete=False, mode='wb'
            ) as f:
                f.write(audio_bytes)
                tmp_path = f.name

            wav_path = tmp_path.replace('.webm', '.wav')

            # Convert to WAV
            convert = subprocess.run(
                [
                    'ffmpeg', '-y',
                    '-i', tmp_path,
                    '-ar', '16000',
                    '-ac', '1',
                    '-f', 'wav',
                    wav_path
                ],
                capture_output=True,
                timeout=10
            )

            if convert.returncode == 0 and os.path.exists(wav_path):
                await self.send_to_groq(wav_path, 'audio.wav', 'audio/wav')
            else:
                # ffmpeg failed — send raw webm
                await self.send_to_groq(tmp_path, 'audio.webm', 'audio/webm')

        except FileNotFoundError:
            # ffmpeg not installed — send raw
            if tmp_path:
                await self.send_to_groq(tmp_path, 'audio.webm', 'audio/webm')
        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)[:100]
            }))
        finally:
            for path in [tmp_path, tmp_path.replace('.webm', '.wav') if tmp_path else None]:
                if path and os.path.exists(path):
                    try:
                        os.unlink(path)
                    except Exception:
                        pass

    async def send_to_groq(self, file_path: str, filename: str, mime_type: str):
        try:
            with open(file_path, 'rb') as f:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=(filename, f, mime_type),
                    response_format='json',
                    language='en'
                )

            transcript = response.text.strip()

            if transcript and transcript.lower() not in NOISE and len(transcript) > 2:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript,
                    'sign_language': self.current_language
                }))

        except Exception as e:
            error_msg = str(e)
            # Silently ignore format errors — they happen on silence chunks
            if 'could not process' not in error_msg.lower():
                await self.send(json.dumps({
                    'type': 'error',
                    'message': error_msg[:100]
                }))