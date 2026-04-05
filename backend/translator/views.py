import json
import os
import re
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
def youtube_captions(request):
    """
    Fetch YouTube captions and convert to sign language gloss
    """
    try:
        body = json.loads(request.body)
        video_id = body.get('video_id', '').strip()
        language = body.get('language', 'ASL')

        if not video_id:
            return JsonResponse({'error': 'No video ID provided'}, status=400)

        # Try to fetch captions using yt-dlp
        captions = fetch_captions(video_id)

        if not captions:
            return JsonResponse(
                {'error': 'No captions found for this video. Try a video with English captions enabled.'},
                status=404
            )

        # Convert captions to gloss
        glossed = gloss_captions(captions, language)

        return JsonResponse({
            'success': True,
            'captions': glossed,
            'language': language,
            'video_id': video_id,
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def fetch_captions(video_id: str):
    """Fetch YouTube captions using youtube-transcript-api"""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        return transcript
    except Exception:
        return None


def gloss_captions(captions: list, language: str) -> list:
    """Convert caption segments to sign language gloss"""
    glossed = []

    # Process in batches of 5 to save API calls
    batch_size = 5
    for i in range(0, len(captions), batch_size):
        batch = captions[i:i + batch_size]
        combined = ' '.join([seg['text'] for seg in batch])

        try:
            gloss = get_gloss(combined, language)
        except Exception:
            gloss = combined.upper()

        # Distribute gloss across segments in batch
        for j, seg in enumerate(batch):
            glossed.append({
                'start': seg['start'],
                'duration': seg['duration'],
                'text': seg['text'],
                'gloss': gloss if j == 0 else '',
            })

    return glossed


@csrf_exempt
@require_http_methods(['POST'])
def gloss_text(request):
    """
    Convert any English text to sign language gloss in real time
    """
    try:
        body = json.loads(request.body)
        text = body.get('text', '').strip()
        language = body.get('language', 'ASL')

        if not text:
            return JsonResponse({'error': 'No text provided'}, status=400)

        gloss = get_gloss(text, language)

        return JsonResponse({
            'success': True,
            'text': text,
            'gloss': gloss,
            'language': language,
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
def transcribe_file(request):
    try:
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file provided'}, status=400)

        uploaded = request.FILES['file']
        language = request.POST.get('language', 'ASL')

        if uploaded.size > 25 * 1024 * 1024:
            return JsonResponse(
                {'error': 'File too large — maximum 25MB'},
                status=400
            )

        name = uploaded.name.lower()
        if name.endswith(('.mp4', '.mov', '.avi', '.mkv')):
            ext, mime, filename = '.mp4', 'video/mp4', 'upload.mp4'
        elif name.endswith('.mp3'):
            ext, mime, filename = '.mp3', 'audio/mpeg', 'upload.mp3'
        elif name.endswith('.wav'):
            ext, mime, filename = '.wav', 'audio/wav', 'upload.wav'
        elif name.endswith('.ogg'):
            ext, mime, filename = '.ogg', 'audio/ogg', 'upload.ogg'
        elif name.endswith('.webm'):
            ext, mime, filename = '.webm', 'audio/webm', 'upload.webm'
        elif name.endswith('.m4a'):
            ext, mime, filename = '.m4a', 'audio/mp4', 'upload.m4a'
        else:
            ext, mime, filename = '.mp4', 'audio/mp4', 'upload.mp4'

        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            for chunk in uploaded.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        try:
            with open(tmp_path, 'rb') as f:
                response = groq_client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=(filename, f, mime),
                    response_format='verbose_json',
                    language='en'
                )

            transcript = response.text.strip()

            if not transcript:
                return JsonResponse(
                    {'error': 'No speech detected in file'},
                    status=400
                )

            gloss = get_gloss(transcript, language)

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
                try:
                    os.unlink(tmp_path)
                except Exception:
                    pass

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_gloss(english: str, language: str) -> str:
    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'You are an expert sign language translator. '
                        'Convert English text into Sign Language Gloss notation. '
                        'Rules: Use ALL CAPS. Remove articles (a, an, the). '
                        'Remove helper verbs (am, is, are, was, were). '
                        'Use present tense. Output ONLY the glossed text — nothing else.'
                    )
                },
                {
                    'role': 'user',
                    'content': f'Translate to {language} Gloss: {english}'
                }
            ],
            model='llama-3.3-70b-versatile',
            max_tokens=300,
            temperature=0.0,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return english.upper()