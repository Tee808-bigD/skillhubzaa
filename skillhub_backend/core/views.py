from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpResponse

def home_view(request):
    """
    Root portal landing page for SkillHub ZA backend.
    Greets developers and provides quick links to the Frontend App, Django Admin, and API.
    """
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkillHub ZA — Backend API & Services</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            background: #090d16;
            color: #f1f5f9;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .container {
            max-width: 860px;
            width: 100%;
            background: radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 28px;
            padding: 40px;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.4);
            border-radius: 9999px;
            color: #34d399;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .pulse {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
        }
        h1 {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p.subtitle {
            color: #94a3b8;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .card {
            background: rgba(30, 41, 59, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 22px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .card:hover {
            transform: translateY(-3px);
            border-color: #10b981;
            background: rgba(30, 41, 59, 0.95);
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2);
        }
        .card.featured {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%);
            border: 1px solid rgba(16, 185, 129, 0.5);
            grid-column: 1 / -1;
        }
        .card.featured:hover {
            border-color: #34d399;
            box-shadow: 0 12px 30px -5px rgba(16, 185, 129, 0.35);
        }
        .card h3 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .card p {
            color: #94a3b8;
            font-size: 13px;
            line-height: 1.5;
        }
        .endpoints {
            background: #090d16;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 20px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
        }
        .endpoint-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .endpoint-row:last-child { border-bottom: none; }
        .method {
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
        }
        .method.get { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .method.post { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .method.ws { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
        .path { color: #e2e8f0; }
        .desc { color: #64748b; }
        .footer {
            margin-top: 24px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">
            <span class="pulse"></span>
            Django Backend Operational & Online
        </div>
        <h1>SkillHub ZA Core Platform</h1>
        <p class="subtitle">
            Welcome to the SkillHub ZA backend server. The backend provides PostgreSQL/SQLite data persistence, SimpleJWT auth, Django Channels WebSockets, and media file uploads.
        </p>

        <div class="actions-grid">
            <a href="https://ais-dev-wpw2m4fr3roxl4gjfcn5tt-942979450406.europe-west2.run.app" target="_blank" class="card featured">
                <div>
                    <h3>🚀 Open Full SkillHub ZA Web App <span style="font-size: 14px;">↗</span></h3>
                    <p>Launch the complete interactive React frontend with Feed, Video Reels, Youth Artisan Marketplace, Real-time Chat, and Profile management.</p>
                </div>
            </a>

            <a href="/admin/" class="card">
                <div>
                    <h3>🔐 Django Admin</h3>
                    <p>Manage users, posts, video reels, chat messages, and SETA verified artisan profiles.</p>
                </div>
            </a>

            <a href="/api/" class="card">
                <div>
                    <h3>⚡ Browsable API</h3>
                    <p>Explore all REST endpoints including /api/posts/, /api/users/, and /api/reels/.</p>
                </div>
            </a>

            <a href="/api/token/" class="card">
                <div>
                    <h3>🔑 JWT Auth Token</h3>
                    <p>Authenticate and obtain JSON Web Tokens for client sessions.</p>
                </div>
            </a>
        </div>

        <div class="endpoints">
            <div style="font-weight: 700; color: #94a3b8; margin-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Registered Platform Endpoints</div>
            <div class="endpoint-row">
                <span><span class="method get">GET</span> <span class="path">/api/posts/</span></span>
                <span class="desc">Social feeds & media uploads</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method post">POST</span> <span class="path">/api/token/</span></span>
                <span class="desc">SimpleJWT authentication</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method post">PATCH</span> <span class="path">/api/users/upload_avatar/</span></span>
                <span class="desc">User avatar image uploads</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method ws">WS</span> <span class="path">ws://127.0.0.1:8000/ws/chat/&lt;room_id&gt;/</span></span>
                <span class="desc">Real-time WebSocket chat</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method get">GET</span> <span class="path">/admin/</span></span>
                <span class="desc">Django Superuser dashboard</span>
            </div>
        </div>

        <div class="footer">
            SkillHub ZA &bull; South Africa Youth Artisan & Skill-Sharing Platform
        </div>
    </div>
</body>
</html>"""
    return HttpResponse(html_content)


from .models import User, Profile, Post, Comment, Like, Event, Service, Reel, Message, ChatRoom
from .serializers import (
    UserSerializer,
    UserSummarySerializer,
    CustomTokenObtainPairSerializer,
    ProfileSerializer,
    PostSerializer,
    CommentSerializer,
    LikeSerializer,
    EventSerializer,
    ServiceSerializer,
    ReelSerializer,
    MessageSerializer,
    ChatRoomSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Token view returning access token, refresh token, and authenticated user info.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing users.
    Supports avatar uploads via /api/users/upload_avatar/ or /api/users/me/.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'skills', 'location']

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """
        Get or partially update current authenticated user profile.
        """
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['patch', 'post'],
        permission_classes=[permissions.IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser]
    )
    def upload_avatar(self, request):
        """
        Dedicated endpoint to upload a new avatar image for authenticated user.
        Accepts multipart/form-data with 'avatar' file field.
        """
        user = request.user
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response(
                {'error': 'No image file uploaded. Expected multipart/form-data with "avatar" key.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.avatar = avatar_file
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint for social feed posts.
    Supports creating, listing, viewing, deleting, and liking posts with multipart/form-data image/video uploads.
    """
    queryset = Post.objects.select_related('author').prefetch_related('comments', 'likes').all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'category', 'author__username']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_like(self, request, pk=None):
        """
        Toggle like on a post. If already liked, unlike it. If not liked, add like.
        """
        post = self.get_object()
        user = request.user
        existing_like = Like.objects.filter(post=post, user=user).first()

        if existing_like:
            existing_like.delete()
            liked = False
        else:
            Like.objects.create(post=post, user=user)
            liked = True

        return Response({
            'status': 'success',
            'is_liked': liked,
            'likes_count': post.likes.count(),
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """Alias for toggle_like"""
        return self.toggle_like(request, pk)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        """
        Retrieve comments or add a new comment to this post.
        """
        post = self.get_object()

        if request.method == 'GET':
            comments = post.comments.select_related('author').all()
            serializer = CommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)

        elif request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            serializer = CommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(post=post, author=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for comments.
    """
    queryset = Comment.objects.select_related('author', 'post').all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class LikeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to list likes.
    """
    queryset = Like.objects.select_related('user', 'post').all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for community events and workshops.
    """
    queryset = Event.objects.select_related('organizer').prefetch_related('attendees').all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'location', 'category']

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rsvp(self, request, pk=None):
        """
        Toggle RSVP attendance for this event.
        """
        event = self.get_object()
        user = request.user

        if event.attendees.filter(id=user.id).exists():
            event.attendees.remove(user)
            attending = False
        else:
            event.attendees.add(user)
            attending = True

        return Response({
            'status': 'success',
            'is_attending': attending,
            'attendees_count': event.attendees.count(),
        }, status=status.HTTP_200_OK)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for youth artisan and freelance service marketplace.
    """
    queryset = Service.objects.select_related('provider').all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category', 'provider__username']

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)


class ReelViewSet(viewsets.ModelViewSet):
    """
    API endpoint for short video reels with video file upload support.
    """
    queryset = Reel.objects.select_related('author').all()
    serializer_class = ReelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['caption', 'audio_track', 'author__username']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class AvatarUpdateView(generics.UpdateAPIView):
    """
    Dedicated view for uploading and updating current user avatar.
    Accepts PATCH /api/users/avatar/ or /api/avatar/ with multipart/form-data.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.request.user
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response(
                {'error': 'No file uploaded. Expected "avatar" file field.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.avatar = avatar_file
        user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Real-Time Chat Rooms & Direct Messaging Conversations.
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(participants=user).prefetch_related('participants', 'messages').distinct()

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Fetch chronological message history for a specific room.
        """
        room = self.get_object()
        msgs = room.messages.select_related('sender').order_by('timestamp')
        serializer = MessageSerializer(msgs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def direct(self, request):
        """
        Get or create a 1-on-1 private chat room with another user.
        Payload: { "participant_id": "usr_..." } or { "participant_username": "..." }
        """
        user = request.user
        other_user_id = request.data.get('participant_id')
        other_username = request.data.get('participant_username')

        if not other_user_id and not other_username:
            return Response(
                {'detail': 'Either participant_id or participant_username is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if other_user_id:
                other_user = User.objects.get(pk=other_user_id)
            else:
                other_user = User.objects.get(username=other_username)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if direct 1-on-1 room between these 2 users already exists
        existing_rooms = ChatRoom.objects.filter(participants=user).filter(participants=other_user)
        for r in existing_rooms:
            if r.participants.count() == 2:
                serializer = self.get_serializer(r)
                return Response(serializer.data, status=status.HTTP_200_OK)

        # Create new direct room
        room = ChatRoom.objects.create(name=f"{user.username} & {other_user.username}")
        room.participants.add(user, other_user)
        serializer = self.get_serializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for chat messages with room filtering and chronological ordering.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.select_related('sender', 'room').order_by('timestamp')
        
        # Support filtering by room_id
        room_id = self.request.query_params.get('room_id') or self.request.query_params.get('room')
        if room_id:
            return queryset.filter(room_id=room_id, room__participants=user)

        return queryset.filter(Q(sender=user) | Q(receiver=user) | Q(room__participants=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
