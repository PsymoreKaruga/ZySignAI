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
        try:
            with tempfile.NamedTemporaryFile(
                suffix='.wav',
                delete=False
            ) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            with open(tmp_path, 'rb') as audio_file:
                response = await client.audio.transcriptions.create(
                    model='whisper-large-v3',
                    file=('audio.wav', audio_file, 'audio/wav'),
                    response_format='json'
                )

            os.unlink(tmp_path)

            transcript = response.text.strip()

            if transcript:
                await self.send(json.dumps({
                    'type': 'transcript',
                    'text': transcript
                }))

        except Exception as e:
            await self.send(json.dumps({
                'type': 'error',
                'message': str(e)
            }))