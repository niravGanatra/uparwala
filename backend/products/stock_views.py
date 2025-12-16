from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import StockNotification, Product
from .stock_serializers import StockNotificationSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_stock_notification(request):
    """
    Register a customer for stock notification when product is back in stock
    
    Body params:
    - product_id: ID of the product
    - email: Email address (optional if phone provided)
    - phone: Phone number (optional if email provided) 
    """
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response(
            {'error': 'product_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if already registered
    email = request.data.get('email', '').strip()
    phone = request.data.get('phone', '').strip()
    
    if email:
        existing = StockNotification.objects.filter(
            product=product,
            email=email,
            notified=False
        ).exists()
        if existing:
            return Response(
                {'message': 'You are already registered for this notification'},
                status=status.HTTP_200_OK
            )
    
    # Create notification request
    serializer = StockNotificationSerializer(data={
        'product': product.id,
        'email': email,
        'phone': phone
    })
    
    if serializer.is_valid():
        serializer.save()
        logger.info(f"Stock notification registered for product {product.id}: {email or phone}")
        return Response({
            'message': 'You will be notified when this product is back in stock',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def notify_customers_stock_available(product):
    """
    Notify all customers waiting for a product to be back in stock
    This function is called when product stock is updated
    """
    if product.stock_status != 'instock' or product.stock <= 0:
        return
    
    # Get all pending notifications for this product
    notifications = StockNotification.objects.filter(
        product=product,
        notified=False
    )
    
    if not notifications.exists():
        return
    
    notified_count = 0
    
    for notification in notifications:
        try:
            # Send email notification
            if notification.email:
                subject = f"{product.name} is back in stock!"
                message = f"""
Hello!

Great news! The product "{product.name}" that you were waiting for is now back in stock.

Product: {product.name}
Price: ₹{product.price}

Visit our website to order now before it's gone again!

Thank you for your patience.

Best regards,
Uparwala Team
                """.strip()
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [notification.email],
                    fail_silently=True
                )
                logger.info(f"Sent stock notification email to {notification.email}")
            
            # TODO: Send SMS notification if phone is provided
            # This requires SMS service integration (Twilio, etc.)
            if notification.phone:
                logger.info(f"SMS notification queued for {notification.phone} (not implemented)")
            
            # Mark as notified
            notification.notified = True
            notification.notified_at = timezone.now()
            notification.save()
            notified_count += 1
            
        except Exception as e:
            logger.error(f"Failed to send notification: {str(e)}")
    
    logger.info(f"Notified {notified_count} customers about {product.name} stock availability")
