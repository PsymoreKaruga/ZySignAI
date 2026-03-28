import json
import io
import os
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from groq import Groq
from django.conf import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

def health(request):
    return JsonResponse({'status': 'ok', 'service': 'ZySignAI'})

@csrf_exempt
@require_http_methods(['POST'])
def transcribe_file(request):
    """
    Accept uploaded audio/video file and return transcript + gloss
    """
    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)

        uploaded = request.FILES['file']
        language = request.POST.get('language', 'ASL')

        # Check file size — max 25MB (Groq limit)
        if uploaded.size > 25 * 1024 * 1024:
            return JsonResponse(
                {'error': 'File too large — maximum 25MB'},
                status=400
            )

        # Get file extension
        name = uploaded.name.lower()
        if name.endswith(('.mp4', '.mov', '.avi', '.mkv', '.webm')):
            ext = '.mp4'
            mime = 'audio/mp4'
            filename = 'upload.mp4'
        elif name.endswith('.mp3'):
            ext = '.mp3'
            mime = 'audio/mp3'
            filename = 'upload.mp3'
        elif name.endswith('.wav'):
            ext = '.wav'
            mime = 'audio/wav'
            filename = 'upload.wav'
        elif name.endswith('.ogg'):
            ext = '.ogg'
            mime = 'audio/ogg'
            filename = 'upload.ogg'
        else:
            ext = '.mp4'
            mime = 'audio/mp4'
            filename = 'upload.mp4'

        # Write to temp file
        with tempfile.NamedTemporaryFile(
            suffix=ext, delete=False
        ) as tmp:
            for chunk in uploaded.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            # Send to Groq Whisper
            with open(tmp_path, 'rb') as f:
                response = groq_client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=(filename, f, mime),
                    response_format='verbose_json',
                    language='en'
                )

            transcript = response.text.strip()

            if not transcript:
                return JsonResponse({'error': 'No speech detected in file'}, status=400)

            # Get gloss using Llama 3
            gloss = get_gloss(transcript, language)

            # Get segments for timeline
            segments = []
            if hasattr(response, 'segments') and response.segments:
                for seg in response.segments:
                    segments.append({
                        'start': round(seg.start, 2),
                        'end': round(seg.end, 2),
                        'text': seg.text.strip(),
                    })

            return JsonResponse({
                'success': True,
                'transcript': transcript,
                'gloss': gloss,
                'segments': segments,
                'language': language,
                'duration': segments[-1]['end'] if segments else 0,
            })

        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_gloss(english: str, language: str) -> str:
    """Convert English to Sign Language Gloss"""
    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are an expert sign language translator. '
                        'Convert English text into Sign Language Gloss notation. '
                        'Rules: Use ALL CAPS. Remove articles (a, an, the). '
                        'Remove helper verbs (am, is, are). Use present tense. '
                        'Output ONLY the glossed text — nothing else.'
                    )
                },
                {
                    'role': 'user',
                    'content': f'Translate to {language} Gloss: {english}'
                }
            ],
            model='llama-3.3-70b-versatile',
            max_tokens=200,
            temperature=0.0,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return english.upper()