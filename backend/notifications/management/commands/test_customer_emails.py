from django.core.management.base import BaseCommand
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
import datetime

class Command(BaseCommand):
    help = 'Test all customer email templates by sending them to a specified email address'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The email address to send test emails to')

    def handle(self, *args, **options):
        to_email = options['email']
        self.stdout.write(f"Starting email test suite for: {to_email}")

        templates_to_test = [
            # Phase 1
            ('welcome_email', {'customer_name': 'Test User'}),
            ('password_reset', {'customer_name': 'Test User', 'reset_url': 'https://uparwala.in/reset/123/token'}),
            
            # Phase 2
            ('order_confirmation', {'customer_name': 'Test User', 'order_id': '1001', 'total_amount': '1500'}),
            ('payment_received', {'customer_name': 'Test User', 'amount': '1500', 'order_id': '1001', 'transaction_id': 'TXN_12345'}),
            ('order_cancellation', {'customer_name': 'Test User', 'order_id': '1001', 'refund_amount': '1500'}),
            
            # Phase 3
            ('order_shipped', {'customer_name': 'Test User', 'order_id': '1001', 'tracking_number': 'TRK999', 'courier_name': 'BlueDart'}),
            ('order_out_for_delivery', {'customer_name': 'Test User', 'order_id': '1001'}),
            ('order_delivered', {'customer_name': 'Test User', 'order_id': '1001'}),
            
            # Phase 4
            ('rate_and_review', {'customer_name': 'Test User', 'product_name': 'Premium Puja Thali', 'product_slug': 'premium-puja-thali'}),
            ('return_request_received', {'customer_name': 'Test User', 'order_id': '1001'}),
            ('refund_processed', {'customer_name': 'Test User', 'order_id': '1001', 'amount': '500'}),
            
            # Phase 5
            ('abandoned_cart', {'customer_name': 'Test User'}),
            ('back_in_stock', {'customer_name': 'Test User', 'product_name': 'Sandalwood Incense', 'product_slug': 'sandalwood-incense'}),
        ]

        success_count = 0
        fail_count = 0

        for template_name, context in templates_to_test:
            self.stdout.write(f"Testing template: {template_name}...")
            try:
                email_data = get_email_template(template_name, context)
                if not email_data:
                    self.stdout.write(self.style.ERROR(f"  [X] Template '{template_name}' not found!"))
                    fail_count += 1
                    continue

                send_email_via_resend(
                    to_email=to_email,
                    subject=f"[TEST] {email_data['subject']}",
                    html_content=email_data['content']
                )
                self.stdout.write(self.style.SUCCESS(f"  [✓] Sent successfully"))
                success_count += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  [X] Failed: {str(e)}"))
                fail_count += 1

        self.stdout.write(self.style.WARNING("-" * 30))
        self.stdout.write(f"Test Complete. Success: {success_count}, Failed: {fail_count}")
