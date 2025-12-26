from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Product, StockNotification
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
import logging

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Product)
def check_stock_status_change(sender, instance, **kwargs):
    """
    Check if product stock status changed from out of stock to in stock.
    Note: We use pre_save to compare with old instance, BUT instance.pk must exist.
    """
    if instance.pk:
        try:
            old_product = Product.objects.get(pk=instance.pk)
            # Check if it was out of stock and now is in stock (or managed stock > 0)
            was_out_of_stock = (old_product.manage_stock and old_product.stock <= 0) or old_product.stock_status == 'outofstock'
            is_now_in_stock = (instance.manage_stock and instance.stock > 0) or instance.stock_status == 'instock'

            if was_out_of_stock and is_now_in_stock:
                # We can't send email in pre_save reliably if transaction rolls back, 
                # but for simplicity we'll trigger a function or set a flag to handle in post_save.
                # Actually, strictly speaking, we should do this in post_save, but we need old state.
                # A common pattern is to set a flag on the instance.
                instance._back_in_stock_triggered = True
        except Product.DoesNotExist:
            pass

@receiver(post_save, sender=Product)
def trigger_back_in_stock_notifications(sender, instance, created, **kwargs):
    """
    Send notifications if back-in-stock flag was set.
    """
    if hasattr(instance, '_back_in_stock_triggered') and instance._back_in_stock_triggered:
        # Find pending notifications
        notifications = StockNotification.objects.filter(product=instance, notified=False)
        count = notifications.count()
        
        if count > 0:
            logger.info(f"Triggering Back-in-Stock notifications for {instance.name} ({count} recipients)")
            
            for notif in notifications:
                try:
                    if notif.email:
                        context = {
                            'customer_name': 'Customer', # or parse email if possible, generic 'Customer' is safer
                            'product_name': instance.name,
                            'product_slug': instance.slug
                        }
                        email_data = get_email_template('back_in_stock', context)
                        if email_data:
                            send_email_via_resend(notif.email, email_data['subject'], email_data['content'])
                            notif.notified = True
                            notif.notified_at = timezone.now()
                            notif.save()
                except Exception as e:
                    logger.error(f"Failed to send back-in-stock email to {notif.email}: {e}")
