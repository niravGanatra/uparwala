from django.db.models.signals import post_save, pre_save
import datetime
from django.dispatch import receiver
from .models import Order
from .shiprocket_models import OrderTrackingStatus
from notifications.tasks import send_sms_task, send_whatsapp_task, send_notification_email
from notifications.email_templates import get_email_template
from notifications.resend_service import send_email_via_resend
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
@receiver(post_save, sender=Order)
def notify_order_placed(sender, instance, created, **kwargs):
    """Notify user when order is placed"""
    if created:
        def _send_notifications():
            try:
                # 1. Email Notification
                if instance.user and instance.user.email:
                    try:
                        send_notification_email.delay(
                            'order_confirmation',
                            instance.user.email,
                            {
                                'order_id': instance.id,
                                'customer_name': instance.user.first_name or 'there',
                                'total_amount': float(instance.total_amount)
                            }
                        )
                    except Exception as e:
                        logger.error(f"Broker connection failed for customer email: {e}")
                        return # Fail fast if broker is down

                # 2. SMS/WhatsApp Notification
                user_phone = instance.shipping_address_data.get('phone')
                if user_phone:
                    try:
                        amount = float(instance.total_amount)
                        msg = f"Hi {instance.user.first_name if instance.user else 'there'}, your order #{instance.id} has been placed successfully! Total: {amount:.2f}. We will notify you when it ships."
                        send_sms_task.delay(user_phone, msg)
                        send_whatsapp_task.delay(user_phone, msg)
                    except Exception:
                        pass # Ignore secondary failures if first succeeded, or maybe break too?

                # 3. Notify Vendors
                from collections import defaultdict
                vendor_items = defaultdict(list)
                
                # Group items by vendor
                for item in instance.items.all():
                    if item.product.vendor:
                        vendor_items[item.product.vendor].append(item)
                
                # Send email to each vendor
                for vendor_profile, items in vendor_items.items():
                    if not vendor_profile.user.email:
                        continue
                        
                    # Build items list HTML
                    items_html = ""
                    for item in items:
                        items_html += f"<li>{item.product.name} (SKU: {item.product.sku or 'N/A'}) x {item.quantity}</li>"
                    
                    # Format shipping address
                    addr_data = instance.shipping_address_data
                    shipping_address = f"{addr_data.get('name', 'Customer')}<br>"
                    shipping_address += f"{addr_data.get('address_line1', '')}<br>"
                    if addr_data.get('address_line2'):
                        shipping_address += f"{addr_data.get('address_line2', '')}<br>"
                    shipping_address += f"{addr_data.get('city', '')}, {addr_data.get('state', '')} - {addr_data.get('pincode', '')}<br>"
                    shipping_address += f"Phone: {addr_data.get('phone', '')}"

                    vendor_context = {
                        'vendor_name': vendor_profile.store_name,
                        'order_id': instance.id,
                        'items_html': items_html,
                        'shipping_address': shipping_address,
                        'ship_by_date': (instance.created_at + datetime.timedelta(days=2)).strftime('%d %b %Y') # SLA: 48 hours
                    }
                    
                    try:
                        send_notification_email.delay('vendor_new_order', vendor_profile.user.email, vendor_context)
                    except Exception:
                        pass

            except Exception as e:
                logger.error(f"Failed to send order placed notification: {e}")

        # Execute in a separate thread after transaction commit to ensure
        # the response is NOT blocked even if Redis/Celery times out.
        from django.db import transaction
        import threading

        def start_notification_thread():
            thread = threading.Thread(target=_send_notifications)
            thread.daemon = True # Ensure thread doesn't block shutdown
            thread.start()

        transaction.on_commit(start_notification_thread)

@receiver(post_save, sender=Order)
def notify_order_cancelled(sender, instance, **kwargs):
    """Notify vendor when order is cancelled"""
    if instance.pk:
        try:
            # We need to know previous status to detect change to CANCELLED
            # However, post_save doesn't give 'previous' instance easily without dirty fields or pre_save check.
            # But the 'refund_processed' signal uses pre_save. Let's move this logic there or use a separate pre_save.
            pass 
        except Exception:
            pass

@receiver(pre_save, sender=Order)
def notify_order_status_change_pre(sender, instance, **kwargs):
    """Handle status change notifications for Candidates/Vendors (Cancellation)"""
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)
            
            # Check for Cancellation
            if instance.status == 'CANCELLED' and old_order.status != 'CANCELLED':
                # Notify Vendors
                vendor_ids = instance.items.values_list('product__vendor', flat=True).distinct()
                from vendors.models import VendorProfile
                vendors = VendorProfile.objects.filter(id__in=vendor_ids)
                
                for vendor in vendors:
                    if vendor.user.email:
                        context = {
                            'vendor_name': vendor.store_name,
                            'order_id': instance.id
                        }
                        send_notification_email.delay('vendor_order_cancelled', vendor.user.email, context)

        except Order.DoesNotExist:
            pass


@receiver(post_save, sender=OrderTrackingStatus)
def notify_order_status_update(sender, instance, created, **kwargs):
    """Notify user on tracking updates (Shipped, Out for Delivery, Delivered)"""
    if created:
        try:
            order = instance.order
            status = instance.status.upper()
            tracking_url = ""
            courier_name = ""
            if instance.shipment:
                courier_name = instance.shipment.courier_name or 'Courier'
                if instance.shipment.awb_code:
                     tracking_url = f"https://shiprocket.co/tracking/{instance.shipment.awb_code}"

            # 1. Email Notification
            if order.user and order.user.email:
                email_template = None
                email_context = {
                    'order_id': order.id,
                    'customer_name': order.user.first_name or 'Customer',
                    'tracking_number': instance.shipment.awb_code if instance.shipment else 'N/A',
                    'courier_name': courier_name
                }

                if 'SHIPPED' in status:
                    email_template = 'order_shipped'
                elif 'OUT FOR DELIVERY' in status:
                    email_template = 'order_out_for_delivery'
                elif 'DELIVERED' in status:
                    email_template = 'order_delivered'
                
                if email_template:
                    send_notification_email.delay(email_template, order.user.email, email_context)

            # 3. Vendor RTO Notification
            if 'RTO' in status and 'DELIVERED' in status:
                 vendor_ids = order.items.values_list('product__vendor', flat=True).distinct()
                 from vendors.models import VendorProfile
                 vendors = VendorProfile.objects.filter(id__in=vendor_ids)
                 
                 for vendor in vendors:
                    if vendor.user.email:
                        context = {
                            'vendor_name': vendor.store_name,
                            'order_id': order.id
                        }
                        # We use send_notification_email.delay if template exists, or direct resend
                        # Using direct resend here for simplicity as I didn't register this task in tasks.py yet
                        # actually send_notification_email handles template lookup.
                        send_notification_email.delay('vendor_rto_delivered', vendor.user.email, context)

            # 2. SMS/WhatsApp Notification
            user_phone = order.shipping_address_data.get('phone')
            if user_phone:
                msg = None
                if 'SHIPPED' in status:
                     msg = f"Your order #{order.id} has been shipped! Track it here: {tracking_url}"
                elif 'OUT FOR DELIVERY' in status:
                     msg = f"Heads up! Your order #{order.id} is out for delivery today."
                elif 'DELIVERED' in status:
                     msg = f"Your order #{order.id} has been delivered. Thank you for shopping with us!"

                if msg:
                    send_sms_task.delay(user_phone, msg)
                    send_whatsapp_task.delay(user_phone, msg)
                
        except Exception as e:
            logger.error(f"Failed to trigger tracking notification: {e}")

@receiver(pre_save, sender=Order)
def notify_refund_processed(sender, instance, **kwargs):
    """
    Notify user when refund is processed (status changes to REFUNDED or payment_status to 'refunded').
    """
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)
            # Check if status changed to refunded
            is_refunded = (instance.status == 'REFUNDED' and old_order.status != 'REFUNDED') or \
                          (instance.payment_status == 'refunded' and old_order.payment_status != 'refunded')
            
            if is_refunded:
                try:
                    customer_email = instance.user.email if instance.user else instance.guest_email
                    customer_name = instance.user.get_full_name() if instance.user else 'Guest'
                    
                    if customer_email:
                        context = {
                            'customer_name': customer_name,
                            'order_id': instance.id,
                            'amount': float(instance.total_amount) # Or specific refund amount if we tracked it separately
                        }
                        
                        # Note: We can't use celery tasks here if we want immediate feedback, or if tasks.py depends on models differently.
                        # Assuming send_email_via_resend is available directly.
                        # But wait, send_notification_email.delay is better if available.
                        # I'll use send_notification_email.delay to be consistent.
                        
                        send_notification_email.delay('refund_processed', customer_email, context)
                        logger.info(f"Triggered refund email for Order #{instance.id}")
                        
                except Exception as e:
                    logger.error(f"Failed to send refund email: {e}")
                    
        except Order.DoesNotExist:
            pass
