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
def notify_order_placed(sender, instance, created, **kwargs):
    """Notify user when order is placed"""
    if created:
        def _send_notifications():
            try:
                # 1. Customer order confirmation email (rich context for invoice template)
                customer_email = instance.guest_email if not instance.user else instance.user.email
                if customer_email:
                    try:
                        customer_name = (
                            instance.billing_address_data.get('full_name')
                            if instance.billing_address_data
                            else (instance.user.get_full_name() if instance.user else 'Guest')
                        )
                        context = {
                            'customer_name': customer_name,
                            'order_id': instance.id,
                            'order_date': instance.created_at.strftime('%d %b, %Y'),
                            'status': instance.status,
                            'payment_method': instance.get_payment_method_display(),
                            'payment_status': instance.get_payment_status_display(),
                            'subtotal': instance.subtotal,
                            'discount_amount': instance.discount_amount,
                            'shipping_amount': instance.shipping_amount,
                            'tax_amount': instance.tax_amount,
                            'total_amount': instance.total_amount,
                            'tax_breakdown': instance.tax_breakdown,
                            'shipping_address': instance.shipping_address_data,
                            'billing_address': instance.billing_address_data,
                            'items': instance.items.all(),
                        }
                        from notifications.email_templates import get_email_template
                        email_data = get_email_template('order_confirmation', context)
                        if email_data:
                            send_email_via_resend(
                                to_email=customer_email,
                                subject=email_data['subject'],
                                html_content=email_data['content'],
                            )
                    except Exception as e:
                        logger.error(f"Failed to send order confirmation email for #{instance.id}: {e}")

                # 2. SMS/WhatsApp Notification
                user_phone = (instance.shipping_address_data or {}).get('phone')
                if user_phone:
                    try:
                        amount = float(instance.total_amount)
                        name = instance.user.first_name if instance.user else 'there'
                        msg = f"Hi {name}, your order #{instance.id} has been placed! Total: \u20b9{amount:.2f}. We will notify you when it ships."
                        send_sms_task.delay(user_phone, msg)
                        send_whatsapp_task.delay(user_phone, msg)
                    except Exception:
                        pass

                # 3. Notify Vendors
                from collections import defaultdict
                vendor_items = defaultdict(list)

                for item in instance.items.all():
                    if item.product.vendor:
                        vendor_items[item.product.vendor].append(item)

                for vendor_profile, items in vendor_items.items():
                    if not vendor_profile.user.email:
                        continue

                    items_html = "".join(
                        f"<li>{item.product.name} (SKU: {item.product.sku or 'N/A'}) x {item.quantity}</li>"
                        for item in items
                    )

                    addr_data = instance.shipping_address_data or {}
                    shipping_address = (
                        f"{addr_data.get('full_name', addr_data.get('name', 'Customer'))}<br>"
                        f"{addr_data.get('address_line1', '')}<br>"
                        + (f"{addr_data.get('address_line2', '')}<br>" if addr_data.get('address_line2') else "")
                        + f"{addr_data.get('city', '')}, {addr_data.get('state', '')} - {addr_data.get('pincode', '')}<br>"
                        f"Phone: {addr_data.get('phone', '')}"
                    )

                    vendor_context = {
                        'vendor_name': vendor_profile.store_name,
                        'order_id': instance.id,
                        'items_html': items_html,
                        'shipping_address': shipping_address,
                        'ship_by_date': (instance.created_at + datetime.timedelta(days=2)).strftime('%d %b %Y'),
                    }

                    try:
                        send_notification_email.delay('vendor_new_order', vendor_profile.user.email, vendor_context)
                    except Exception:
                        # Celery not running — send synchronously
                        try:
                            from notifications.email_templates import get_email_template
                            email_data = get_email_template('vendor_new_order', vendor_context)
                            if email_data:
                                send_email_via_resend(
                                    to_email=vendor_profile.user.email,
                                    subject=email_data['subject'],
                                    html_content=email_data['content'],
                                )
                        except Exception as ex:
                            logger.error(f"Failed to send vendor new order email: {ex}")

            except Exception as e:
                logger.error(f"Failed to send order placed notification: {e}")

        from django.db import transaction
        import threading

        def start_notification_thread():
            thread = threading.Thread(target=_send_notifications)
            thread.daemon = True
            thread.start()

        transaction.on_commit(start_notification_thread)

@receiver(post_save, sender=Order)
def notify_order_cancelled(sender, instance, **kwargs):
    """No-op: customer cancellation email is handled in notify_order_status_change_pre (pre_save)"""
    pass

@receiver(pre_save, sender=Order)
def notify_order_status_change_pre(sender, instance, **kwargs):
    """Handle status change notifications on cancellation — customer + vendors"""
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)

            if instance.status == 'CANCELLED' and old_order.status != 'CANCELLED':
                # 1. Notify customer
                customer_email = instance.user.email if instance.user else instance.guest_email
                if customer_email:
                    customer_name = (
                        instance.billing_address_data.get('full_name')
                        if instance.billing_address_data
                        else (instance.user.get_full_name() if instance.user else 'Guest')
                    )
                    customer_context = {
                        'customer_name': customer_name,
                        'order_id': instance.id,
                    }
                    try:
                        from notifications.email_templates import get_email_template
                        email_data = get_email_template('order_cancellation', customer_context)
                        if email_data:
                            send_email_via_resend(
                                to_email=customer_email,
                                subject=email_data['subject'],
                                html_content=email_data['content'],
                            )
                    except Exception as e:
                        logger.error(f"Failed to send customer cancellation email for #{instance.id}: {e}")

                # 2. Notify Vendors
                vendor_ids = instance.items.values_list('product__vendor', flat=True).distinct()
                from vendors.models import VendorProfile
                vendors = VendorProfile.objects.filter(id__in=vendor_ids)

                for vendor in vendors:
                    if vendor.user.email:
                        context = {
                            'vendor_name': vendor.store_name,
                            'order_id': instance.id,
                        }
                        try:
                            send_notification_email.delay('vendor_order_cancelled', vendor.user.email, context)
                        except Exception:
                            try:
                                from notifications.email_templates import get_email_template
                                email_data = get_email_template('vendor_order_cancelled', context)
                                if email_data:
                                    send_email_via_resend(
                                        to_email=vendor.user.email,
                                        subject=email_data['subject'],
                                        html_content=email_data['content'],
                                    )
                            except Exception as ex:
                                logger.error(f"Failed to send vendor cancellation email: {ex}")

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
