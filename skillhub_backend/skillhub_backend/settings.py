"""
Django settings for skillhub_backend project.
SkillHub ZA - Social Skill-Sharing Platform
Fully hardened production & development configuration.
"""

import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize django-environ with resilient fallback
try:
    import environ
    env = environ.Env(
        DEBUG=(bool, True),
        DJANGO_DEBUG=(bool, True),
        SESSION_COOKIE_SECURE=(bool, False),
        CSRF_COOKIE_SECURE=(bool, False),
        SECURE_SSL_REDIRECT=(bool, False),
    )
    env_file = BASE_DIR / '.env'
    if env_file.exists():
        environ.Env.read_env(env_file)
except ImportError:
    class FallbackEnv:
        def __call__(self, key, default=None):
            return os.getenv(key, default)
        def bool(self, key, default=False):
            val = os.getenv(key)
            return default if val is None else val.lower() in ('true', '1', 'yes')
        def list(self, key, default=None):
            val = os.getenv(key)
            return default if val is None else [x.strip() for x in val.split(',') if x.strip()]
        def db(self, key='DATABASE_URL', default=None):
            return None
    env = FallbackEnv()

# Security configuration from environment
SECRET_KEY = env('DJANGO_SECRET_KEY', default=env('SECRET_KEY', default='django-insecure-skillhub-za-development-only-key-placeholder-994'))
DEBUG = env.bool('DJANGO_DEBUG', default=env.bool('DEBUG', default=True))

if not DEBUG and 'django-insecure' in SECRET_KEY:
    import warnings
    warnings.warn("DJANGO_SECRET_KEY is using an insecure default in production! Set a custom key via DJANGO_SECRET_KEY.")

# Allowed Hosts (Configurable via comma-separated DJANGO_ALLOWED_HOSTS or ALLOWED_HOSTS)
raw_hosts = env('DJANGO_ALLOWED_HOSTS', default=env('ALLOWED_HOSTS', default='*' if DEBUG else '127.0.0.1,localhost'))
ALLOWED_HOSTS = [h.strip() for h in raw_hosts.split(',') if h.strip()]

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
    'rest_framework_simplejwt.token_blacklist',  # For refresh token blacklisting on logout

    # SkillHub ZA Core application
    'core.apps.CoreConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware at top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
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

# Database Configuration (PostgreSQL or SQLite)
DATABASE_URL = env('DATABASE_URL', default=None)
DB_ENGINE = env('DB_ENGINE', default='django.db.backends.sqlite3')

if DATABASE_URL and hasattr(env, 'db'):
    try:
        DATABASES = {'default': env.db('DATABASE_URL')}
    except Exception:
        DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
elif 'postgresql' in DB_ENGINE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME', default='skillhub_za_db'),
            'USER': env('DB_USER', default='postgres'),
            'PASSWORD': env('DB_PASSWORD', default='postgres'),
            'HOST': env('DB_HOST', default='localhost'),
            'PORT': env('DB_PORT', default='5432'),
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

# Password validation with Custom Complex Validator
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
    {'NAME': 'core.validators.ComplexPasswordValidator'},  # Requires uppercase, number, and special character
]

# Internationalization (South African standard)
LANGUAGE_CODE = 'en-za'
TIME_ZONE = 'Africa/Johannesburg'
USE_I18N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
NGROK_URL = env('NGROK_URL', default='https://engrainedly-subinvolute-silvana.ngrok-free.dev')
MEDIA_URL = f'{NGROK_URL}/media/' if NGROK_URL else '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Settings & Rate Limiting (Throttling)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/min',       # 20 requests/minute for anonymous users
        'user': '1000/day',     # 1000 requests/day for authenticated users
        'login': '5/min',       # 5 attempts/minute for login endpoint (brute force protection)
    },
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}

# SimpleJWT Configuration (Short 15-minute access lifetime + Rotation + Blacklist)
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # 15 minutes as requested
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,                # Automatically blacklist rotated tokens
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    # HttpOnly Cookie Options
    'AUTH_COOKIE': env('JWT_AUTH_COOKIE', default='refresh_token'),
    'AUTH_COOKIE_SECURE': env.bool('JWT_AUTH_COOKIE_SECURE', default=False),
    'AUTH_COOKIE_SAMESITE': env('JWT_AUTH_COOKIE_SAMESITE', default='Lax'),
    'AUTH_COOKIE_PATH': env('JWT_AUTH_COOKIE_PATH', default='/api/token/'),
}

# CORS & CSRF Configuration
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allows seamless local frontend development
CORS_ALLOWED_ORIGINS = [
    'https://aistudio.google.com',
    'https://engrainedly-subinvolute-silvana.ngrok-free.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

extra_cors = env('CORS_ALLOWED_ORIGINS', default='')
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

extra_csrf = env('CSRF_TRUSTED_ORIGINS', default='')
if extra_csrf:
    for origin in extra_csrf.split(','):
        cleaned = origin.strip()
        if cleaned and cleaned not in CSRF_TRUSTED_ORIGINS:
            CSRF_TRUSTED_ORIGINS.append(cleaned)

CORS_ALLOW_CREDENTIALS = True

# Whitelist allowed HTTP methods & request headers for tight CORS control
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Security Headers & Cookie Policies
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# In production (with HTTPS), set these to True via environment variables
SESSION_COOKIE_SECURE = env.bool('SESSION_COOKIE_SECURE', default=False)
CSRF_COOKIE_SECURE = env.bool('CSRF_COOKIE_SECURE', default=False)
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=False)

# Django Channels & Channel Layers Configuration
REDIS_URL = env('REDIS_URL', default='')
USE_REDIS_CHANNEL_LAYER = env.bool('USE_REDIS_CHANNEL_LAYER', default=False) or bool(REDIS_URL)

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

# ==============================================================================
# DMCA & ECTA CHAPTER XI DESIGNATED COPYRIGHT AGENT
# ==============================================================================
DMCA_COPYRIGHT_AGENT = {
    'name': env('DMCA_AGENT_NAME', default='SkillHub ZA Legal Compliance & Safety Officer'),
    'organization': 'SkillHub ZA Social Enterprise (Pty) Ltd',
    'address': 'Rosebank Link, 173 Oxford Road, Rosebank, Johannesburg, 2196, South Africa',
    'email': env('DMCA_AGENT_EMAIL', default='copyright@skillhub.co.za'),
    'phone': '+27 (0) 11 555 0199',
    'online_takedown_url': 'https://skillhub.co.za/dmca',
}

