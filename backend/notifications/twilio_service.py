from django.conf import settings
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

class TwilioService:
    def __init__(self):
        self.client = None
        self.sms_number = settings.TWILIO_PHONE_NUMBER
        self.whatsapp_number = settings.TWILIO_WHATSAPP_NUMBER
        
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
        else:
            logger.warning("Twilio credentials not found in settings")

    def send_sms(self, to_number, body):
        """Send SMS to a phone number"""
        if not self.client or not self.sms_number:
            logger.warning("Twilio SMS not configured")
            return False
            
        try:
            # Ensure number has country code (default to +91 if missing)
            if not to_number.startswith('+'):
                to_number = f"+91{to_number}"
                
            message = self.client.messages.create(
                body=body,
                from_=self.sms_number,
                to=to_number
            )
            logger.info(f"SMS sent to {to_number}: {message.sid}")
            return message.sid
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {e}")
            return None

    def send_whatsapp(self, to_number, body):
        """Send WhatsApp message to a phone number"""
        if not self.client or not self.whatsapp_number:
            logger.warning("Twilio WhatsApp not configured")
            return False
            
        try:
            # Ensure number has country code and whatsapp prefix
            if not to_number.startswith('whatsapp:'):
                contact = to_number
                if not contact.startswith('+'):
                    contact = f"+91{contact}"
                to_number = f"whatsapp:{contact}"
                
            from_number = self.whatsapp_number
            if not from_number.startswith('whatsapp:'):
                from_number = f"whatsapp:{from_number}"

            message = self.client.messages.create(
                body=body,
                from_=from_number,
                to=to_number
            )
            logger.info(f"WhatsApp sent to {to_number}: {message.sid}")
            return message.sid
        except Exception as e:
            logger.error(f"Failed to send WhatsApp to {to_number}: {e}")
            return None
