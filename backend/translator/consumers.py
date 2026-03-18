import json
import base64
import tempfile
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from openai import AsyncOpenAI
from django.conf import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class TranscribeConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.send(json.dumps({
            'type': 'status',
            'message': 'Connected to ZySignAI engine'
        }))

    async def disconnect(self, code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            await self.process_audio(bytes_data)

    async def process_audio(self, audio_bytes):
        try:
            # Save audio chunk to temp file
            with tempfile.NamedTemporaryFile(
                suffix='.webm', delete=False
            ) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            # Send to Whisper
            with open(tmp_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-1',
                    file=audio_file,
                    response_format='json'
                )

            os.unlink(tmp_path)

            transcript = response.text.strip()

            if transcript:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript,
                    'language': 'en'  # auto-detect later
                }))

        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)
            }))