from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import sys

class Command(BaseCommand):
    help = 'Test email configuration by sending a test email'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The recipient email address')

    def handle(self, *args, **options):
        recipient = options['email']
        self.stdout.write(f"Attempting to send test email to {recipient}...")
        self.stdout.write(f"Using Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        self.stdout.write(f"User: {settings.EMAIL_HOST_USER}")
        self.stdout.write(f"Use TLS: {settings.EMAIL_USE_TLS}")

        try:
            send_mail(
                subject='Test Email from Uparwala',
                message='This is a test email to verify your SMTP configuration is working correctly.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully sent test email to {recipient}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to send email: {str(e)}'))
