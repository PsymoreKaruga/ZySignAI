import json
import tempfile
import os
import asyncio
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
        self.MIN_AUDIO_SIZE = 8000   # 8KB minimum before sending to Groq
        self.MAX_BUFFER_SIZE = 500000 # 500KB maximum buffer
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
                    # Force process whatever is in buffer
                    if self.audio_buffer:
                        await self.process_buffer()
            except Exception:
                pass

    async def handle_audio(self, chunk: bytes):
        # Skip tiny chunks — silence or noise
        if len(chunk) < 500:
            return

        self.audio_buffer.append(chunk)
        self.buffer_size += len(chunk)

        # Process when buffer is large enough
        if self.buffer_size >= self.MIN_AUDIO_SIZE:
            await self.process_buffer()

    async def process_buffer(self):
        if not self.audio_buffer:
            return

        # Grab current buffer and reset
        chunks = self.audio_buffer[:]
        self.audio_buffer = []
        self.buffer_size = 0

        audio_bytes = b''.join(chunks)

        # Still too small — skip
        if len(audio_bytes) < 3000:
            return

        await self.transcribe(audio_bytes)

    async def transcribe(self, audio_bytes: bytes):
        tmp_path = None
        try:
            # Write to temp file with correct extension
            with tempfile.NamedTemporaryFile(
                suffix='.webm',
                delete=False,
                mode='wb'
            ) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            # Verify file was written properly
            file_size = os.path.getsize(tmp_path)
            if file_size < 1000:
                return

            with open(tmp_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=('audio.webm', audio_file, 'audio/webm'),
                    response_format='json',
                    language='en'
                )

            transcript = response.text.strip()

            # Filter out noise transcriptions
            noise_phrases = [
                'you', 'thank you', 'thank you.',
                'thanks for watching', 'bye', '.',
                'the', '', ' '
            ]

            if transcript and transcript.lower() not in noise_phrases:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript,
                    'sign_language': self.current_language
                }))

        except Exception as e:
            error_msg = str(e)
            # Only send meaningful errors to frontend
            if 'could not process' in error_msg.lower():
                # Audio format issue — try mp4 fallback
                await self.try_mp4_fallback(audio_bytes)
            else:
                await self.send(json.dumps({
                    'type': 'error',
                    'message': f'Transcription error: {error_msg[:100]}'
                }))
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    async def try_mp4_fallback(self, audio_bytes: bytes):
        """Fallback — try sending as mp4 if webm fails"""
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                suffix='.mp4',
                delete=False,
                mode='wb'
            ) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

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
            # Silent fail on fallback
            pass
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass