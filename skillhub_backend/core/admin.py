from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Profile, Post, Comment, Like, Event, Service, Reel, Message


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile Details'


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    Admin configuration for the custom User model.
    """
    inlines = [ProfileInline]
    list_display = ('username', 'email', 'get_full_name', 'role', 'province', 'is_creator', 'seta_verified', 'is_staff')
    list_filter = ('role', 'is_creator', 'seta_verified', 'verified', 'province', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'location')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('SkillHub Profile Info', {
            'fields': ('bio', 'avatar', 'location', 'province', 'skills', 'is_creator', 'role', 'seta_verified', 'verified', 'badge')
        }),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('SkillHub Profile Info', {
            'fields': ('email', 'role', 'province', 'is_creator')
        }),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'education_level', 'matric_year', 'certificates_count', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone')
    list_filter = ('education_level',)


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('author', 'content', 'created_at')


class LikeInline(admin.TabularInline):
    model = Like
    extra = 0
    readonly_fields = ('user', 'created_at')


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_preview', 'media_type', 'category', 'get_likes_count', 'get_comments_count', 'created_at')
    list_filter = ('media_type', 'category', 'created_at')
    search_fields = ('content', 'author__username', 'author__email', 'category')
    inlines = [CommentInline, LikeInline]
    date_hierarchy = 'created_at'

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Excerpt'

    def get_likes_count(self, obj):
        return obj.likes.count()
    get_likes_count.short_description = 'Likes'

    def get_comments_count(self, obj):
        return obj.comments.count()
    get_comments_count.short_description = 'Comments'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'author', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username', 'post__content')

    def content_preview(self, obj):
        return obj.content[:40] + '...' if len(obj.content) > 40 else obj.content
    content_preview.short_description = 'Comment'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'post__content')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'date', 'location', 'category', 'get_attendees_count', 'created_at')
    list_filter = ('category', 'date', 'created_at')
    search_fields = ('title', 'description', 'location', 'organizer__username')
    filter_horizontal = ('attendees',)

    def get_attendees_count(self, obj):
        return obj.attendees.count()
    get_attendees_count.short_description = 'RSVPs'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'price_display', 'category', 'verified_youth', 'created_at')
    list_filter = ('category', 'price_unit', 'verified_youth', 'created_at')
    search_fields = ('title', 'description', 'provider__username', 'phone')

    def price_display(self, obj):
        return f"R{obj.price} / {obj.price_unit}"
    price_display.short_description = 'Pricing'


@admin.register(Reel)
class ReelAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'caption_preview', 'audio_track', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('caption', 'author__username', 'audio_track')

    def caption_preview(self, obj):
        return obj.caption[:40] + '...' if len(obj.caption) > 40 else obj.caption
    caption_preview.short_description = 'Caption'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'receiver', 'text_preview', 'is_read', 'timestamp')
    list_filter = ('is_read', 'timestamp')
    search_fields = ('text', 'sender__username', 'receiver__username')

    def text_preview(self, obj):
        return obj.text[:40] + '...' if len(obj.text) > 40 else obj.text
    text_preview.short_description = 'Message Content'
