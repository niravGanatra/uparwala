from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import logging

from .models import Order, OrderItem
from .package_models import OrderPackage, PackageItem
from .package_serializers import (
    OrderPackageSerializer,
    PackageItemSerializer,
    CancelItemSerializer,
    OrderItemCancellationSerializer
)

logger = logging.getLogger(__name__)


# Multi-Package Endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_packages(request, order_id):
    """List all packages for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check permission
    if order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You do not have permission to view this order'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    packages = OrderPackage.objects.filter(order=order).prefetch_related('items__order_item__product')
    serializer = OrderPackageSerializer(packages, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_package(request, order_id):
    """Create a new package for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Get next package number
    last_package = OrderPackage.objects.filter(order=order).order_by('-package_number').first()
    next_number = (last_package.package_number + 1) if last_package else 1
    
    # Create package
    package_data = request.data.copy()
    package_data['order'] = order.id
    package_data['package_number'] = next_number
    
    serializer = OrderPackageSerializer(data=package_data)
    if serializer.is_valid():
        package = serializer.save()
        
        # Add items to package if provided
        items_data = request.data.get('items', [])
        for item_data in items_data:
            PackageItem.objects.create(
                package=package,
                order_item_id=item_data['order_item_id'],
                quantity=item_data['quantity']
            )
        
        # Refresh to get items
        package.refresh_from_db()
        response_serializer = OrderPackageSerializer(package)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Partial Cancellation Endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order_item(request, item_id):
    """Cancel partial or full quantity of an order item"""
    order_item = get_object_or_404(OrderItem, id=item_id)
    
    # Check permission
    if order_item.order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You do not have permission to cancel this item'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if order can be cancelled
    if order_item.order.status in ['DELIVERED', 'CANCELLED']:
        return Response(
            {'error': f'Cannot cancel items from {order_item.order.status} orders'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate request
    serializer = CancelItemSerializer(data=request.data, context={'order_item': order_item})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    quantity = serializer.validated_data['quantity']
    reason = serializer.validated_data['reason']
    
    try:
        # Cancel the item
        refund_amount = order_item.cancel_partial(quantity, reason)
        
        # Update order total
        order = order_item.order
        order.total_amount -= refund_amount
        order.save()
        
        logger.info(f"Cancelled {quantity} units of item {item_id}. Refund: ₹{refund_amount}")

        # Send Cancellation Email
        try:
            from notifications.resend_service import send_email_via_resend
            from notifications.email_templates import get_email_template
            
            customer_email = order.user.email if order.user else getattr(order, 'guest_email', None)
            customer_name = order.user.get_full_name() if order.user else 'Guest'
            
            if customer_email:
                context = {
                    'customer_name': customer_name,
                    'order_id': order.id,
                    'refund_amount': refund_amount,
                    # We might want to mention which item was cancelled in the email template in usage
                }
                # Using existing 'order_cancellation' template
                email_data = get_email_template('order_cancellation', context)
                if email_data:
                    # Modify subject to be specific if partial? For now keep standard "Order Cancelled" 
                    # or strictly "Item Cancelled".
                    # Let's use the template as is since user requested "Order Cancellation".
                    send_email_via_resend(customer_email, email_data['subject'], email_data['content'])
        except Exception as e:
            logger.error(f"Failed to send cancellation email: {e}")
        
        # Return updated item
        response_serializer = OrderItemCancellationSerializer(order_item)
        return Response({
            'message': f'Successfully cancelled {quantity} item(s)',
            'refund_amount': float(refund_amount),
            'item': response_serializer.data
        })
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Failed to cancel item {item_id}: {str(e)}")
        return Response(
            {'error': 'Failed to process cancellation'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cancellable_items(request, order_id):
    """Get list of items that can be cancelled for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check permission
    if order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You do not have permission to view this order'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get items that can still be cancelled
    items = order.items.filter(cancelled_quantity__lt=models.F('quantity'))
    serializer = OrderItemCancellationSerializer(items, many=True)
    
    return Response({
        'order_id': order.id,
        'order_status': order.status,
        'can_cancel': order.status not in ['DELIVERED', 'CANCELLED'],
        'items': serializer.data
    })
