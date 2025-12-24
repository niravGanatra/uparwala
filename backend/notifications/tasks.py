from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .email_templates import get_email_template
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_notification_email(template_name, recipient_email, context, raise_error=False):
    """
    Async task to send notification emails
    """
    try:
        template = get_email_template(template_name, context)
        if not template:
            logger.error(f"Template {template_name} not found")
            if raise_error:
                raise ValueError(f"Template {template_name} not found")
            return False
            
        send_mail(
            subject=template['subject'],
            message='',  # Plain text version (optional)
            html_message=template['content'],
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info(f"Email sent to {recipient_email} using template {template_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        if raise_error:
            raise e
        return False

@shared_task
def send_sms_task(to_number, body):
    """Async task to send SMS"""
    from .twilio_service import TwilioService
    service = TwilioService()
    return service.send_sms(to_number, body)

@shared_task
def send_whatsapp_task(to_number, body):
    """Async task to send WhatsApp message"""
    from .twilio_service import TwilioService
    service = TwilioService()
    return service.send_whatsapp(to_number, body)
