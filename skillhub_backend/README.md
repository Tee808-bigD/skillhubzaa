# SkillHub ZA - Django REST Framework & React Integration (Phase 1 & 2)

Welcome to the backend & frontend integration architecture for **SkillHub ZA**, South Africa's social skill-sharing platform.

---

## 📁 Project Architecture

```
skillhub_backend/
├── manage.py                     # Django CLI
├── requirements.txt              # Django, DRF, SimpleJWT, CORS, Pillow, psycopg2
├── .env.example                  # Environment variables template
├── skillhub_backend/             # Project settings package
│   ├── settings.py               # DRF, SimpleJWT, Custom User, CORS, DB config
│   ├── urls.py                   # Root router (/admin/, /api/token/, /api/)
│   ├── wsgi.py                   # Production WSGI entry point
│   └── asgi.py                   # ASGI for future Django Channels
└── core/                         # Main application package
    ├── models.py                 # User, Profile, Post, Comment, Like, Event, Service, Reel, Message
    ├── signals.py                # Auto-creates Profile on User creation
    ├── admin.py                  # Custom ModelAdmin registrations
    ├── serializers.py            # ModelSerializers with nested representations
    ├── views.py                  # ModelViewSets with custom actions
    └── urls.py                   # DRF DefaultRouter configuration
```

---

## 🔐 Phase 2: SimpleJWT Authentication Setup

### 1. Install SimpleJWT

```bash
pip install djangorestframework-simplejwt
```

### 2. Configure `settings.py`

In `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    ...,
    'rest_framework',
    'rest_framework_simplejwt',
    'core.apps.CoreConfig',
]
```

In `REST_FRAMEWORK`:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
```

Add `SIMPLE_JWT` configuration:
```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 3. Add Token Endpoints in `skillhub_backend/urls.py`

```python
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('core.urls')),
]
```

---

## ⚡ React Frontend Integration (`src/api/`)

The React frontend communicates with Django via an Axios client configured with interceptors:

- **`src/api/client.ts`**:
  - Base URL: `http://127.0.0.1:8000/api/` (or relative `/api/`)
  - Request interceptor: reads `localStorage.getItem('access_token')` and appends `Authorization: Bearer <token>`.
  - Response interceptor: automatically handles `401 Unauthorized` by calling `/api/token/refresh/` using `refresh_token`.
- **`src/api/auth.ts`**:
  - `login(username, password)`: POSTs to `/api/token/`, stores `access_token` & `refresh_token` in `localStorage`.
  - `getCurrentUser()`: GET `/api/users/me/`
  - `logout()`: Clears tokens from `localStorage`.
- **`src/api/posts.ts`**:
  - `getPosts()`: GET `/api/posts/`
  - `createPost(data)`: POST `/api/posts/`
  - `toggleLikePost(id)`: POST `/api/posts/{id}/like/`
  - `addComment(id, text)`: POST `/api/posts/{id}/comments/`
- **`src/components/Login.tsx`**:
  - User authentication form with demo accounts (`@thando_dev`, `@lerato_solar`).
  - Sets access & refresh tokens in `localStorage`.
- **`src/components/FeedView.tsx`**:
  - `useEffect` hook triggers `getPosts()` on mount to load posts directly from the backend.
  - "Publish Post" button sends the new post payload to `createPost()` with real-time UI synchronization.

---

## 🧪 How to Test the Full Stack Connection

1. **Start Django Backend**:
   ```bash
   cd skillhub_backend
   source venv/bin/activate
   python manage.py runserver 8000
   ```
2. **Start React Frontend**:
   ```bash
   npm run dev
   ```
3. **Sign In with JWT**:
   - Click **"Sign In (JWT)"** in the sidebar or header.
   - Enter your credentials or click the quick-fill button (`@thando_dev`).
   - Confirm that the `access_token` and `refresh_token` are stored in `localStorage` under `access_token`.
4. **Publish a Post**:
   - Write a post in the feed composer and click **"Publish Post"**.
   - Check the network tab: a `POST` request is sent to `/api/posts/` with the `Authorization: Bearer <access_token>` header.
   - The post appears in the feed and is saved to the backend database!
