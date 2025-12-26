from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.conf import settings


class TestEmailView(APIView):
    """
    Test endpoint to verify email sending is configured correctly
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Check if Resend API key is configured
        resend_api_key = getattr(settings, 'RESEND_API_KEY', None)
        
        result = {
            'resend_configured': bool(resend_api_key and resend_api_key.strip()),
            'default_from_email': settings.DEFAULT_FROM_EMAIL,
        }
        
        # Try to send a test email if configured
        if result['resend_configured']:
            try:
                from notifications.resend_service import send_email_via_resend
                from notifications.email_templates import get_email_template
                
                # Send test email to admin
                test_email = request.user.email or 'admin@uparwala.in'
                
                context = {
                    'vendor_name': 'Test Vendor',
                }
                email_data = get_email_template('vendor_approved', context)
                
                if email_data:
                    response = send_email_via_resend(
                        to_email=test_email,
                        subject="[TEST] " + email_data['subject'],
                        html_content=email_data['content']
                    )
                    result['test_email_sent'] = True
                    result['test_email_to'] = test_email
                    result['resend_response'] = str(response)
                else:
                    result['test_email_sent'] = False
                    result['error'] = 'Email template not found'
                    
            except Exception as e:
                result['test_email_sent'] = False
                result['error'] = str(e)
        else:
            result['message'] = 'RESEND_API_KEY not configured. Set it in Railway environment variables.'
        
        return Response(result)
