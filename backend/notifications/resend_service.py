"""
Resend Email Service for transactional emails.
Uses Resend's HTTP API to bypass SMTP blocks on Railway/PaaS.
"""
import resend
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_email_via_resend(to_email: str, subject: str, html_content: str, from_email: str = None):
    """
    Send an email using Resend's API.
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML body of the email
        from_email: Sender email (defaults to settings.DEFAULT_FROM_EMAIL)
    
    Returns:
        dict with 'id' on success, raises exception on failure
    """
    api_key = getattr(settings, 'RESEND_API_KEY', None)
    
    if not api_key:
        raise ValueError("RESEND_API_KEY is not configured in settings")
    
    resend.api_key = api_key
    
    sender = from_email or settings.DEFAULT_FROM_EMAIL
    
    try:
        params = {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Email sent via Resend to {to_email}: {response}")
        return response
        
    except Exception as e:
        logger.error(f"Resend email failed: {str(e)}")
        raise
