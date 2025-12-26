from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send review request emails to customers 7 days after delivery'

    def handle(self, *args, **options):
        self.stdout.write("Checking for review request candidates...")
        
        # Criteria: Delivered > 7 days ago, and email not sent yet
        seven_days_ago = timezone.now() - timedelta(days=7)
        # Also limit to recent past to avoid spamming very old orders if running for first time
        # e.g. up to 30 days ago
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        orders = Order.objects.filter(
            status='DELIVERED',
            delivered_at__lte=seven_days_ago,
            delivered_at__gte=thirty_days_ago,
            review_request_sent=False
        )
        
        count = orders.count()
        self.stdout.write(f"Found {count} orders eligible for review request.")
        
        success_count = 0
        
        for order in orders:
            try:
                # Prepare context
                customer_email = order.user.email if order.user else getattr(order, 'guest_email', None)
                customer_name = order.user.get_full_name() if order.user else 'Guest'
                
                # Get the first item for product context (simplification)
                first_item = order.items.first()
                if not first_item:
                    continue
                    
                product_name = first_item.product.name
                product_slug = first_item.product.slug
                
                if customer_email:
                    context = {
                        'customer_name': customer_name,
                        'product_name': product_name,
                        'product_slug': product_slug,
                        'order_id': order.id
                    }
                    
                    email_data = get_email_template('rate_and_review', context)
                    
                    if email_data:
                        send_email_via_resend(
                            to_email=customer_email,
                            subject=email_data['subject'],
                            html_content=email_data['content']
                        )
                        
                        # Update Flag
                        order.review_request_sent = True
                        order.review_request_sent_at = timezone.now()
                        order.save()
                        
                        success_count += 1
                        
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed to send review request for Order {order.id}: {e}"))
                logger.error(f"Failed to send review request for Order {order.id}: {e}")
        
        self.stdout.write(self.style.SUCCESS(f"Review requests sent: {success_count}/{count}"))
