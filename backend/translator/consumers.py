import json
import tempfile
import os
import io
from channels.generic.websocket import AsyncWebsocketConsumer
from groq import AsyncGroq
from django.conf import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

class TranscribeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.current_language = 'ASL'
        self.audio_buffer = []
        self.buffer_size = 0
        self.MIN_AUDIO_SIZE = 10000  # 10KB minimum
        await self.send(json.dumps({
            'type': 'status',
            'message': 'ZySignAI engine connected'
        }))

    async def disconnect(self, code):
        self.audio_buffer = []
        self.buffer_size = 0

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            await self.handle_audio(bytes_data)
        elif text_data:
            try:
                data = json.loads(text_data)
                if data.get('type') == 'ping':
                    await self.send(json.dumps({'type': 'pong'}))
                elif data.get('type') == 'language_change':
                    self.current_language = data.get('language', 'ASL')
                    await self.send(json.dumps({
                        'type': 'status',
                        'message': f'Switching to {self.current_language}'
                    }))
                elif data.get('type') == 'flush':
                    if self.audio_buffer:
                        await self.process_buffer()
            except Exception:
                pass

    async def handle_audio(self, chunk: bytes):
        if len(chunk) < 500:
            return
        self.audio_buffer.append(chunk)
        self.buffer_size += len(chunk)
        if self.buffer_size >= self.MIN_AUDIO_SIZE:
            await self.process_buffer()

    async def process_buffer(self):
        if not self.audio_buffer:
            return
        chunks = self.audio_buffer[:]
        self.audio_buffer = []
        self.buffer_size = 0
        audio_bytes = b''.join(chunks)
        if len(audio_bytes) < 3000:
            return
        await self.transcribe(audio_bytes)

    async def transcribe(self, audio_bytes: bytes):
        tmp_input = None
        tmp_wav = None
        try:
            # Step 1 — write raw webm to temp file
            with tempfile.NamedTemporaryFile(
                suffix='.webm',
                delete=False,
                mode='wb'
            ) as f:
                f.write(audio_bytes)
                tmp_input = f.name

            # Step 2 — convert to WAV using pydub + ffmpeg
            wav_path = tmp_input.replace('.webm', '.wav')
            tmp_wav = wav_path

            try:
                from pydub import AudioSegment
                audio = AudioSegment.from_file(tmp_input, format='webm')
                audio = audio.set_frame_rate(16000).set_channels(1)
                audio.export(wav_path, format='wav')
            except Exception:
                # pydub failed — try direct ffmpeg
                import subprocess
                result = subprocess.run([
                    'ffmpeg', '-y', '-i', tmp_input,
                    '-ar', '16000', '-ac', '1',
                    '-f', 'wav', wav_path
                ], capture_output=True, timeout=15)
                if result.returncode != 0:
                    # Last resort — send raw as mp4
                    await self.try_raw_fallback(audio_bytes)
                    return

            # Step 3 — verify wav file exists and has content
            if not os.path.exists(wav_path) or os.path.getsize(wav_path) < 1000:
                await self.try_raw_fallback(audio_bytes)
                return

            # Step 4 — send WAV to Groq
            with open(wav_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=('audio.wav', audio_file, 'audio/wav'),
                    response_format='json',
                    language='en'
                )

            transcript = response.text.strip()

            noise = [
                'you', 'thank you', 'thank you.', 'thanks for watching',
                'bye', '.', 'the', '', ' ', 'Thanks for watching!'
            ]

            if transcript and transcript.lower() not in [n.lower() for n in noise]:
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
                    'message': error_msg[:120]
                }))
        finally:
            for path in [tmp_input, tmp_wav]:
                if path and os.path.exists(path):
                    try:
                        os.unlink(path)
                    except Exception:
                        pass

    async def try_raw_fallback(self, audio_bytes: bytes):
        """Last resort — send raw bytes as mp4"""
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                suffix='.mp4',
                delete=False,
                mode='wb'
            ) as f:
                f.write(audio_bytes)
                tmp_path = f.name

            with open(tmp_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=('audio.mp4', audio_file, 'audio/mp4'),
                    response_format='json',
                    language='en'
                )

            transcript = response.text.strip()
            if transcript:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript,
                    'sign_language': self.current_language
                }))
        except Exception:
            pass
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass