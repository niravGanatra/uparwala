import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .email_templates import get_email_template

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(to_email, subject, html_content, text_content=None):
        """
        Send an email using Django's EmailMultiAlternatives.
        This handles both HTML and plain text versions.
        """
        try:
            if not to_email:
                logger.warning("Attempted to send email with no recipient address.")
                return False

            from_email = settings.DEFAULT_FROM_EMAIL
            
            # Create the email object
            msg = EmailMultiAlternatives(subject, text_content or html_content, from_email, [to_email])
            
            # Attach HTML content
            msg.attach_alternative(html_content, "text/html")
            
            # Send
            msg.send()
            logger.info(f"Email sent successfully to {to_email} | Subject: {subject}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    @staticmethod
    def send_order_confirmation(order):
        """
        Send order confirmation email (Invoice) to customer
        """
        try:
            customer_email = order.guest_email if not order.user else order.user.email
            customer_name = order.billing_address_data.get('full_name') if order.billing_address_data else (order.user.get_full_name() if order.user else 'Guest')
            
            if not customer_email:
                logger.warning(f"No email found for Order #{order.id}, skipping confirmation email.")
                return False

            # Prepare context for the template
            context = {
                'customer_name': customer_name,
                'order_id': order.id,
                'order_date': order.created_at.strftime("%d %b, %Y"),
                'status': order.status,
                'payment_method': order.get_payment_method_display(),
                'payment_status': order.get_payment_status_display(),
                
                # Payment Breakdown
                'subtotal': order.subtotal,
                'discount_amount': order.discount_amount,
                'shipping_amount': order.shipping_amount,
                'tax_amount': order.tax_amount,
                'total_amount': order.total_amount,
                'tax_breakdown': order.tax_breakdown, # Contains CGST/SGST/IGST details
                
                # Addresses
                'shipping_address': order.shipping_address_data,
                'billing_address': order.billing_address_data,
                
                # Items
                'items': order.items.all()
            }
            
            # Get template content
            template = get_email_template('order_confirmation', context)
            if not template:
                logger.error("Order confirmation template not found.")
                return False

            # Send
            return EmailService.send_email(
                to_email=customer_email,
                subject=template['subject'],
                html_content=template['content']
            )

        except Exception as e:
            logger.error(f"Error sending order confirmation for Order #{order.id}: {str(e)}")
            return False
