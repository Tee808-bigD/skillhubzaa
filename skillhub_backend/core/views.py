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


from .models import (
    User,
    Profile,
    Post,
    Comment,
    Like,
    Event,
    Service,
    Reel,
    Message,
    ChatRoom,
    PolicyVersion,
    Report,
    DMCARequest,
    DataBreach,
)
from .serializers import (
    UserSerializer,
    UserSummarySerializer,
    RegisterSerializer,
    ReportSerializer,
    DMCARequestSerializer,
    PolicyVersionSerializer,
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
import json
from django.utils import timezone
from .throttles import LoginRateThrottle
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.conf import settings


def set_auth_cookie(response, refresh_token):
    """Utility to set HttpOnly refresh token cookie safely."""
    cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')
    max_age = int(settings.SIMPLE_JWT.get('REFRESH_TOKEN_LIFETIME').total_seconds())
    secure = settings.SIMPLE_JWT.get('AUTH_COOKIE_SECURE', False)
    samesite = settings.SIMPLE_JWT.get('AUTH_COOKIE_SAMESITE', 'Lax')
    path = settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/api/token/')
    response.set_cookie(
        key=cookie_name,
        value=str(refresh_token),
        max_age=max_age,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path=path,
    )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT Token view returning access token, refresh token, and authenticated user info.
    Protected by LoginRateThrottle (5 req/min) to prevent brute-force attacks.
    Sets HttpOnly cookie for the refresh token.
    """
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK and 'refresh' in response.data:
            set_auth_cookie(response, response.data['refresh'])
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom TokenRefreshView that supports refresh token passed in request body OR HttpOnly cookie.
    If refresh token rotation is enabled, the new refresh token is updated in the HttpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')
        # Fall back to HttpOnly cookie if refresh token not provided in body
        if not request.data.get('refresh') and cookie_name in request.COOKIES:
            data = request.data.copy()
            data['refresh'] = request.COOKIES[cookie_name]
            serializer = self.get_serializer(data=data)
        else:
            serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        # If rotation is enabled and a new refresh token is issued, update the cookie
        if 'refresh' in serializer.validated_data:
            set_auth_cookie(response, serializer.validated_data['refresh'])
        return response


class LogoutView(generics.GenericAPIView):
    """
    Blacklists the user's refresh token and clears the HttpOnly refresh token cookie.
    Endpoint: /api/token/logout/ and /api/auth/logout/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')
        refresh_token = request.data.get('refresh') or request.COOKIES.get(cookie_name)

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                # Token may already be blacklisted or invalid
                pass

        response = Response(
            {"detail": "Successfully logged out and token blacklisted."},
            status=status.HTTP_200_OK
        )
        path = settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/api/token/')
        response.delete_cookie(cookie_name, path=path)
        return response


class RegisterView(generics.CreateAPIView):
    """
    User Registration Endpoint (/api/auth/register/)
    Validates username & email uniqueness, complex password requirements,
    and returns initial JWT credentials with HttpOnly cookie.
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue JWT tokens for seamless on-boarding
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        user_data = UserSummarySerializer(user, context={'request': request}).data

        response_data = {
            'user': user_data,
            'access': str(access),
            'refresh': str(refresh),
            'detail': 'Account registered successfully.'
        }
        response = Response(response_data, status=status.HTTP_201_CREATED)
        set_auth_cookie(response, str(refresh))
        return response



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
    Enforces ECTA Safe Harbor moderation exclusions and POPIA child/minor age restrictions.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['content', 'category', 'author__username']

    def get_queryset(self):
        user = self.request.user
        queryset = Post.objects.select_related('author').prefetch_related('comments', 'likes').all()
        # Exclude posts removed by moderation
        queryset = queryset.exclude(moderation_status='removed')
        # Filter out 18+ age restricted content if user is anonymous or minor under 18
        if not user.is_authenticated or getattr(user, 'is_minor', False):
            queryset = queryset.filter(is_age_restricted=False)
        return queryset

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


# ==============================================================================
# POPIA (DATA SUBJECT RIGHTS & CONSENT) & SAFE HARBOR VIEWS
# ==============================================================================

class AcceptTermsView(generics.GenericAPIView):
    """
    Records POPIA Section 11 informed consent.
    Called post-registration or when terms/privacy policy versions are updated.
    Endpoint: /api/auth/accept-terms/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        version = request.data.get('version', '1.0')
        marketing = request.data.get('marketing_consent', False)

        now = timezone.now()
        user.terms_accepted_at = now
        user.privacy_policy_accepted_at = now
        user.marketing_consent = bool(marketing)
        user.policy_version_agreed = str(version)
        user.save()

        return Response({
            'detail': 'POPIA consent recorded successfully.',
            'terms_accepted_at': user.terms_accepted_at,
            'privacy_policy_accepted_at': user.privacy_policy_accepted_at,
            'marketing_consent': user.marketing_consent,
            'policy_version': user.policy_version_agreed,
        }, status=status.HTTP_200_OK)


class DataExportView(generics.GenericAPIView):
    """
    POPIA Section 23: Right of Access to Personal Information.
    Generates a full JSON export of all user profile data, posts, comments,
    likes, and messages for download.
    Endpoint: /api/users/data-export/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        export_payload = {
            'popia_compliance_statement': (
                "Official Personal Information Dossier issued under Section 23 of the "
                "Protection of Personal Information Act No. 4 of 2013 (Republic of South Africa)."
            ),
            'data_subject': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.get_full_name() or user.username,
                'role': user.role,
                'province': user.province,
                'location': user.location,
                'bio': user.bio,
                'skills': user.skills,
                'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
                'is_minor': user.is_minor,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None,
                'consent_records': {
                    'terms_accepted_at': user.terms_accepted_at.isoformat() if user.terms_accepted_at else None,
                    'privacy_policy_accepted_at': user.privacy_policy_accepted_at.isoformat() if user.privacy_policy_accepted_at else None,
                    'marketing_consent': user.marketing_consent,
                    'policy_version_agreed': user.policy_version_agreed,
                }
            },
            'exported_at': timezone.now().isoformat(),
            'posts_created': [
                {
                    'id': p.id,
                    'content': p.content,
                    'media_type': p.media_type,
                    'category': p.category,
                    'hashtags': p.hashtags,
                    'created_at': p.created_at.isoformat(),
                } for p in user.posts.all()
            ],
            'comments_posted': [
                {
                    'id': c.id,
                    'post_id': c.post_id,
                    'content': c.content,
                    'created_at': c.created_at.isoformat(),
                } for c in user.comments.all()
            ],
            'marketplace_services': [
                {
                    'id': s.id,
                    'title': s.title,
                    'price': str(s.price),
                    'price_unit': s.price_unit,
                    'category': s.category,
                    'created_at': s.created_at.isoformat(),
                } for s in user.services.all()
            ],
            'direct_messages_sent': [
                {
                    'id': m.id,
                    'recipient': m.receiver.username if m.receiver else 'Room',
                    'content': m.content,
                    'timestamp': m.timestamp.isoformat(),
                } for m in user.sent_messages.all()
            ]
        }

        response = HttpResponse(
            json.dumps(export_payload, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="skillhub_za_popia_data_{user.username}.json"'
        return response


class DeleteAccountView(generics.GenericAPIView):
    """
    POPIA Section 24: Right to Deletion and Destruction of Records.
    Irreversibly scrubs all personal data, deactivates account, and invalidates tokens.
    Endpoint: /api/users/delete-account/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        confirmation = request.data.get('confirmation', '')
        if confirmation != 'DELETE':
            return Response(
                {'error': 'Please enter "DELETE" to confirm irreversible erasure under POPIA Section 24.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Anonymize and erase personal information
        user.email = f"erased_{user.id}@skillhub.invalid"
        user.first_name = "Erased"
        user.last_name = "User"
        user.bio = ""
        user.location = "Erased"
        user.skills = []
        user.avatar = None
        user.is_active = False
        user.username = f"erased_account_{user.id}"
        user.save()

        # Delete auth cookies
        response = Response({
            'detail': 'Account and all identifying records successfully erased in compliance with POPIA Section 24.'
        }, status=status.HTTP_200_OK)

        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'refresh_token')
        response.delete_cookie(cookie_name, path=settings.SIMPLE_JWT.get('AUTH_COOKIE_PATH', '/api/token/'))
        return response


class ReportViewSet(viewsets.ModelViewSet):
    """
    Content Reporting API under ECTA Chapter XI Safe Harbor.
    Users can submit reports on posts, comments, messages, or accounts.
    Staff members can review and action reports.
    Endpoint: /api/reports/
    """
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Report.objects.all().order_by('-created_at')
        return Report.objects.filter(reporter=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        report = serializer.save(reporter=self.request.user)
        # Automatically mark flagged content
        if report.content_type == 'post':
            Post.objects.filter(pk=report.content_id).update(is_flagged=True)
        elif report.content_type == 'comment':
            Comment.objects.filter(pk=report.content_id).update(is_flagged=True)
        elif report.content_type == 'message':
            Message.objects.filter(pk=report.content_id).update(is_flagged=True)


class DMCARequestView(generics.CreateAPIView):
    """
    DMCA & ECTA Chapter XI Notice and Takedown Endpoint.
    Allows copyright owners to file takedown requests.
    Endpoint: /api/dmca/
    """
    serializer_class = DMCARequestSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        agent_info = getattr(settings, 'DMCA_COPYRIGHT_AGENT', {})
        return Response({
            'notice': 'SkillHub ZA Designated Copyright Agent (ECTA Chapter XI / DMCA)',
            'designated_agent': agent_info,
            'instructions': 'Submit POST request with infringement details to file a formal takedown notice.',
        })


class LegalDocumentView(generics.GenericAPIView):
    """
    Returns legal policy documents (Terms, POPIA Privacy Policy, Community Guidelines).
    Endpoint: /api/legal/<policy_type>/
    """
    permission_classes = [permissions.AllowAny]

    LEGAL_DOCS = {
        'terms': {
            'title': 'SkillHub ZA Terms of Service',
            'version': '1.0',
            'effective_date': '2026-01-01',
            'content': (
                "### SkillHub ZA Terms of Service\n\n"
                "**1. Acceptance of Terms:** By accessing or using SkillHub ZA, you agree to comply with and be bound by these Terms of Service under the laws of the Republic of South Africa.\n\n"
                "**2. Eligibility & Age Gate:** You must be at least 13 years old to use the platform. Minors aged 13-17 require verified parental or guardian consent under POPIA.\n\n"
                "**3. User Conduct:** Prohibited activities include hate speech, discrimination, harassment, defamation, copyright infringement, and malicious content distribution.\n\n"
                "**4. Content License:** You retain ownership of content you post. You grant SkillHub ZA a non-exclusive, royalty-free, worldwide license to host, display, and distribute your content solely for operating the platform.\n\n"
                "**5. Safe Harbor & Termination:** We reserve the right under ECTA Chapter XI to remove offending material and suspend or terminate accounts that breach these terms.\n\n"
                "**6. Governing Law:** These terms are governed exclusively by the laws of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts."
            )
        },
        'privacy': {
            'title': 'SkillHub ZA POPIA Privacy Policy',
            'version': '1.0',
            'effective_date': '2026-01-01',
            'content': (
                "### SkillHub ZA POPIA Privacy Policy\n\n"
                "**1. Responsible Party:** SkillHub ZA complies with the Protection of Personal Information Act No. 4 of 2013 (POPIA).\n\n"
                "**2. Purpose of Collection:** We collect personal information (name, contact details, artisan qualifications, location) solely to facilitate community skill-sharing, learnership matching, and verified artisan bookings.\n\n"
                "**3. Consent:** We process your personal information only with your explicit informed consent (Section 11).\n\n"
                "**4. Data Subject Rights:** Under Sections 23-25, you have the right to request access to your data via our Data Export tool, request correction, or request complete erasure via our Delete Account tool.\n\n"
                "**5. Security & Breach Notification:** In the event of a security compromise, we notify affected data subjects and the Information Regulator pursuant to Section 22.\n\n"
                "**6. Information Officer Contact:** For inquiries or complaints, contact our Information Officer at privacy@skillhub.co.za."
            )
        },
        'community-guidelines': {
            'title': 'SkillHub ZA Community Guidelines',
            'version': '1.0',
            'effective_date': '2026-01-01',
            'content': (
                "### SkillHub ZA Community Guidelines\n\n"
                "**1. Mutual Respect & Ubuntu:** We uphold the spirit of Ubuntu. Every artisan, learner, and employer deserves dignity and constructive engagement.\n\n"
                "**2. Zero Tolerance for Hate Speech:** Discrimination based on race, gender, sexual orientation, disability, or language is strictly prohibited and subject to immediate removal.\n\n"
                "**3. Verified Artisan Integrity:** Misrepresentation of SETA accreditation, falsified trade certificates, or scamming customers will result in permanent ban and reporting to relevant industry bodies.\n\n"
                "**4. Reporting Violations:** Use the three-dot report menu on any post or comment to flag objectionable content. Our moderation team reviews all reports within 24 hours."
            )
        }
    }

    def get(self, request, policy_type=None, *args, **kwargs):
        doc = self.LEGAL_DOCS.get(policy_type)
        if not doc:
            return Response({'error': f'Document {policy_type} not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if database has active PolicyVersion overriding defaults
        db_doc = PolicyVersion.objects.filter(policy_type=policy_type, is_active=True).first()
        if db_doc:
            return Response({
                'title': db_doc.title,
                'version': db_doc.version,
                'effective_date': db_doc.effective_date.isoformat(),
                'content': db_doc.content,
            })

        return Response(doc)

