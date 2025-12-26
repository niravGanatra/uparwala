from django.core.management.base import BaseCommand
from django.utils import timezone
from vendors.models import VendorProfile
from orders.models import OrderItem
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
from django.db.models import Sum
import datetime
from decimal import Decimal

class Command(BaseCommand):
    help = 'Send monthly commission invoices to vendors'

    def handle(self, *args, **kwargs):
        self.stdout.write("Generating Commission Invoices...")
        
        # Target: Previous Month
        today = timezone.now()
        first = today.replace(day=1)
        last_month = first - datetime.timedelta(days=1)
        month_str = last_month.strftime('%B %Y')
        
        # Range
        start_date = last_month.replace(day=1)
        end_date = first # exclusive
        
        vendors = VendorProfile.objects.filter(verification_status='verified')
        
        for vendor in vendors:
            if not vendor.user.email:
                continue
                
            # Calculate Commission
            # Commission = sum( (item.price * commission_rate) )
            # Assuming flat 10% for now or from settings
            
            # Find delivered items in that month
            items = OrderItem.objects.filter(
                vendor=vendor,
                order__status='DELIVERED',
                order__updated_at__gte=start_date,
                order__updated_at__lt=end_date
            )
            
            if not items.exists():
                continue
                
            total_sales = items.aggregate(Sum('price'))['price__sum'] or Decimal('0.00')
            commission_rate = Decimal('0.10') # 10%
            total_commission = total_sales * commission_rate
            
            try:
                context = {
                    'vendor_name': vendor.store_name,
                    'month': month_str,
                    'total_commission': float(total_commission),
                    'total_sales': float(total_sales)
                }
                
                email_data = get_email_template('vendor_commission_invoice', context)
                
                if email_data:
                    send_email_via_resend(vendor.user.email, email_data['subject'], email_data['content'])
                    self.stdout.write(f"Sent invoice to {vendor.store_name} for {month_str}")
                    
            except Exception as e:
                self.stderr.write(f"Failed to email {vendor.store_name}: {e}")

        self.stdout.write(self.style.SUCCESS("Commission Invoices Processed"))
