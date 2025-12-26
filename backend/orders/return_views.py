from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Order
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_return(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status != 'DELIVERED':
        return Response({'error': 'Only delivered orders can be returned'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already requested
    if order.return_status:
        return Response({'error': f'Return already {order.return_status}'}, status=status.HTTP_400_BAD_REQUEST)
        
    reason = request.data.get('reason')
    if not reason:
        return Response({'error': 'Return reason is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Update Order
    order.return_status = 'requested'
    order.return_reason = reason
    order.save()

    # Send Email
    try:
        customer_email = order.user.email
        customer_name = order.user.get_full_name()
        
        context = {
            'customer_name': customer_name,
            'order_id': order.id,
        }
        
        email_data = get_email_template('return_request_received', context)
        if email_data:
            send_email_via_resend(customer_email, email_data['subject'], email_data['content'])
            
    except Exception as e:
        logger.error(f"Failed to send return request email: {e}")

    # Notify Vendors
    try:
        vendor_ids = order.items.values_list('product__vendor', flat=True).distinct()
        from vendors.models import VendorProfile
        vendors = VendorProfile.objects.filter(id__in=vendor_ids)
        
        for vendor in vendors:
            if vendor.user.email:
                context = {
                    'vendor_name': vendor.store_name,
                    'order_id': order.id,
                    'reason': reason
                }
                email_data = get_email_template('vendor_return_requested', context)
                if email_data:
                    send_email_via_resend(vendor.user.email, email_data['subject'], email_data['content'])
    except Exception as e:
         logger.error(f"Failed to send vendor return email: {e}")

    return Response({'message': 'Return request submitted successfully'})
