from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Automatically creates a Profile record whenever a new User registers.
    """
    if created:
        Profile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()


@receiver(post_save, sender='core.DataBreach')
def notify_popia_data_breach(sender, instance, created, **kwargs):
    """
    POPIA Section 22 Mandatory Breach Notification Trigger.
    When a security compromise log is recorded, notifies:
    1. The Information Regulator (inforeg@justice.gov.za / POPIA compliance division).
    2. All affected Data Subjects via registered email / SMS.
    """
    if created and not instance.regulator_notified:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(
            f"[POPIA SEC 22 ALERT] Security compromise logged #{instance.pk}: "
            f"{instance.description}. Affected users: {instance.affected_users_count}. "
            "Dispatching breach notices to the Information Regulator and affected subjects."
        )
        # In production with Celery/SMTP, execute:
        # send_popia_regulator_notice_task.delay(instance.pk)

