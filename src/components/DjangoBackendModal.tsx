import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  Database, 
  Globe, 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Server, 
  Layers, 
  FolderTree, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface DjangoBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'models' | 'api_console' | 'code' | 'commands';

export const DjangoBackendModal: React.FC<DjangoBackendModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // API Console State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/posts');
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{\n  "content": "Testing SkillHub ZA Django DRF migration live!",\n  "category": "Tech & Coding"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [backendSummary, setBackendSummary] = useState<any>(null);

  // Selected code file for preview
  const [selectedCodeFile, setSelectedCodeFile] = useState<
    'middleware' | 'consumers' | 'routing' | 'asgi' | 'models' | 'serializers' | 'views' | 'settings' | 'admin' | 'urls'
  >('middleware');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/django/summary')
        .then(res => res.json())
        .then(data => setBackendSummary(data))
        .catch(err => console.error('Failed to load Django summary:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const options: RequestInit = {
        method: selectedMethod,
        headers: { 'Content-Type': 'application/json' }
      };
      if (selectedMethod === 'POST' && requestBody) {
        options.body = requestBody;
      }
      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message || 'API request failed' });
    } finally {
      setApiLoading(false);
    }
  };

  const modelsList = [
    {
      name: 'User',
      extends: 'AbstractUser',
      description: 'South African creator & learner identity with skills, province, SETA verification, and creator status.',
      fields: ['bio (TextField)', 'avatar (URLField)', 'location (CharField)', 'province (Choices)', 'skills (JSONField)', 'is_creator (BooleanField)', 'role (Choices)', 'seta_verified (BooleanField)']
    },
    {
      name: 'Profile',
      extends: 'models.Model (OneToOne: User)',
      description: 'Extended applicant profile with educational status and verification certificates count.',
      fields: ['user (OneToOneField User)', 'phone (CharField)', 'education_level (CharField)', 'matric_year (IntegerField)', 'certificates_count (PositiveIntegerField)']
    },
    {
      name: 'Post',
      extends: 'models.Model',
      description: 'Core social feed unit supporting text, image portfolios, video reels, and hashtags.',
      fields: ['author (ForeignKey User)', 'content (TextField)', 'media_type (Choices)', 'media_url (URLField)', 'video_url (URLField)', 'category (CharField)', 'hashtags (JSONField)']
    },
    {
      name: 'Comment',
      extends: 'models.Model',
      description: 'Discussion threads nested under posts with real-time author attribution.',
      fields: ['post (ForeignKey Post)', 'author (ForeignKey User)', 'content (TextField)', 'created_at (DateTimeField)']
    },
    {
      name: 'Like',
      extends: 'models.Model',
      description: 'Reaction tracking with strict database-level unique constraint preventing double-likes.',
      fields: ['post (ForeignKey Post)', 'user (ForeignKey User)', 'unique_together: [post, user]']
    },
    {
      name: 'Event',
      extends: 'models.Model',
      description: 'SETA career summits, coding bootcamps, and trade workshops with RSVP tracking.',
      fields: ['title (CharField)', 'description (TextField)', 'date (DateTimeField)', 'location (CharField)', 'organizer (ForeignKey User)', 'attendees (ManyToMany User)']
    },
    {
      name: 'Service',
      extends: 'models.Model',
      description: 'Youth freelance marketplace listings with pricing in South African Rands (ZAR).',
      fields: ['title (CharField)', 'provider (ForeignKey User)', 'price (DecimalField ZAR)', 'price_unit (project/hour/day)', 'category (Choices)', 'verified_youth (BooleanField)']
    },
    {
      name: 'Reel',
      extends: 'models.Model',
      description: 'Short vertical video showcase for artisans and digital creators.',
      fields: ['author (ForeignKey User)', 'video_url (URLField)', 'caption (TextField)', 'audio_track (CharField)', 'tags (JSONField)']
    }
  ];

  const codeSnippets: Record<string, string> = {
    models: `# skillhub_backend/core/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    bio = models.TextField(blank=True, default='')
    # Phase 4: ImageField for avatars
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    location = models.CharField(max-width=150, default='Johannesburg, South Africa')
    province = models.CharField(max-width=50, default='Gauteng')
    skills = models.JSONField(default=list, blank=True)
    is_creator = models.BooleanField(default=False)
    role = models.CharField(max-width=20, default='youth')
    seta_verified = models.BooleanField(default=False)

class Post(models.Model):
    MEDIA_TYPES = (
        ('text', 'Text Post'),
        ('image', 'Image Portfolio'),
        ('video', 'Video Clip'),
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    media_type = models.CharField(max-width=10, choices=MEDIA_TYPES, default='text')
    # Phase 4: ImageField & FileField for Post uploads
    media_file = models.ImageField(upload_to='posts/media/', blank=True, null=True)
    video_file = models.FileField(upload_to='posts/videos/', blank=True, null=True)
    media_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    category = models.CharField(max-width=50, default='General')
    hashtags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Reel(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reels')
    # Phase 4: FileField for Reels
    video_url = models.FileField(upload_to='reels/videos/')
    caption = models.TextField(blank=True)
    audio_track = models.CharField(max-width=120, default='Original Audio')
    created_at = models.DateTimeField(auto_now_add=True)`,

    serializers: `# skillhub_backend/core/serializers.py
from rest_framework import serializers
from .models import User, Post, Reel, Comment

class UserSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'avatar', 'location', 'is_creator']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class PostSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    media_type = serializers.CharField(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'media_type',
            'media_file', 'video_file', 'media_url', 'video_url',
            'category', 'hashtags', 'likes_count', 'comments_count', 'created_at'
        ]

    def create(self, validated_data):
        # Auto-calculate media_type based on uploaded file
        if validated_data.get('video_file'):
            validated_data['media_type'] = 'video'
        elif validated_data.get('media_file'):
            validated_data['media_type'] = 'image'
        else:
            validated_data['media_type'] = 'text'
        return super().create(validated_data)

class ReelSerializer(serializers.ModelSerializer):
    author = UserSummarySerializer(read_only=True)
    video_url = serializers.FileField()

    class Meta:
        model = Reel
        fields = ['id', 'author', 'video_url', 'caption', 'audio_track', 'created_at']`,

    views: `# skillhub_backend/core/views.py
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import User, Post, Reel
from .serializers import UserSerializer, PostSerializer, ReelSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @action(detail=False, methods=['patch', 'post'], permission_classes=[permissions.IsAuthenticated])
    def upload_avatar(self, request):
        user = request.user
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'error': 'No avatar file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        user.avatar = avatar_file
        user.save()
        return Response(UserSerializer(user, context={'request': request}).data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ReelViewSet(viewsets.ModelViewSet):
    queryset = Reel.objects.all()
    serializer_class = ReelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class AvatarUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user`,

    middleware: `# skillhub_backend/core/middleware.py
import urllib.parse
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token['user_id'])
    except Exception:
        return AnonymousUser()

class JwtAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using a JWT
    passed in the query string (e.g., ws://.../?token=<access_token>).
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Parse the query string to find the token
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)`,

    consumers: `# skillhub_backend/core/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user', AnonymousUser())

        is_allowed = await self.is_user_participant(self.user, self.room_id)
        if not is_allowed:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        event_type = content.get('type', 'chat_message')
        if event_type == 'chat_message':
            text = (content.get('message') or content.get('content') or '').strip()
            if not text:
                return
            saved = await self.save_message(self.user, self.room_id, text)
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat.message',
                'id': str(saved['id']),
                'room_id': self.room_id,
                'content': saved['content'],
                'sender': saved['sender'],
                'timestamp': saved['timestamp'],
            })
        elif event_type == 'typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat.typing',
                'room_id': self.room_id,
                'username': self.user.username,
                'is_typing': bool(content.get('is_typing', False)),
            })

    async def chat_message(self, event):
        await self.send_json({'type': 'chat_message', **event})

    async def chat_typing(self, event):
        if event.get('username') != self.user.username:
            await self.send_json({'type': 'typing', **event})

    @database_sync_to_async
    def is_user_participant(self, user, room_id):
        if not user or not user.is_authenticated:
            return False
        try:
            return ChatRoom.objects.get(pk=room_id).participants.filter(pk=user.pk).exists()
        except Exception:
            return False

    @database_sync_to_async
    def save_message(self, user, room_id, content):
        room = ChatRoom.objects.get(pk=room_id)
        msg = Message.objects.create(room=room, sender=user, content=content, text=content)
        return {
            'id': msg.id,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'sender': {'id': user.id, 'username': user.username, 'full_name': user.get_full_name() or user.username, 'avatar': user.avatar}
        }`,

    routing: `# skillhub_backend/core/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/chat/(?P<room_id>[^/]+)/?$', consumers.ChatConsumer.as_asgi()),
]`,

    asgi: `# skillhub_backend/skillhub_backend/asgi.py
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillhub_backend.settings')
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from core.middleware import JwtAuthMiddlewareStack
import core.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JwtAuthMiddlewareStack(
        URLRouter(
            core.routing.websocket_urlpatterns
        )
    ),
})`,

    settings: `# skillhub_backend/skillhub_backend/settings.py
INSTALLED_APPS = [
    'daphne',       # MUST be top before admin
    'channels',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'core.apps.CoreConfig',
]

ASGI_APPLICATION = 'skillhub_backend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
        # For Redis in Production / Docker:
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {'hosts': [('127.0.0.1', 6379)]},
    },
}`,

    admin: `# skillhub_backend/core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, Post, Comment, Like, Event, Service, Reel, ChatRoom, Message

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'sender', 'content', 'timestamp')
    list_filter = ('room', 'timestamp')`,

    urls: `# skillhub_backend/core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, PostViewSet, CommentViewSet, LikeViewSet,
    EventViewSet, ServiceViewSet, ReelViewSet,
    ChatRoomViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'events', EventViewSet, basename='event')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'reels', ReelViewSet, basename='reel')
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')
router.register(r'chat/rooms', ChatRoomViewSet, basename='chat-room')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]`
  };

  const cliCommands = [
    { title: '1. Virtual Environment & Pillow', cmd: 'python3 -m venv venv && source venv/bin/activate && pip install pillow' },
    { title: '2. Install Daphne & Channels', cmd: 'pip install daphne channels channels-redis redis' },
    { title: '3. Run Migrations for File Fields (Post, Reel, Avatar)', cmd: 'python manage.py makemigrations core && python manage.py migrate' },
    { title: '4. Start ASGI / Django Server', cmd: 'python manage.py runserver 8000' },
    { title: '5. Test Image Upload via cURL (MultiPartParser)', cmd: 'curl -X POST http://127.0.0.1:8000/api/posts/ -H "Authorization: Bearer YOUR_TOKEN" -F "content=Testing image upload" -F "category=Tech" -F "media_file=@sample.jpg"' },
    { title: '6. Test Avatar Upload via PATCH', cmd: 'curl -X PATCH http://127.0.0.1:8000/api/users/upload_avatar/ -H "Authorization: Bearer YOUR_TOKEN" -F "avatar=@my_photo.png"' },
    { title: '7. Verify Uploads in Media Folder', cmd: 'ls -la media/posts/media/ && ls -la media/avatars/' },
    { title: '8. Test WebSockets via wscat (Local)', cmd: 'wscat -c "ws://127.0.0.1:8000/ws/chat/1/?token=YOUR_JWT_ACCESS_TOKEN"' },
    { title: '9. Test Remote WebSockets via Ngrok', cmd: 'ngrok http 8000  # Connect via wss://<subdomain>.ngrok-free.app/ws/chat/1/?token=YOUR_JWT' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Django REST Backend</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Phase 1 Ready
                </span>
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  DRF Router Active
                </span>
              </div>
              <p className="text-xs text-slate-400">skillhub_backend • Python 3.10+ • DRF • PostgreSQL / SQLite3</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Architecture Overview
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'models'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Data Models ({modelsList.length})
          </button>

          <button
            onClick={() => setActiveTab('api_console')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'api_console'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            Live DRF API Console
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'code'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code Inspector
          </button>

          <button
            onClick={() => setActiveTab('commands')}
            className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
              activeTab === 'commands'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            CLI & Migrations
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                    <Database className="w-4 h-4" />
                    <span>Relational Schema</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Custom <span className="text-emerald-300 font-mono">core.User</span> model extending <span className="font-mono text-slate-200">AbstractUser</span> with integrated Profiles, Posts, Comments, unique Likes, Events, Services, and Reels.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-2">
                    <Globe className="w-4 h-4" />
                    <span>DRF Router & Serializers</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Auto-generated RESTful endpoints with pagination, nested user representations, and custom actions like <span className="font-mono text-teal-300">/api/posts/1/like/</span> and <span className="font-mono text-teal-300">/api/events/1/rsvp/</span>.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Django Admin Ready</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Customized admin dashboards with inline comments/likes, list filters, search fields, date hierarchies, and SETA verification toggles.
                  </p>
                </div>
              </div>

              {/* Directory Structure */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between mb-3 text-slate-400 font-bold border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-emerald-400" />
                    Project File Tree (/skillhub_backend)
                  </span>
                  <span className="text-[11px] text-emerald-400">All Files Generated in Workspace</span>
                </div>
                <pre className="text-slate-300 leading-relaxed">
{`skillhub_backend/
├── manage.py                     # Django management utility
├── requirements.txt              # Django, DRF, CORS, Pillow, psycopg2
├── .env.example                  # Environment configuration
├── skillhub_backend/             # Project settings package
│   ├── settings.py               # DRF, Custom User, CORS, DB config
│   ├── urls.py                   # Root router (/admin/ & /api/)
│   ├── wsgi.py                   # Production WSGI entry point
│   └── asgi.py                   # ASGI for future Channels
└── core/                         # Main application package
    ├── models.py                 # 8 Relational Models + __str__ + constraints
    ├── signals.py                # Auto-creates Profile on User creation
    ├── admin.py                  # Custom ModelAdmin registrations
    ├── serializers.py            # ModelSerializers with nested data
    ├── views.py                  # ModelViewSets with custom actions
    └── urls.py                   # DRF DefaultRouter`}
                </pre>
              </div>

              {/* Quick Start Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('api_console')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                  <Play className="w-4 h-4" />
                  Test Live DRF API Console
                </button>
                <button
                  onClick={() => setActiveTab('commands')}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                >
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  View Migration Commands
                </button>
              </div>
            </div>
          )}

          {/* DATA MODELS TAB */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Designed to map the SkillHub ZA frontend features into robust relational tables with foreign keys and strict constraints:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modelsList.map((m) => (
                  <div key={m.name} className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white font-mono">{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({m.extends})</span>
                      </div>
                      <span className="text-[10px] bg-slate-700/80 text-emerald-400 font-bold px-2 py-0.5 rounded">
                        core.models.{m.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{m.description}</p>
                    <div className="pt-2 border-t border-slate-700/50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fields & Relations:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.fields.map((f, i) => (
                          <span key={i} className="text-[11px] font-mono bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIVE DRF API CONSOLE TAB */}
          {activeTab === 'api_console' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex rounded-xl overflow-hidden border border-slate-700 shrink-0">
                    <button
                      onClick={() => setSelectedMethod('GET')}
                      className={`px-3 py-2 text-xs font-bold transition-all ${
                        selectedMethod === 'GET' ? 'bg-emerald-600 text-slate-950' : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      GET
                    </button>
                    <button
                      onClick={() => setSelectedMethod('POST')}
                      className={`px-3 py-2 text-xs font-bold transition-all ${
                        selectedMethod === 'POST' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      POST
                    </button>
                  </div>

                  <select
                    value={selectedEndpoint}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedEndpoint(val);
                      if (val.includes('/api/token')) {
                        setSelectedMethod('POST');
                        setRequestBody('{\n  "username": "thando_dev",\n  "password": "SkillHubZA2026!"\n}');
                      } else if (val.includes('/api/posts') && selectedMethod === 'POST') {
                        setRequestBody('{\n  "content": "Testing SkillHub ZA Django DRF migration live!",\n  "category": "Tech & Coding"\n}');
                      }
                    }}
                    className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="/api/posts">/api/posts/ (List & Create Posts)</option>
                    <option value="/api/token/">/api/token/ (POST: SimpleJWT Obtain Tokens)</option>
                    <option value="/api/token/refresh/">/api/token/refresh/ (POST: Refresh Access Token)</option>
                    <option value="/api/users/me/">/api/users/me/ (GET: Authenticated User Profile)</option>
                    <option value="/api/posts/post_1/toggle_like/">/api/posts/post_1/toggle_like/ (POST: Toggle Like Custom Action)</option>
                    <option value="/api/posts/post_1/like">/api/posts/post_1/like/ (POST: Toggle Like Alias)</option>
                    <option value="/api/posts/post_1/comments">/api/posts/post_1/comments/ (Post Comments)</option>
                    <option value="/api/events">/api/events/ (Community Events)</option>
                    <option value="/api/events/evt_1/rsvp">/api/events/evt_1/rsvp/ (Toggle Event RSVP)</option>
                    <option value="/api/services">/api/services/ (Freelance Service Listings)</option>
                    <option value="/api/django/summary">/api/django/summary (Django Architecture Spec)</option>
                  </select>

                  <button
                    onClick={handleRunApiTest}
                    disabled={apiLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 disabled:opacity-50"
                  >
                    {apiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Send Request</span>
                  </button>
                </div>

                {selectedMethod === 'POST' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Request JSON Body:
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 text-slate-200 text-xs font-mono p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Response Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <span className="font-bold flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    Response Output (Status: {apiResponse ? (apiResponse.error ? '500 Error' : '200 OK') : 'Idle'})
                  </span>
                  {apiResponse && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(apiResponse, null, 2), 'response')}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy JSON</span>
                    </button>
                  )}
                </div>
                <pre className="text-emerald-400 overflow-x-auto max-h-72 leading-relaxed">
                  {apiResponse 
                    ? JSON.stringify(apiResponse, null, 2) 
                    : '// Click "Send Request" above to test the live DRF API endpoint response'}
                </pre>
              </div>
            </div>
          )}

          {/* CODE INSPECTOR TAB */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {([
                  'middleware',
                  'consumers',
                  'routing',
                  'asgi',
                  'models',
                  'serializers',
                  'views',
                  'settings',
                  'admin',
                  'urls'
                ] as const).map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedCodeFile(file)}
                    className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                      selectedCodeFile === file
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {file === 'middleware' ? 'middleware.py (JWT WS)' : `${file}.py`}
                  </button>
                ))}
              </div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-slate-400 font-bold">
                    {selectedCodeFile === 'asgi' || selectedCodeFile === 'settings'
                      ? `skillhub_backend/skillhub_backend/${selectedCodeFile}.py`
                      : `skillhub_backend/core/${selectedCodeFile}.py`}
                  </span>
                  <button
                    onClick={() => handleCopy(codeSnippets[selectedCodeFile], selectedCodeFile)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {copiedKey === selectedCodeFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy File</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-slate-200 overflow-x-auto max-h-96 leading-relaxed">
                  {codeSnippets[selectedCodeFile]}
                </pre>
              </div>
            </div>
          )}

          {/* COMMANDS & MIGRATIONS TAB */}
          {activeTab === 'commands' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Execute these commands in your terminal to initialize and run the Django backend locally:
              </p>
              <div className="space-y-3">
                {cliCommands.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block mb-1">{item.title}</span>
                      <code className="text-xs font-mono text-emerald-400 break-all select-all">{item.cmd}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(item.cmd, `cmd_${idx}`)}
                      className="self-end sm:self-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-sans flex items-center gap-1.5 transition-all shrink-0"
                    >
                      {copiedKey === `cmd_${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Step-by-Step Two-Browser Test Guide */}
              <div className="bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-700/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>🛠️ Phase 3 Two-Browser Real-Time WebSocket Test</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Window 1: Normal Browser
                    </span>
                    <p className="text-slate-300">
                      1. Log in as <code className="text-emerald-400 font-mono">thando_dev</code> (Password: <code className="text-emerald-400 font-mono">SkillHubZA2026!</code>).
                    </p>
                    <p className="text-slate-300">
                      2. Navigate to <strong>Messages</strong> and select <strong>Chat Room #1</strong>.
                    </p>
                    <p className="text-slate-400">
                      Verify the <span className="text-emerald-400 font-semibold">🟢 Channels WS</span> active indicator.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      Window 2: Incognito / Private
                    </span>
                    <p className="text-slate-300">
                      1. Open Incognito window and log in as <code className="text-indigo-400 font-mono">lerato_solar</code> (Password: <code className="text-indigo-400 font-mono">SkillHubZA2026!</code>).
                    </p>
                    <p className="text-slate-300">
                      2. Open the same <strong>Chat Room #1</strong>.
                    </p>
                    <p className="text-slate-400">
                      Both windows are now authenticated via <code className="text-amber-300 font-mono">JwtAuthMiddleware</code>!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-lg text-xs space-y-1 text-slate-300">
                  <p className="font-bold text-white mb-1">What to verify:</p>
                  <p>✨ <strong>Typing indicators:</strong> Start typing in Window 1 — Window 2 shows <em>"thando_dev is typing..."</em></p>
                  <p>⚡ <strong>Real-time broadcast:</strong> Hit send in Window 1 — message instantly pops up in Window 2 without refreshing.</p>
                  <p>💾 <strong>Database persistence:</strong> Visit <code className="text-emerald-400 font-mono">http://127.0.0.1:8000/admin/</code> and check the Messages table — every message is saved to PostgreSQL/SQLite.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Django Backend Phase 1 Initialized</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-1.5 rounded-xl border border-slate-700 transition-all"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  );
};
