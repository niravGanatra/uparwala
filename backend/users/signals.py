from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    """
    Send a welcome email when a new user is created.
    """
    if created:
        # Check if the user is a vendor (skip vendors as they get different onboarding emails)
        # Note: 'is_vendor' might not be set immediately if it's a separate step, 
        # but typically frontend registration sets it. 
        # However, for customer accounts, we definitely want this.
        
        # If you want to exclude vendors from this *specific* customer welcome email:
        if getattr(instance, 'is_vendor', False):
            return

        try:
            logger.info(f"Preparing welcome email for new user: {instance.email}")
            
            context = {
                'customer_name': instance.get_full_name() or instance.username,
            }
            email_data = get_email_template('welcome_email', context)
            
            if email_data:
                send_email_via_resend(
                    to_email=instance.email,
                    subject=email_data['subject'],
                    html_content=email_data['content']
                )
                logger.info(f"Welcome email sent successfully to {instance.email}")
            else:
                logger.error("Welcome email template not found")
                
        except Exception as e:
            logger.error(f"Failed to send welcome email to {instance.email}: {str(e)}")
