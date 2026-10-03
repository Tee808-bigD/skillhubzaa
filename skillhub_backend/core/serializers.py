from datetime import date
from django.utils import timezone
import uuid
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
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
)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration with username & email uniqueness,
    password confirmation, password strength validation, role assignment,
    POPIA consent recording, and age verification.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False, write_only=True, allow_blank=True)
    role = serializers.CharField(required=False, default='youth')
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    marketing_consent = serializers.BooleanField(required=False, default=False)
    terms_accepted = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'password',
            'confirm_password',
            'role',
            'date_of_birth',
            'marketing_consent',
            'terms_accepted',
        ]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        
        # Enforce configured password validators (including ComplexPasswordValidator)
        validate_password(attrs['password'])

        # Age Gate Validation (COPPA & POPIA child information protection)
        dob = attrs.get('date_of_birth')
        if dob:
            today = date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            if age < 13:
                raise serializers.ValidationError({
                    "date_of_birth": "You must be at least 13 years old to create an account on SkillHub ZA."
                })
            if age < 18:
                attrs['is_minor'] = True
                attrs['parental_consent_token'] = str(uuid.uuid4())
            else:
                attrs['is_minor'] = False
                attrs['parental_consent_token'] = None

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        full_name = validated_data.pop('full_name', '')
        password = validated_data.pop('password')
        role = validated_data.pop('role', 'youth')
        date_of_birth = validated_data.pop('date_of_birth', None)
        marketing_consent = validated_data.pop('marketing_consent', False)
        terms_accepted = validated_data.pop('terms_accepted', True)
        is_minor = validated_data.pop('is_minor', False)
        parental_consent_token = validated_data.pop('parental_consent_token', None)
        
        first_name = ''
        last_name = ''
        if full_name:
            parts = full_name.strip().split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ''

        now = timezone.now() if terms_accepted else None

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            date_of_birth=date_of_birth,
            is_minor=is_minor,
            parental_consent_token=parental_consent_token,
            marketing_consent=marketing_consent,
            terms_accepted_at=now,
            privacy_policy_accepted_at=now,
            policy_version_agreed='1.0',
        )
        return user


class ReportSerializer(serializers.ModelSerializer):
    """
    Serializer for user content violation reports.
    """
    reporter = serializers.StringRelatedField(read_only=True)
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'content_type',
            'content_id',
            'reason',
            'reason_display',
            'comment',
            'status',
            'status_display',
            'created_at',
        ]
        read_only_fields = ['id', 'reporter', 'status', 'created_at']


class DMCARequestSerializer(serializers.ModelSerializer):
    """
    Serializer for DMCA / ECTA Chapter XI copyright takedown notices.
    """
    class Meta:
        model = DMCARequest
        fields = [
            'id',
            'complainant_name',
            'complainant_email',
            'copyrighted_work',
            'infringing_url',
            'good_faith_statement',
            'accuracy_statement',
            'electronic_signature',
            'status',
            'received_at',
        ]
        read_only_fields = ['id', 'status', 'received_at']


class PolicyVersionSerializer(serializers.ModelSerializer):
    """
    Serializer for legal document policy versions.
    """
    policy_type_display = serializers.CharField(source='get_policy_type_display', read_only=True)

    class Meta:
        model = PolicyVersion
        fields = [
            'id',
            'policy_type',
            'policy_type_display',
            'version',
            'title',
            'content',
            'effective_date',
            'is_active',
        ]



class UserSummarySerializer(serializers.ModelSerializer):
    """
    Compact User summary serializer used across feeds, posts, and comments.
    """
    full_name = serializers.SerializerMethodField()
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'location',
            'province',
            'bio',
            'role',
            'skills',
            'is_creator',
            'seta_verified',
            'verified',
            'badge',
        ]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get('avatar'):
            data['avatar'] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        return data


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom SimpleJWT Serializer that adds user data directly to the token response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSummarySerializer(self.user, context=self.context).data
        return data


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User profile details.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'bio',
            'avatar',
            'location',
            'province',
            'skills',
            'is_creator',
            'role',
            'seta_verified',
            'verified',
            'badge',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get('avatar'):
            data['avatar'] = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        return data


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'phone', 'education_level', 'matric_year', 'certificates_count', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comments on Posts.
    """
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically set author from request context
        user = self.context['request'].user
        return Comment.objects.create(author=user, **validated_data)

    def validate_content(self, value):
        """Sanitize comment content against XSS using bleach."""
        if not value:
            return value
        try:
            import bleach
            return bleach.clean(value, tags=[], strip=True).strip()
        except ImportError:
            import re
            return re.sub(r'<[^>]*?>', '', value).strip()


class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for Social Feed Posts with author details, counts, file uploads, and comments.
    """
    author = UserSummarySerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    media_file = serializers.ImageField(required=False, allow_null=True)
    video_file = serializers.FileField(required=False, allow_null=True)
    media_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    media_type = serializers.CharField(read_only=True)

    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'content',
            'media_type',
            'media_file',
            'video_file',
            'media_url',
            'video_url',
            'category',
            'hashtags',
            'created_at',
            'updated_at',
            'likes_count',
            'comments_count',
            'is_liked',
            'comments',
        ]
        read_only_fields = ['id', 'author', 'media_type', 'created_at', 'updated_at', 'likes_count', 'comments_count']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def validate_content(self, value):
        """
        Sanitize post content against XSS attacks using bleach.
        Strips all unsafe HTML/script tags while preserving clean text.
        """
        if not value:
            return value
        try:
            import bleach
            # Strip all HTML/script tags
            cleaned = bleach.clean(value, tags=[], strip=True)
            return cleaned.strip()
        except ImportError:
            import re
            return re.sub(r'<[^>]*?>', '', value).strip()

    def get_media_url(self, obj):
        if obj.media_file:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.media_file.url)
                return obj.media_file.url
            except Exception:
                return None
        return None

    def get_video_url(self, obj):
        if obj.video_file:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.video_file.url)
                return obj.video_file.url
            except Exception:
                return None
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        
        # Calculate media_type based on uploaded files
        if validated_data.get('video_file'):
            validated_data['media_type'] = 'video'
        elif validated_data.get('media_file'):
            validated_data['media_type'] = 'image'
        else:
            validated_data['media_type'] = 'text'

        return Post.objects.create(author=user, **validated_data)


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Community Events and Workshops.
    """
    organizer = UserSerializer(read_only=True)
    attendees_count = serializers.IntegerField(source='attendees.count', read_only=True)
    is_attending = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'date',
            'date_badge',
            'location',
            'organizer',
            'image_url',
            'category',
            'attendees_count',
            'is_attending',
            'created_at',
        ]
        read_only_fields = ['id', 'organizer', 'attendees_count', 'created_at']

    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        return Event.objects.create(organizer=user, **validated_data)


class ServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for Youth Freelance & Artisan Service Listings.
    """
    provider = UserSerializer(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id',
            'title',
            'description',
            'provider',
            'price',
            'price_unit',
            'category',
            'image_url',
            'phone',
            'deliverables',
            'verified_youth',
            'created_at',
        ]
        read_only_fields = ['id', 'provider', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return Service.objects.create(provider=user, **validated_data)


class ReelSerializer(serializers.ModelSerializer):
    """
    Serializer for Short Video Reels.
    """
    author = UserSerializer(read_only=True)

    class Meta:
        model = Reel
        fields = [
            'id',
            'author',
            'video_url',
            'caption',
            'audio_track',
            'tags',
            'created_at',
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return Reel.objects.create(author=user, **validated_data)


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Chat and Direct Messages.
    """
    sender = UserSummarySerializer(read_only=True)
    room_id = serializers.PrimaryKeyRelatedField(
        queryset=ChatRoom.objects.all(),
        source='room',
        required=False,
        allow_null=True
    )
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='receiver',
        required=False,
        allow_null=True,
        write_only=True
    )
    receiver = UserSummarySerializer(read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'room',
            'room_id',
            'sender',
            'receiver',
            'receiver_id',
            'content',
            'text',
            'media_url',
            'is_read',
            'timestamp',
        ]
        read_only_fields = ['id', 'room', 'sender', 'is_read', 'timestamp']

    def create(self, validated_data):
        sender = self.context['request'].user
        # Sync content and text
        if 'content' in validated_data and not validated_data.get('text'):
            validated_data['text'] = validated_data['content']
        elif 'text' in validated_data and not validated_data.get('content'):
            validated_data['content'] = validated_data['text']
        return Message.objects.create(sender=sender, **validated_data)


class ChatRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for Chat Rooms and Conversations.
    """
    participants = UserSummarySerializer(many=True, read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source='participants',
        write_only=True,
        required=False
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'name',
            'participants',
            'participant_ids',
            'last_message',
            'unread_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last = obj.last_message
        if last:
            return {
                'id': last.id,
                'content': last.content or last.text,
                'sender': last.sender.username,
                'sender_name': last.sender.get_full_name() or last.sender.username,
                'timestamp': last.timestamp,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        user = self.context['request'].user
        room = ChatRoom.objects.create(**validated_data)
        room.participants.add(user)
        for p in participants:
            room.participants.add(p)
        return room
