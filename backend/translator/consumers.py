import json
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from groq import AsyncGroq
from django.conf import settings

client = AsyncGroq(api_key=settings.GROQ_API_KEY)

class TranscribeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.send(json.dumps({
            'type': 'status',
            'message': 'ZySignAI engine connected'
        }))

    async def disconnect(self, code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            await self.process_audio(bytes_data)

    async def process_audio(self, audio_bytes):
        # Skip silent or empty chunks
        if len(audio_bytes) < 1000:
            return

        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                suffix='.webm',
                delete=False
            ) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            with open(tmp_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=('audio.webm', audio_file, 'audio/webm'),
                    response_format='verbose_json'
                )

            transcript = response.text.strip()

            if transcript:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript,
                    'language': getattr(response, 'language', 'en')
                }))

        except Exception as e:
            # Only send error if it's not a silence/empty audio error
            error_msg = str(e)
            if 'could not process' not in error_msg.lower():
                await self.send(json.dumps({
                    'type': 'error',
                    'message': error_msg
                }))
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.unlink(tmp_path)
                except:
                    pass