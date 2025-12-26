from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .tasks import send_notification_email

class TestEmailView(APIView):
    """Test endpoint to trigger a notification email (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        email = request.data.get('email')
        template = request.data.get('template', 'welcome_email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=400)
            
        # Context generation based on template type
        base_context = {
            'name': 'Test User',
            'customer_name': 'Test Customer',
            'vendor_name': 'Test Vendor Store',
            'order_id': 'ORD-TEST-123',
            'transaction_id': 'TXN-ABC-789',
            'date': '26 Dec 2025',
        }
        
        specific_contexts = {
            # --- Customer Templates ---
            'welcome_email': {},
            'password_reset': {
                'reset_url': 'https://uparwala.com/reset-password/token123'
            },
            'order_confirmation': {
                'total_amount': '1499.00',
            },
            'order_shipped': {
                'tracking_number': 'AWB123456789',
                'courier_name': 'BlueDart'
            },
            'order_out_for_delivery': {},
            'order_delivered': {},
            'order_cancellation': {
                'refund_amount': '1499.00'
            },
            'payment_received': {
                'amount': '1499.00'
            },
            'return_request_received': {},
            'refund_processed': {
                'amount': '1499.00'
            },
            'rate_and_review': {
                'product_name': 'Premium Cotton Shirt',
                'product_slug': 'premium-cotton-shirt'
            },
            'abandoned_cart': {},
            'back_in_stock': {
                'product_name': 'Sony WH-1000XM5',
                'product_slug': 'sony-wh-1000xm5'
            },
            
            # --- Vendor Templates ---
            'vendor_registration_received': {},
            'vendor_account_approved': {},
            'vendor_account_rejected': {
                'reason': 'GST certificate invalid or blurred.'
            },
            'vendor_new_order': {
                'items_html': '<li>Men\'s T-Shirt (Blue, L) x 1</li><li>Slim Fit Jeans (Black, 32) x 1</li>',
                'shipping_address': 'John Doe<br>123 Main St<br>Mumbai, MH - 400001<br>Phone: 9876543210',
                'ship_by_date': '28 Dec 2025'
            },
            'vendor_order_cancelled': {},
            'vendor_sla_warning': {},
            'vendor_product_status_update': {
                'product_name': 'Wireless Earbuds',
                'status': 'Rejected',
                'reason': 'Description contains prohibited claims.'
            },
            'vendor_low_stock': {
                'product_name': 'Running Shoes',
                'current_stock': '3'
            },
            'vendor_payout_processed': {
                'amount': '5000.00',
                'total_sales': '5500.00',
                'commission': '500.00'
            },
            'vendor_commission_invoice': {
                'month': 'November 2025',
                'total_commission': '450.00'
            },
            'vendor_return_requested': {
                'reason': 'Size too small'
            },
            'vendor_rto_delivered': {}
        }
        
        # Merge base with specific context
        context = base_context.copy()
        if template in specific_contexts:
            context.update(specific_contexts[template])
        
        try:
            # Check if we want to force sync for testing
            force_sync = request.data.get('sync', True) # Default to True for admin test button
            
            if force_sync:
                send_notification_email(template, email, context, raise_error=True)
                status = 'sent'
            else:
                send_notification_email.delay(template, email, context)
                status = 'queued'
                
            return Response({
                'message': f'Email {status} successfully',
                'template': template,
                'recipient': email,
                'context': context
            })
        except Exception as e:
            from django.conf import settings
            
            return Response({
                'error': str(e),
                'detail': 'Check backend logs for full traceback.'
            }, status=500)
class TestWhatsAppView(APIView):
    """Test endpoint to trigger a WhatsApp message (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        phone = request.data.get('phone')
        message = request.data.get('message', 'This is a test message from Uparwala.')
        
        if not phone:
            return Response({'error': 'Phone number is required'}, status=400)
            
        try:
            # Import service here to avoid circular imports if any
            from .twilio_service import TwilioService
            service = TwilioService()
            
            # Send message synchronously for testing
            sid = service.send_whatsapp(phone, message)
            
            if sid:
                return Response({
                    'message': 'WhatsApp test sent successfully',
                    'sid': sid,
                    'recipient': phone
                })
            else:
                return Response({'error': 'Failed to send WhatsApp message'}, status=500)
                
        except Exception as e:
            return Response({'error': str(e)}, status=500)
