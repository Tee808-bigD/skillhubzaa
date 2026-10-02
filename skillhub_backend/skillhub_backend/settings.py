"""
Django settings for skillhub_backend project.
SkillHub ZA - Social Skill-Sharing Platform
"""

import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security configuration
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-skillhub-za-development-only-key-placeholder-994')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

if not DEBUG and 'django-insecure' in SECRET_KEY:
    import warnings
    warnings.warn("DJANGO_SECRET_KEY is using an insecure default in production! Set a custom key via DJANGO_SECRET_KEY.")

# Allowed Hosts (Configurable via comma-separated DJANGO_ALLOWED_HOSTS)
env_hosts = os.getenv('DJANGO_ALLOWED_HOSTS')
if env_hosts:
    ALLOWED_HOSTS = [h.strip() for h in env_hosts.split(',') if h.strip()]
else:
    ALLOWED_HOSTS = ['*'] if DEBUG else ['127.0.0.1', 'localhost']

# Application definition
INSTALLED_APPS = [
    # Daphne MUST be at the very top before django.contrib.admin for ASGI WebSockets
    'daphne',
    'channels',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    # SkillHub ZA Core application
    'core.apps.CoreConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware at top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'skillhub_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'skillhub_backend.wsgi.application'
ASGI_APPLICATION = 'skillhub_backend.asgi.application'

# Database Configuration (PostgreSQL in production, SQLite for local development)
DB_ENGINE = os.getenv('DB_ENGINE', 'django.db.backends.sqlite3')

if 'postgresql' in DB_ENGINE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'skillhub_za_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model
AUTH_USER_MODEL = 'core.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization (South African standard)
LANGUAGE_CODE = 'en-za'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# When running behind Ngrok, use the Ngrok public URL so React client renders uploaded media properly
NGROK_URL = os.getenv('NGROK_URL', 'https://engrainedly-subinvolute-silvana.ngrok-free.dev')
MEDIA_URL = f'{NGROK_URL}/media/' if NGROK_URL else '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}

# SimpleJWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CORS & CSRF Configuration for React Frontend
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allows seamless frontend development
CORS_ALLOWED_ORIGINS = [
    'https://aistudio.google.com',
    'https://engrainedly-subinvolute-silvana.ngrok-free.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Append custom CORS origins from environment variable (e.g. Netlify URL)
extra_cors = os.getenv('CORS_ALLOWED_ORIGINS')
if extra_cors:
    for origin in extra_cors.split(','):
        cleaned = origin.strip()
        if cleaned and cleaned not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(cleaned)

CSRF_TRUSTED_ORIGINS = [
    'https://aistudio.google.com',
    'https://engrainedly-subinvolute-silvana.ngrok-free.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]

extra_csrf = os.getenv('CSRF_TRUSTED_ORIGINS')
if extra_csrf:
    for origin in extra_csrf.split(','):
        cleaned = origin.strip()
        if cleaned and cleaned not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(cleaned)
CORS_ALLOW_CREDENTIALS = True

# Django Channels & Channel Layers Configuration
# For production or local Docker Redis: Set USE_REDIS_CHANNEL_LAYER=True
# Quick local testing: Defaults to InMemoryChannelLayer (zero external Redis setup needed)
REDIS_URL = os.getenv('REDIS_URL', '')
USE_REDIS_CHANNEL_LAYER = os.getenv('USE_REDIS_CHANNEL_LAYER', 'False') == 'True' or bool(REDIS_URL)

if USE_REDIS_CHANNEL_LAYER:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [REDIS_URL or ('127.0.0.1', 6379)],
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        },
    }
