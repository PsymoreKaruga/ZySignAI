import json
import os
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from groq import Groq
from django.conf import settings

groq_client = Groq(api_key=settings.GROQ_API_KEY)

# Initialize Gemini if key exists
gemini_model = None
try:
    import google.generativeai as genai
    gemini_key = os.getenv('GEMINI_API_KEY')
    if gemini_key:
        genai.configure(api_key=gemini_key)
        gemini_model = genai.GenerativeModel('gemini-2.0-flash')
except Exception:
    pass


# ── HELPER — defined FIRST so all views below can use it ─────────────

def get_gloss(english: str, language: str) -> str:
    """Try Groq first, fall back to Gemini, fall back to uppercase"""
    prompt_system = (
        'You are an expert sign language translator. '
        'Convert English text into Sign Language Gloss notation. '
        'Rules: Use ALL CAPS. Remove articles (a, an, the). '
        'Remove helper verbs (am, is, are, was, were). '
        'Use present tense. Output ONLY the glossed text — nothing else.'
    )
    prompt_user = f'Translate to {language} Gloss: {english}'

    # Try Groq first
    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {'role': 'system', 'content': prompt_system},
                {'role': 'user', 'content': prompt_user}
            ],
            model='llama-3.3-70b-versatile',
            max_tokens=300,
            temperature=0.0,
        )
        result = completion.choices[0].message.content.strip()
        if result:
            return result
    except Exception as groq_err:
        print(f'Groq gloss failed: {groq_err}')

    # Fall back to Gemini
    if gemini_model:
        try:
            response = gemini_model.generate_content(
                f'{prompt_system}\n\n{prompt_user}'
            )
            result = response.text.strip()
            if result:
                return result
        except Exception as gemini_err:
            print(f'Gemini gloss failed: {gemini_err}')

    return english.upper()


# ── VIEWS ─────────────────────────────────────────────────────────────

def health(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'ZySignAI',
        'engines': {
            'groq': bool(settings.GROQ_API_KEY),
            'gemini': bool(gemini_model),
        }
    })


@csrf_exempt
@require_http_methods(['POST'])
def gloss_text(request):
    try:
        body = json.loads(request.body)
        text = body.get('text', '').strip()
        language = body.get('language', 'ASL')
        if not text:
            return JsonResponse({'error': 'No text'}, status=400)
        gloss = get_gloss(text, language)
        return JsonResponse({
            'success': True,
            'gloss': gloss,
            'language': language
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(['POST'])
def youtube_captions(request):
    try:
        body = json.loads(request.body)
        video_id = body.get('video_id', '').strip()
        language = body.get('language', 'ASL')

        if not video_id:
            return JsonResponse({'error': 'No video ID provided'}, status=400)

        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            transcript = None

            try:
                transcript = YouTubeTranscriptApi.get_transcript(
                    video_id,
                    languages=['en', 'en-US', 'en-GB', 'en-CA']
                )
            except Exception:
                pass

            if not transcript:
                try:
                    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                    for t in transcript_list:
                        if t.language_code.startswith('en'):
                            transcript = t.fetch()
                            break
                except Exception:
                    pass

            if not transcript:
                return JsonResponse({
                    'error': 'No English captions found for this video.'
                }, status=404)

        except Exception as e:
            return JsonResponse({
                'error': f'Caption error: {str(e)[:80]}'
            }, status=500)

        glossed = []
        batch_size = 10
        for i in range(0, len(transcript), batch_size):
            batch = transcript[i:i + batch_size]
            combined = ' '.join([
                s['text'].replace('\n', ' ') for s in batch
            ])
            try:
                gloss = get_gloss(combined, language)
            except Exception:
                gloss = combined.upper()

            for j, seg in enumerate(batch):
                glossed.append({
                    'start': seg['start'],
                    'duration': seg['duration'],
                    'text': seg['text'].replace('\n', ' '),
                    'gloss': gloss if j == 0 else '',
                })

        return JsonResponse({
            'success': True,
            'captions': glossed,
            'language': language,
            'total': len(glossed),
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
            transcript_text = None
            segments = []

            # Try Groq first
            try:
                with open(tmp_path, 'rb') as f:
                    response = groq_client.audio.transcriptions.create(
                        model='whisper-large-v3-turbo',
                        file=(filename, f, mime),
                        response_format='verbose_json',
                        language='en'
                    )
                transcript_text = response.text.strip()
                if hasattr(response, 'segments') and response.segments:
                    for seg in response.segments:
                        segments.append({
                            'start': round(seg.start, 2),
                            'end': round(seg.end, 2),
                            'text': seg.text.strip(),
                        })
            except Exception as groq_err:
                print(f'Groq transcription failed: {groq_err}')

            # Fall back to Gemini
            if not transcript_text and gemini_model:
                try:
                    import base64
                    with open(tmp_path, 'rb') as f:
                        audio_data = f.read()
                    b64 = base64.b64encode(audio_data).decode()
                    response = gemini_model.generate_content([
                        {'mime_type': mime, 'data': b64},
                        'Transcribe this audio. Output only the spoken text.'
                    ])
                    transcript_text = response.text.strip()
                except Exception as gemini_err:
                    print(f'Gemini transcription failed: {gemini_err}')

            if not transcript_text:
                return JsonResponse(
                    {'error': 'No speech detected in file'},
                    status=400
                )

            gloss = get_gloss(transcript_text, language)

            return JsonResponse({
                'success': True,
                'transcript': transcript_text,
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