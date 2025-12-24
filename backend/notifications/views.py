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
            
        # Context data for testing different templates
        context = {
            'name': 'Test User',
            'customer_name': 'Test Customer',
            'vendor_name': 'Test Vendor',
            'order_id': '12345',
            'total_amount': '999.00',
            'tracking_number': 'TRACK123',
            'courier_name': 'FedEx',
            'amount': '5000.00',
            'transaction_id': 'TXN789',
            'date': '2025-11-29',
            'product_name': 'Awesome Product',
            'product_slug': 'awesome-product',
            'reason': 'Image quality low',
        }
        
        # Send email (using .delay() for async execution if Celery is running)
        # For testing without Celery worker, we can call it directly or use .delay()
        # If Celery is not running, .delay() might queue it but not execute it.
        # For immediate feedback in dev, we might want to call it synchronously if needed,
        # but let's stick to the pattern.
        
        try:
            # Check if we want to force sync for testing
            force_sync = request.data.get('sync', False)
            
            if force_sync:
                result = send_notification_email(template, email, context)
                status = 'sent' if result else 'failed'
            else:
                send_notification_email.delay(template, email, context)
                status = 'queued'
                
            return Response({
                'message': f'Email test {status}',
                'template': template,
                'recipient': email
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)
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
