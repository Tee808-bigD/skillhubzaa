from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

PROVINCE_CHOICES = [
    ('Gauteng', 'Gauteng'),
    ('Western Cape', 'Western Cape'),
    ('KwaZulu-Natal', 'KwaZulu-Natal'),
    ('Eastern Cape', 'Eastern Cape'),
    ('Limpopo', 'Limpopo'),
    ('Mpumalanga', 'Mpumalanga'),
    ('North West', 'North West'),
    ('Free State', 'Free State'),
    ('Northern Cape', 'Northern Cape'),
    ('All South Africa', 'All South Africa'),
]

ROLE_CHOICES = [
    ('youth', 'Youth / Job Seeker'),
    ('mentor', 'Industry Mentor'),
    ('employer', 'Employer / Enterprise'),
    ('trainer', 'Accredited Trainer / SETA'),
]

SERVICE_CATEGORY_CHOICES = [
    ('web_dev', 'Web & App Development'),
    ('graphic_design', 'Graphic & UI Design'),
    ('solar_repair', 'Solar & Electrical Trades'),
    ('tutoring', 'Academic & Coding Tutoring'),
    ('phone_repair', 'Phone & Device Repair'),
    ('catering', 'Catering & Event Planning'),
    ('photography', 'Photography & Videography'),
    ('trades', 'Artisanal & Technical Trades'),
]


class User(AbstractUser):
    """
    Custom User Model extending Django's AbstractUser.
    Adds specialized fields for South African creators and youth.
    """
    bio = models.TextField(_('Bio'), blank=True, default='')
    avatar = models.ImageField(
        _('Avatar Image'),
        upload_to='avatars/',
        blank=True,
        null=True
    )
    location = models.CharField(_('Location / City'), max-width=150, default='Johannesburg, South Africa')
    province = models.CharField(_('Province'), max-width=50, choices=PROVINCE_CHOICES, default='Gauteng')
    skills = models.JSONField(_('Skills List'), default=list, blank=True)
    is_creator = models.BooleanField(_('Is Content Creator'), default=False)
    role = models.CharField(_('Role'), max-width=20, choices=ROLE_CHOICES, default='youth')
    seta_verified = models.BooleanField(_('SETA Verified Learner'), default=False)
    verified = models.BooleanField(_('Verified Profile'), default=False)
    badge = models.CharField(_('Profile Badge'), max-width=100, blank=True, null=True, default='Active Member')

    # POPIA Compliance (Protection of Personal Information Act) & Consent
    terms_accepted_at = models.DateTimeField(_('Terms Accepted At'), null=True, blank=True)
    privacy_policy_accepted_at = models.DateTimeField(_('Privacy Policy Accepted At'), null=True, blank=True)
    marketing_consent = models.BooleanField(_('Marketing Communications Consent'), default=False)
    policy_version_agreed = models.CharField(_('Policy Version Agreed'), max-width=20, default='1.0')

    # Age Verification & Minor Protection
    date_of_birth = models.DateField(_('Date of Birth'), null=True, blank=True)
    is_minor = models.BooleanField(_('Is Minor Under 18'), default=False)
    parental_consent_token = models.CharField(_('Parental Consent Token'), max-width=100, blank=True, null=True)

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.username} ({self.get_full_name() or self.role})"


class Profile(models.Model):
    """
    Additional Profile metadata linked OneToOne with User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(_('Phone Number'), max-width=30, blank=True, default='')
    education_level = models.CharField(_('Education Level'), max-width=100, default='Matric / Grade 12')
    matric_year = models.PositiveIntegerField(_('Matric Completion Year'), null=True, blank=True)
    certificates_count = models.PositiveIntegerField(_('Verified Certificates Count'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


class Post(models.Model):
    """
    Social feed post supporting text, media uploads, and video snippets.
    """
    MEDIA_TYPES = [
        ('text', 'Text Only'),
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(_('Post Content'))
    media_type = models.CharField(_('Media Type'), max-width=10, choices=MEDIA_TYPES, default='text')
    media_file = models.ImageField(_('Media Image File'), upload_to='posts/media/', blank=True, null=True)
    video_file = models.FileField(_('Video File'), upload_to='posts/videos/', blank=True, null=True)
    category = models.CharField(_('Category'), max-width=100, default='General')
    hashtags = models.CharField(_('Hashtags'), max-width=300, blank=True, default='')

    # Safe Harbor & Content Moderation (ECTA Chapter XI)
    MODERATION_STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('pending', 'Pending Review'),
        ('removed', 'Removed for Policy Violation'),
    ]
    moderation_status = models.CharField(
        _('Moderation Status'),
        max-width=20,
        choices=MODERATION_STATUS_CHOICES,
        default='approved'
    )
    is_flagged = models.BooleanField(_('Is Flagged for Moderation'), default=False)
    is_age_restricted = models.BooleanField(_('Is Age Restricted (18+)'), default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Post')
        verbose_name_plural = _('Posts')

    def __str__(self):
        return f"Post #{self.pk} by {self.author.username}: {self.content[:30]}..."

    @property
    def media_url(self):
        if self.media_file:
            try:
                return self.media_file.url
            except Exception:
                return None
        return None

    @property
    def video_url(self):
        if self.video_file:
            try:
                return self.video_file.url
            except Exception:
                return None
        return None

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.count()


class Comment(models.Model):
    """
    Comments on social feed posts.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(_('Comment Text'))
    is_flagged = models.BooleanField(_('Is Flagged for Moderation'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = _('Comment')
        verbose_name_plural = _('Comments')

    def __str__(self):
        return f"Comment by {self.author.username} on Post #{self.post_id}"


class Like(models.Model):
    """
    Unique Likes on Posts. Ensures a user can only like a post once.
    """
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')  # Enforce single like per user
        ordering = ['-created_at']
        verbose_name = _('Like')
        verbose_name_plural = _('Likes')

    def __str__(self):
        return f"{self.user.username} liked Post #{self.post_id}"


class Event(models.Model):
    """
    Community workshops, masterclasses, and SETA learnership summits.
    """
    title = models.CharField(_('Event Title'), max-width=255)
    description = models.TextField(_('Event Description'))
    date = models.DateTimeField(_('Event Date & Time'))
    date_badge = models.CharField(_('Date Badge (e.g. Aug 25)'), max-width=50, blank=True)
    location = models.CharField(_('Location / Venue'), max-width=255)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    image_url = models.URLField(_('Cover Image URL'), blank=True, null=True)
    category = models.CharField(_('Category'), max-width=80, default='Workshop')
    attendees = models.ManyToManyField(User, related_name='attending_events', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']
        verbose_name = _('Event')
        verbose_name_plural = _('Events')

    def __str__(self):
        return f"{self.title} ({self.date_badge or self.date.strftime('%Y-%m-%d')})"

    @property
    def attendees_count(self):
        return self.attendees.count()


class Service(models.Model):
    """
    Youth freelance and artisan service listings in the marketplace.
    """
    PRICE_UNIT_CHOICES = [
        ('project', 'Per Project'),
        ('hour', 'Per Hour'),
        ('day', 'Per Day'),
    ]

    title = models.CharField(_('Service Title'), max-width=255)
    description = models.TextField(_('Service Description'))
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='services')
    price = models.DecimalField(_('Price (ZAR)'), max-digits=10, decimal_places=2)
    price_unit = models.CharField(_('Price Unit'), max-width=15, choices=PRICE_UNIT_CHOICES, default='project')
    category = models.CharField(_('Category'), max-width=50, choices=SERVICE_CATEGORY_CHOICES, default='web_dev')
    image_url = models.URLField(_('Portfolio Image URL'), blank=True, null=True)
    phone = models.CharField(_('Contact Phone / WhatsApp'), max-width=30, blank=True)
    deliverables = models.JSONField(_('Key Deliverables'), default=list, blank=True)
    verified_youth = models.BooleanField(_('Verified Youth Artisan'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Service Listing')
        verbose_name_plural = _('Service Listings')

    def __str__(self):
        return f"{self.title} by {self.provider.username} (R{self.price} / {self.price_unit})"


class Reel(models.Model):
    """
    Short video reels showing creative and artisanal skills.
    """
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reels')
    video_url = models.FileField(_('Reel Video File'), upload_to='reels/videos/', blank=True, null=True)
    caption = models.TextField(_('Reel Caption'), blank=True)
    audio_track = models.CharField(_('Audio Track'), max-width=150, default='Original Audio - SkillHub ZA')
    tags = models.JSONField(_('Tags'), default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Reel')
        verbose_name_plural = _('Reels')

    def __str__(self):
        return f"Reel #{self.pk} by {self.author.username}: {self.caption[:30]}..."


class ChatRoom(models.Model):
    """
    Real-time chat room / conversation between users for Django Channels.
    """
    name = models.CharField(_('Room Name / Subject'), max-width=200, blank=True)
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = _('Chat Room')
        verbose_name_plural = _('Chat Rooms')

    def __str__(self):
        names = ", ".join([u.username for u in self.participants.all()[:3]])
        return self.name or f"ChatRoom #{self.pk} ({names})"

    @property
    def last_message(self):
        return self.messages.order_by('-timestamp').first()


class Message(models.Model):
    """
    Real-time direct and room messages between SkillHub members, mentors, and employers.
    """
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    content = models.TextField(_('Message Content'), default='')
    text = models.TextField(_('Message Text (Legacy Alias)'), blank=True, default='')
    media_url = models.URLField(_('Media Attachment URL'), blank=True, null=True)
    is_read = models.BooleanField(_('Is Read'), default=False)
    is_flagged = models.BooleanField(_('Is Flagged for Moderation'), default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')

    def save(self, *args, **kwargs):
        if self.content and not self.text:
            self.text = self.content
        elif self.text and not self.content:
            self.content = self.text
        super().save(*args, **kwargs)
        if self.room_id:
            # Update room's updated_at timestamp
            ChatRoom.objects.filter(pk=self.room_id).update(updated_at=self.timestamp or self.save)

    def __str__(self):
        room_tag = f"Room {self.room_id}" if self.room_id else "Direct"
        return f"[{room_tag}] {self.sender.username}: {self.content[:30]}"


# ==============================================================================
# POPIA, SAFE HARBOR (ECTA), AND LEGAL COMPLIANCE MODELS
# ==============================================================================

class PolicyVersion(models.Model):
    """
    Version control for legal agreements under POPIA and ECTA.
    Tracks exact versions of Terms of Service, Privacy Policy, and Community Guidelines.
    """
    POLICY_TYPES = [
        ('terms', 'Terms of Service'),
        ('privacy', 'POPIA Privacy Policy'),
        ('community_guidelines', 'Community Guidelines'),
    ]

    policy_type = models.CharField(_('Policy Type'), max-width=30, choices=POLICY_TYPES)
    version = models.CharField(_('Version Number'), max-width=20, default='1.0')
    title = models.CharField(_('Title'), max-width=200)
    content = models.TextField(_('Legal Document Content (Markdown/HTML)'))
    effective_date = models.DateField(_('Effective Date'))
    is_active = models.BooleanField(_('Is Current Active Version'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date', '-created_at']
        unique_together = ('policy_type', 'version')
        verbose_name = _('Policy Version')
        verbose_name_plural = _('Policy Versions')

    def __str__(self):
        return f"{self.get_policy_type_display()} v{self.version} ({'Active' if self.is_active else 'Archived'})"


class DataBreach(models.Model):
    """
    POPIA Section 22 Data Breach Notification Log.
    Mandatory record of any security compromises for Information Regulator reporting.
    """
    incident_date = models.DateTimeField(_('Incident Date & Time'))
    description = models.TextField(_('Description of Security Compromise'))
    affected_users_count = models.IntegerField(_('Estimated Affected Users Count'), default=0)
    affected_users = models.ManyToManyField(User, related_name='data_breaches', blank=True)
    remediation_steps = models.TextField(_('Remediation & Mitigation Steps Taken'))
    regulator_notified = models.BooleanField(_('Information Regulator Notified'), default=False)
    regulator_notified_at = models.DateTimeField(_('Regulator Notification Timestamp'), null=True, blank=True)
    reported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-reported_at']
        verbose_name = _('Data Breach Record')
        verbose_name_plural = _('Data Breach Records')

    def __str__(self):
        return f"Breach Log #{self.pk} - {self.incident_date.strftime('%Y-%m-%d')} ({self.affected_users_count} affected)"


class Report(models.Model):
    """
    User Content Moderation & Reporting System under ECTA Chapter XI Safe Harbor.
    """
    CONTENT_TYPES = [
        ('post', 'Post'),
        ('comment', 'Comment'),
        ('message', 'Message'),
        ('user', 'User Profile'),
    ]

    REASON_CHOICES = [
        ('hate_speech', 'Hate Speech & Discrimination'),
        ('harassment', 'Harassment or Bullying'),
        ('spam', 'Spam, Fraud or Scam'),
        ('misinformation', 'Misinformation & Harmful Lies'),
        ('copyright', 'Copyright Infringement'),
        ('other', 'Other Policy Violation'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed'),
        ('action_taken', 'Content Removed / Action Taken'),
        ('dismissed', 'Dismissed / No Violation'),
    ]

    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_reports')
    content_type = models.CharField(_('Content Type'), max-width=20, choices=CONTENT_TYPES)
    content_id = models.CharField(_('Reported Content ID'), max-width=100)
    reason = models.CharField(_('Reason for Report'), max-width=30, choices=REASON_CHOICES)
    comment = models.TextField(_('Additional Context / Reporter Notes'), blank=True, default='')
    status = models.CharField(_('Moderation Status'), max-width=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(_('Internal Moderator Notes'), blank=True, default='')
    action_taken_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='actioned_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Content Report')
        verbose_name_plural = _('Content Reports')

    def __str__(self):
        return f"Report #{self.pk} on {self.content_type} #{self.content_id} ({self.get_reason_display()})"


class DMCARequest(models.Model):
    """
    ECTA / DMCA Safe Harbor Notice and Takedown Request.
    """
    STATUS_CHOICES = [
        ('received', 'Notice Received'),
        ('action_taken', 'Content Removed / Access Disabled'),
        ('rejected', 'Notice Rejected / Insufficient Proof'),
    ]

    complainant_name = models.CharField(_('Full Legal Name of Copyright Owner or Agent'), max-width=200)
    complainant_email = models.EmailField(_('Complainant Contact Email'))
    copyrighted_work = models.TextField(_('Identification of Copyrighted Work Claimed to be Infringed'))
    infringing_url = models.URLField(_('URL or Specific Location of Infringing Material'))
    good_faith_statement = models.BooleanField(_('Good Faith Belief Statement'), default=True)
    accuracy_statement = models.BooleanField(_('Penalty of Perjury / Truthfulness Statement'), default=True)
    electronic_signature = models.CharField(_('Electronic Signature'), max-width=150)
    status = models.CharField(_('Takedown Status'), max-width=20, choices=STATUS_CHOICES, default='received')
    admin_notes = models.TextField(_('Moderator Actions & Notes'), blank=True, default='')
    received_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-received_at']
        verbose_name = _('DMCA / ECTA Takedown Request')
        verbose_name_plural = _('DMCA / ECTA Takedown Requests')

    def __str__(self):
        return f"DMCA Notice #{self.pk} from {self.complainant_name} ({self.status})"

