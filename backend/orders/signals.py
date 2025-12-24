from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from .shiprocket_models import OrderTrackingStatus
from notifications.tasks import send_sms_task, send_whatsapp_task, send_notification_email
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
def notify_order_placed(sender, instance, created, **kwargs):
    """Notify user when order is placed"""
    if created:
        try:
            # 1. Email Notification
            if instance.user and instance.user.email:
                send_notification_email.delay(
                    'order_confirmation',
                    instance.user.email,
                    {
                        'order_id': instance.id,
                        'customer_name': instance.user.first_name or 'there',
                        'total_amount': float(instance.total_amount)
                    }
                )

            # 2. SMS/WhatsApp Notification
            user_phone = instance.shipping_address_data.get('phone')
            if user_phone:
                amount = float(instance.total_amount)
                msg = f"Hi {instance.user.first_name or 'there'}, your order #{instance.id} has been placed successfully! Total: {amount:.2f}. We will notify you when it ships."
                send_sms_task.delay(user_phone, msg)
                send_whatsapp_task.delay(user_phone, msg)
        except Exception as e:
            logger.error(f"Failed to send order placed notification: {e}")

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
