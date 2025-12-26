from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Check for orders breaching SLA (shipping > 24 hours) and notify vendors'

    def handle(self, *args, **kwargs):
        self.stdout.write("Checking for SLA breaches...")
        
        # Window: Orders created between 24 and 48 hours ago that are still pending/processing
        now = timezone.now()
        start_window = now - timedelta(hours=48)
        end_window = now - timedelta(hours=24)
        
        overdue_orders = Order.objects.filter(
            status__in=['PENDING', 'PROCESSING'],
            created_at__gte=start_window,
            created_at__lte=end_window
        )
        
        count = 0
        for order in overdue_orders:
            # Group items by vendor
            vendor_ids = order.items.values_list('product__vendor', flat=True).distinct()
            from vendors.models import VendorProfile
            vendors = VendorProfile.objects.filter(id__in=vendor_ids)
            
            for vendor in vendors:
                if not vendor.user.email:
                    continue
                    
                # Ideally check if we already sent warning. 
                # For this implementation, we rely on the 24-48h window.
                # If cron runs daily, it catches it once.
                
                try:
                    self.stdout.write(f"Sending SLA warning to {vendor.store_name} for Order #{order.id}")
                    
                    context = {
                        'vendor_name': vendor.store_name,
                        'order_id': order.id,
                    }
                    
                    email_data = get_email_template('vendor_sla_warning', context)
                    if email_data:
                        try:
                            send_email_via_resend(
                                to_email=vendor.user.email,
                                subject=email_data['subject'],
                                html_content=email_data['content']
                            )
                            count += 1
                        except Exception as e:
                            logger.error(f"Failed to send set SLA email to {vendor.user.email}: {e}")
                            
                except Exception as e:
                    logger.error(f"Error processing SLA for vendor {vendor.id}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Sent {count} SLA warnings."))
