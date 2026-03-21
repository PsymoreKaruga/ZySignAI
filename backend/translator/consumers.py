import json
import tempfile
import os
import io
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
        await self.send(json.dumps({
            'type': 'status',
            'message': 'ZySignAI engine connected'
        }))

    async def disconnect(self, code):
        pass

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
            except Exception:
                pass

    async def handle_audio(self, chunk: bytes):
        if len(chunk) < 1000:
            return
        await self.transcribe_chunk(chunk)

    async def transcribe_chunk(self, audio_bytes: bytes):
        tmp_input = None
        tmp_wav = None
        try:
            # Write webm to temp file
            with tempfile.NamedTemporaryFile(
                suffix='.webm', delete=False, mode='wb'
            ) as f:
                f.write(audio_bytes)
                tmp_input = f.name

            tmp_wav = tmp_input.replace('.webm', '.wav')
            converted = False

            # Try av (PyAV) conversion first — pure Python, no system ffmpeg needed
            try:
                import av
                with av.open(tmp_input) as in_container:
                    with av.open(tmp_wav, 'w', format='wav') as out_container:
                        out_stream = out_container.add_stream('pcm_s16le', rate=16000)
                        out_stream.layout = 'mono'
                        for frame in in_container.decode(audio=0):
                            frame.pts = None
                            for packet in out_stream.encode(frame):
                                out_container.mux(packet)
                        for packet in out_stream.encode(None):
                            out_container.mux(packet)
                converted = os.path.exists(tmp_wav) and os.path.getsize(tmp_wav) > 1000
            except Exception:
                converted = False

            # If av failed try pydub
            if not converted:
                try:
                    from pydub import AudioSegment
                    audio = AudioSegment.from_file(tmp_input)
                    audio = audio.set_frame_rate(16000).set_channels(1)
                    audio.export(tmp_wav, format='wav')
                    converted = os.path.exists(tmp_wav) and os.path.getsize(tmp_wav) > 1000
                except Exception:
                    converted = False

            # Send to Groq — WAV if converted, otherwise raw webm
            if converted:
                await self.send_to_groq(tmp_wav, 'audio.wav', 'audio/wav')
            else:
                await self.send_to_groq(tmp_input, 'audio.webm', 'audio/webm')

        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)[:100]
            }))
        finally:
            for path in [tmp_input, tmp_wav]:
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
            if 'could not process' not in error_msg.lower():
                await self.send(json.dumps({
                    'type': 'error',
                    'message': error_msg[:100]
                }))