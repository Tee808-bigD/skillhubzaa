"""
POPIA Section 22 & Background Tasks Template.
Dispatches notification emails to affected data subjects and the Information Regulator.
"""

import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

def dispatch_data_breach_notifications(breach_id: int):
    """
    Background worker function / Celery task to notify affected users and
    the South African Information Regulator following a POPIA Section 22 security compromise.
    """
    from .models import DataBreach
    try:
        breach = DataBreach.objects.get(pk=breach_id)
    except DataBreach.DoesNotExist:
        logger.error(f"DataBreach #{breach_id} does not exist.")
        return

    subject = f"IMPORTANT SECURITY NOTICE: SkillHub ZA Account Notification [POPIA Sec 22]"
    message_body = (
        f"Dear SkillHub ZA Member,\n\n"
        f"We are writing to notify you in compliance with Section 22 of the Protection of "
        f"Personal Information Act (POPIA) regarding an incident that may involve your personal information.\n\n"
        f"Incident Summary: {breach.description}\n\n"
        f"Measures Taken: {breach.remediation_steps}\n\n"
        f"Recommended Action: We advise updating your password and reviewing your account activity.\n\n"
        f"If you have questions, please reach out to our Information Officer at privacy@skillhub.co.za.\n\n"
        f"Sincerely,\nSkillHub ZA Security & Data Privacy Team"
    )

    # In production, iterate through breach.affected_users.all()
    logger.info(f"Dispatching POPIA breach notifications for breach #{breach.pk}")
