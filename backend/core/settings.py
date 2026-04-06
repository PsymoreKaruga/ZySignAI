from pathlib import Path
from dotenv import load_dotenv
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'signlingo-dev-key-change-in-production'
DEBUG = True

CORS_ALLOWED_ORIGINS = [
    'https://zy-sign-ai.vercel.app',
    'http://localhost:3000',
    'https://www.youtube.com',
    'https://www.google.com',
]

# Allow Chrome extensions
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^chrome-extension://.*$',
]

#CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_ALL_ORIGINS = True  # Temporarily allow all for extension

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'origin',
    'user-agent',
    'x-requested-with',
]

ALLOWED_HOSTS = [
    'zysignai-backend.onrender.com',
    'localhost',
    '127.0.0.1',
]   

INSTALLED_APPS = [
    'daphne',
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'django.contrib.auth',
    'channels',
    'translator',

]

MIDDLEWARE = [
    
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'core.urls'

ASGI_APPLICATION = 'core.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}




GROQ_API_KEY = os.getenv('GROQ_API_KEY')


GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'




# Allow file uploads up to 30MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 30 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 30 * 1024 * 1024