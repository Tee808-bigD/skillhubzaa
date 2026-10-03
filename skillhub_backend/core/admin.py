from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
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
    PolicyVersion,
    DataBreach,
    Report,
    DMCARequest,
)


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile Details'


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    """
    Admin configuration for the custom User model with POPIA & Age Verification tracking.
    """
    inlines = [ProfileInline]
    list_display = (
        'username',
        'email',
        'get_full_name',
        'role',
        'province',
        'is_minor',
        'seta_verified',
        'terms_accepted_display',
        'is_staff'
    )
    list_filter = (
        'role',
        'is_minor',
        'is_creator',
        'seta_verified',
        'verified',
        'marketing_consent',
        'province',
        'is_staff',
        'is_active'
    )
    search_fields = ('username', 'first_name', 'last_name', 'email', 'location')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('SkillHub Profile Info', {
            'fields': (
                'bio',
                'avatar',
                'location',
                'province',
                'skills',
                'is_creator',
                'role',
                'seta_verified',
                'verified',
                'badge'
            )
        }),
        ('POPIA Compliance & Consent', {
            'fields': (
                'terms_accepted_at',
                'privacy_policy_accepted_at',
                'marketing_consent',
                'policy_version_agreed'
            )
        }),
        ('Age Verification & Child Protection', {
            'fields': (
                'date_of_birth',
                'is_minor',
                'parental_consent_token'
            )
        }),
    )

    def terms_accepted_display(self, obj):
        if obj.terms_accepted_at:
            return format_html('<span style="color: green;">✓ Agreed (v{})</span>', obj.policy_version_agreed or '1.0')
        return format_html('<span style="color: red;">✗ Pending</span>')
    terms_accepted_display.short_description = 'POPIA Consent'


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
    list_display = (
        'id',
        'author',
        'content_preview',
        'moderation_status_badge',
        'is_flagged',
        'is_age_restricted',
        'media_type',
        'get_likes_count',
        'get_comments_count',
        'created_at'
    )
    list_filter = ('moderation_status', 'is_flagged', 'is_age_restricted', 'media_type', 'category', 'created_at')
    search_fields = ('content', 'author__username', 'author__email', 'category')
    inlines = [CommentInline, LikeInline]
    date_hierarchy = 'created_at'
    actions = ['approve_posts', 'flag_posts_for_review', 'remove_content_and_notify_user']

    def content_preview(self, obj):
        return obj.content[:35] + '...' if len(obj.content) > 35 else obj.content
    content_preview.short_description = 'Content Preview'

    def moderation_status_badge(self, obj):
        colors = {
            'approved': 'green',
            'pending': 'orange',
            'removed': 'red',
        }
        color = colors.get(obj.moderation_status, 'gray')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_moderation_status_display())
    moderation_status_badge.short_description = 'Status'

    def get_likes_count(self, obj):
        return obj.likes_count
    get_likes_count.short_description = 'Likes'

    def get_comments_count(self, obj):
        return obj.comments_count
    get_comments_count.short_description = 'Comments'

    @admin.action(description="Approve selected content")
    def approve_posts(self, request, queryset):
        queryset.update(moderation_status='approved', is_flagged=False)
        self.message_user(request, "Selected posts approved and cleared.")

    @admin.action(description="Flag selected content for review")
    def flag_posts_for_review(self, request, queryset):
        queryset.update(moderation_status='pending', is_flagged=True)
        self.message_user(request, "Selected posts flagged for review.")

    @admin.action(description="Remove Content and Notify User (ECTA Safe Harbor)")
    def remove_content_and_notify_user(self, request, queryset):
        count = queryset.count()
        for post in queryset:
            post.moderation_status = 'removed'
            post.is_flagged = True
            post.save()
            # Log moderation action in admin
        self.message_user(request, f"{count} item(s) marked removed. Content hidden from public feeds.")


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Moderation Dashboard for User Reports under ECTA Chapter XI.
    """
    list_display = ('id', 'reporter', 'content_type', 'content_id', 'reason', 'status_badge', 'created_at')
    list_filter = ('status', 'reason', 'content_type', 'created_at')
    search_fields = ('reporter__username', 'content_id', 'comment', 'admin_notes')
    readonly_fields = ('reporter', 'content_type', 'content_id', 'reason', 'comment', 'created_at')
    date_hierarchy = 'created_at'
    actions = ['action_remove_content_and_notify', 'action_dismiss_report']

    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'reviewed': 'blue',
            'action_taken': 'red',
            'dismissed': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.get_status_display())
    status_badge.short_description = 'Status'

    @admin.action(description="Remove Content and Notify User")
    def action_remove_content_and_notify(self, request, queryset):
        for report in queryset:
            report.status = 'action_taken'
            report.action_taken_by = request.user
            report.admin_notes += f"\nActioned by {request.user.username}: Content removed under Safe Harbor."
            report.save()

            # Automatically update the target content status if it is a Post
            if report.content_type == 'post':
                try:
                    post_id = int(report.content_id)
                    Post.objects.filter(pk=post_id).update(moderation_status='removed', is_flagged=True)
                except Exception:
                    pass
            elif report.content_type == 'comment':
                try:
                    Comment.objects.filter(pk=int(report.content_id)).update(is_flagged=True)
                except Exception:
                    pass
        self.message_user(request, f"{queryset.count()} report(s) actioned and content removed.")

    @admin.action(description="Dismiss report (No violation)")
    def action_dismiss_report(self, request, queryset):
        queryset.update(status='dismissed', action_taken_by=request.user)
        self.message_user(request, f"{queryset.count()} report(s) dismissed.")


@admin.register(DMCARequest)
class DMCARequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'complainant_name', 'complainant_email', 'status', 'received_at')
    list_filter = ('status', 'received_at')
    search_fields = ('complainant_name', 'complainant_email', 'copyrighted_work', 'infringing_url')
    actions = ['disable_infringing_content', 'reject_notice']

    @admin.action(description="Disable Infringing Content (Action Takedown)")
    def disable_infringing_content(self, request, queryset):
        queryset.update(status='action_taken')
        self.message_user(request, f"{queryset.count()} DMCA notice(s) actioned. Content disabled.")

    @admin.action(description="Reject Notice (Insufficient Proof)")
    def reject_notice(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} DMCA notice(s) rejected.")


@admin.register(PolicyVersion)
class PolicyVersionAdmin(admin.ModelAdmin):
    list_display = ('policy_type', 'version', 'title', 'effective_date', 'is_active', 'created_at')
    list_filter = ('policy_type', 'is_active', 'effective_date')
    search_fields = ('title', 'version', 'content')


@admin.register(DataBreach)
class DataBreachAdmin(admin.ModelAdmin):
    list_display = ('id', 'incident_date', 'affected_users_count', 'regulator_notified', 'reported_at')
    list_filter = ('regulator_notified', 'incident_date', 'reported_at')
    search_fields = ('description', 'remediation_steps')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'post', 'content_preview', 'is_flagged', 'created_at')
    list_filter = ('is_flagged', 'created_at')
    search_fields = ('content', 'author__username')

    def content_preview(self, obj):
        return obj.content[:30] + '...' if len(obj.content) > 30 else obj.content
    content_preview.short_description = 'Comment'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'date', 'location', 'category', 'get_attendees_count', 'created_at')
    list_filter = ('category', 'date', 'created_at')
    search_fields = ('title', 'description', 'location', 'organizer__username')

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
    list_display = ('id', 'sender', 'receiver', 'text_preview', 'is_flagged', 'is_read', 'timestamp')
    list_filter = ('is_flagged', 'is_read', 'timestamp')
    search_fields = ('text', 'content', 'sender__username', 'receiver__username')

    def text_preview(self, obj):
        return obj.content[:40] + '...' if len(obj.content) > 40 else obj.content
    text_preview.short_description = 'Message Content'
