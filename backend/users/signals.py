from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from notifications.email_templates import get_email_template
import logging
import threading

User = get_user_model()
logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Send a welcome email when a new user is created.
    Runs in a background thread so it never blocks the registration response.
    """
    if not created:
        return
    # Vendors get a separate onboarding email via vendor_application.py
    if getattr(instance, 'is_vendor', False):
        return

    def _send():
        try:
            from django.conf import settings
            context = {
                'customer_name': instance.get_full_name() or instance.username,
            }
            email_data = get_email_template('welcome_email', context)
            if not email_data:
                logger.error("Welcome email template not found")
                return

            resend_key = getattr(settings, 'RESEND_API_KEY', '')
            if resend_key:
                from notifications.resend_service import send_email_via_resend
                send_email_via_resend(
                    to_email=instance.email,
                    subject=email_data['subject'],
                    html_content=email_data['content'],
                )
            else:
                # Fallback: Django SMTP (works in local dev)
                from django.core.mail import send_mail
                send_mail(
                    subject=email_data['subject'],
                    message='',
                    html_message=email_data['content'],
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[instance.email],
                    fail_silently=True,
                )
            logger.info(f"Welcome email sent to {instance.email}")
        except Exception as e:
            logger.error(f"Failed to send welcome email to {instance.email}: {e}")

    t = threading.Thread(target=_send, daemon=True)
    t.start()
