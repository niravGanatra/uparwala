from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from .models import Order
from .shiprocket_models import ShipmentTracking, OrderTrackingStatus
from .shiprocket_service import ShiprocketService
from products.models import Product
from .shiprocket_serializers import (
    ShipmentTrackingSerializer, 
    OrderTrackingStatusSerializer,
    TrackingHistorySerializer
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_shipment(request, order_id):
    """Create shipment in Shiprocket for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check if shipment already exists
    if ShipmentTracking.objects.filter(order=order).exists():
        return Response(
            {'error': 'Shipment already exists for this order'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check order status
    if order.status not in ['PROCESSING', 'PENDING']:
        return Response(
            {'error': 'Order must be in PROCESSING or PENDING status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        service = ShiprocketService()
        
        # Determine if we should filter by vendor
        vendor_filter = request.user if not request.user.is_staff else None
        
        shipments = service.create_orders(order, vendor=vendor_filter)
        
        if not shipments:
             return Response(
                {'error': 'No shipments created (check logs for errors)'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = ShipmentTrackingSerializer(shipments, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Failed to create shipment for order {order_id}: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_awb(request, order_id):
    """Generate AWB for a shipment"""
    order = get_object_or_404(Order, id=order_id)
    
    # Get shipment based on user role
    shipment_query = ShipmentTracking.objects.filter(order=order)
    if not request.user.is_staff:
        shipment_query = shipment_query.filter(vendor=request.user)
        
    shipment = shipment_query.first()
    
    if not shipment:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if shipment.awb_code:
        return Response(
            {'error': 'AWB already generated for this shipment'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get courier_id from request or use recommended
    courier_id = request.data.get('courier_id')
    
    try:
        service = ShiprocketService()
        shipment = service.generate_awb(shipment, courier_id)
        
        serializer = ShipmentTrackingSerializer(shipment)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Failed to generate AWB for order {order_id}: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_label(request, order_id):
    """Generate shipping label for a shipment"""
    order = get_object_or_404(Order, id=order_id)
    
    # Get shipment based on user role
    shipment_query = ShipmentTracking.objects.filter(order=order)
    if not request.user.is_staff:
        shipment_query = shipment_query.filter(vendor=request.user)
        
    shipment = shipment_query.first()
    
    if not shipment:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not shipment.awb_code:
        return Response(
            {'error': 'AWB must be generated before creating label'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if shipment.label_url:
        return Response({
            'label_url': shipment.label_url,
            'message': 'Label already exists'
        })
    
    try:
        service = ShiprocketService()
        label_url = service.generate_label(shipment)
        
        return Response({
            'label_url': label_url,
            'message': 'Label generated successfully'
        })
        
    except Exception as e:
        logger.error(f"Failed to generate label for order {order_id}: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_pickup(request, order_id):
    """Schedule courier pickup for a shipment"""
    order = get_object_or_404(Order, id=order_id)
    
    # Get shipment based on user role
    shipment_query = ShipmentTracking.objects.filter(order=order)
    if not request.user.is_staff:
        shipment_query = shipment_query.filter(vendor=request.user)
        
    shipment = shipment_query.first()
    
    if not shipment:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if not shipment.awb_code:
        return Response(
            {'error': 'AWB must be generated before scheduling pickup'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if shipment.pickup_scheduled:
        return Response({
            'message': 'Pickup already scheduled',
            'pickup_token': shipment.pickup_token_number
        })
    
    try:
        service = ShiprocketService()
        result = service.schedule_pickup(shipment)
        
        return Response({
            'message': 'Pickup scheduled successfully',
            'pickup_token': shipment.pickup_token_number,
            'result': result
        })
        
    except Exception as e:
        logger.error(f"Failed to schedule pickup for order {order_id}: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tracking(request, order_id):
    """Get current tracking information for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check permissions
    is_vendor = False
    if request.user.is_staff:
        pass
    elif order.user == request.user:
        pass
    elif order.items.filter(vendor=request.user).exists():
        is_vendor = True
    else:
        return Response(
            {'error': 'You do not have permission to view this order'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        if is_vendor:
            shipment = ShipmentTracking.objects.get(order=order, vendor=request.user)
        else:
            # specific logic for admin/customer ?
            # For now return the first or handle multiple. 
            # If multiple vendors, customer needs to see all.
            # This view seems designed for single shipment.
            # For admin, maybe filter by query param or default to first.
             shipment = ShipmentTracking.objects.filter(order=order).first()
             if not shipment:
                 raise ShipmentTracking.DoesNotExist
        
        # Update tracking from Shiprocket
        if shipment and shipment.awb_code:
            try:
                service = ShiprocketService()
                service.track_shipment(shipment)
            except Exception as e:
                logger.warning(f"Failed to update tracking: {str(e)}")
        
        serializer = ShipmentTrackingSerializer(shipment)
        return Response(serializer.data)
        
    except ShipmentTracking.DoesNotExist:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_tracking_history(request, order_id):
    """Get full tracking history for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    # Check if user owns the order or is admin
    if order.user != request.user and not request.user.is_staff:
        return Response(
            {'error': 'You do not have permission to view this order'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        shipment = ShipmentTracking.objects.get(order=order)
        tracking_events = OrderTrackingStatus.objects.filter(order=order).order_by('-timestamp')
        
        data = {
            'order_id': order.id,
            'order_number': str(order.id),
            'awb_code': shipment.awb_code or '',
            'courier_name': shipment.courier_name or '',
            'current_status': shipment.current_status or 'Pending',
            'tracking_url': shipment.tracking_url or '',
            'tracking_events': OrderTrackingStatusSerializer(tracking_events, many=True).data
        }
        
        return Response(data)
        
    except ShipmentTracking.DoesNotExist:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def check_product_serviceability(request):
    """
    Check serviceability for a product to a delivery pincode.
    Query Params: product_id, pincode
    """
    product_id = request.query_params.get('product_id')
    delivery_pincode = request.query_params.get('pincode')
    
    if not product_id or not delivery_pincode:
        return Response(
            {'error': 'product_id and pincode are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        product = get_object_or_404(Product, id=product_id)
        vendor = product.vendor
        
        if not vendor or not vendor.zip_code:
            # Fallback to default pincode if vendor has no pincode (or admin product)
            pickup_pincode = '400001' # Default logic, maybe improve later
        else:
            pickup_pincode = vendor.zip_code
            
        service = ShiprocketService()
        couriers = service.check_serviceability(
            pickup_pincode=pickup_pincode,
            delivery_pincode=delivery_pincode,
            weight=0.5 # Default weight, improvements: product.weight
        )
        
        if not couriers:
            return Response({'serviceable': False, 'message': 'Not serviceable'})
            
        # Find earliest EDD
        # Courier object structure: {"etd": "2023-12-25", ...}
        earliest_date = None
        min_courier = None
        
        for courier in couriers:
            etd = courier.get('etd') # Estimated Time of Delivery
            if etd:
                # Basic string comparison usually works for YYYY-MM-DD but Shiprocket returns various formats?
                # Usually it is 'YYYY-MM-DD'
                if not earliest_date or etd < earliest_date:
                    earliest_date = etd
                    min_courier = courier
                    
        return Response({
            'serviceable': True,
            'deliery_pincode': delivery_pincode,
            'pickup_pincode': pickup_pincode,
            'estimated_delivery_date': earliest_date,
            'courier_name': min_courier.get('courier_name') if min_courier else 'Standard',
            'couriers_count': len(couriers)
        })
        
    except Exception as e:
        logger.error(f"Serviceability check failed: {str(e)}")
        # Check if it was because of missing config
        if "Shiprocket configuration not found" in str(e):
             return Response(
                {'error': 'Shipping configuration missing'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_shipments(request):
    """Get all shipments for admin dashboard"""
    try:
        shipments = ShipmentTracking.objects.all().order_by('-created_at')
        serializer = ShipmentTrackingSerializer(shipments, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Failed to fetch shipments: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def shiprocket_webhook(request):
    """Handle Shiprocket webhooks for tracking updates"""
    from django.conf import settings
    
    # Verify webhook token from x-api-key header
    webhook_token = getattr(settings, 'SHIPROCKET_WEBHOOK_TOKEN', None)
    received_token = request.headers.get('x-api-key', '')
    
    if webhook_token and received_token != webhook_token:
        logger.warning(f"Invalid webhook token received")
        return Response({'status': 'error', 'message': 'Invalid token'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    logger.info(f"Received Shiprocket webhook: {data}")
    
    try:
        # Get event type
        event_type = data.get('event')
        
        if event_type == 'order_status_update':
            awb_code = data.get('awb_code')
            
            if not awb_code:
                logger.warning("Webhook missing AWB code")
                return Response({'status': 'error', 'message': 'Missing AWB code'})
            
            try:
                shipment = ShipmentTracking.objects.get(awb_code=awb_code)
                
                # Create tracking status
                OrderTrackingStatus.objects.create(
                    order=shipment.order,
                    shipment=shipment,
                    status=data.get('current_status', ''),
                    status_code=data.get('status_code', ''),
                    location=data.get('location', ''),
                    description=data.get('status_description', ''),
                    shiprocket_status=data.get('sr_status', ''),
                    courier_status=data.get('courier_status', ''),
                    timestamp=timezone.now()
                )
                
                # Update shipment
                shipment.current_status = data.get('current_status', '')
                shipment.save()
                
                # Update order status if delivered
                current_status = data.get('current_status', '').upper()
                
                if 'DELIVERED' in current_status:
                    shipment.order.status = 'DELIVERED'
                    shipment.order.delivered_at = timezone.now()
                    shipment.order.save()
                    logger.info(f"Order {shipment.order.id} marked as delivered")
                elif 'SHIPPED' in current_status or 'TRANSIT' in current_status:
                    shipment.order.status = 'SHIPPED'
                    if not shipment.order.shipped_at:
                        shipment.order.shipped_at = timezone.now()
                    shipment.order.save()
                
                # Send Email Notifications
                try:
                    from notifications.resend_service import send_email_via_resend
                    from notifications.email_templates import get_email_template
                    
                    customer_email = shipment.order.user.email if shipment.order.user else getattr(shipment.order, 'guest_email', None)
                    customer_name = shipment.order.user.get_full_name() if shipment.order.user else 'Guest'
                    
                    if customer_email:
                        email_template = None
                        context = {'customer_name': customer_name, 'order_id': shipment.order.id}
                        
                        # 1. Delivered
                        if 'DELIVERED' in current_status:
                            email_template = 'order_delivered'
                            
                        # 2. Out for Delivery
                        elif 'OUT FOR DELIVERY' in current_status:
                            email_template = 'order_out_for_delivery'
                            
                        # 3. Shipped
                        elif ('SHIPPED' in current_status or 'TRANSIT' in current_status) and not getattr(request, '_email_sent', False):
                            if 'SHIPPED' in current_status or 'PICKED UP' in current_status:
                                email_template = 'order_shipped'
                                context.update({
                                    'tracking_number': shipment.awb_code,
                                    'courier_name': shipment.courier_name or 'Courier Partner'
                                })

                        if email_template:
                            email_data = get_email_template(email_template, context)
                            if email_data:
                                send_email_via_resend(customer_email, email_data['subject'], email_data['content'])
                                
                except Exception as e:
                    logger.error(f"Failed to send shipping email for order {shipment.order.id}: {e}")
                
                logger.info(f"Updated tracking for shipment {shipment.id}")
                
            except ShipmentTracking.DoesNotExist:
                logger.warning(f"Shipment not found for AWB: {awb_code}")
                return Response({'status': 'error', 'message': 'Shipment not found'})
        
        return Response({'status': 'success'})
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_shipment(request, order_id):
    """
    Cancel a shipment and reset order state.
    This effectively deletes the shipment record so it can be recreated.
    """
    order = get_object_or_404(Order, id=order_id)
    try:
        # Get shipment based on user role
        shipment_query = ShipmentTracking.objects.filter(order=order)
        if not request.user.is_staff:
            shipment_query = shipment_query.filter(vendor=request.user)
            
        shipment = shipment_query.first()
        
        if not shipment:
            return Response(
                {'error': 'No shipment found to cancel'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Try to cancel on Shiprocket
        try:
            service = ShiprocketService()
            service.cancel_shipment(shipment)
        except Exception as e:
            # Even if SR fails (e.g. already deleted), we proceed to delete local record
            # to allow reset.
            logger.warning(f"Shiprocket cancel failed (ignoring to allow reset): {e}")

        # Delete the local tracking record to allow recreation
        shipment.delete()
        
        # Reset order status to PROCESSING so it appears in Pending tab
        order.status = 'PROCESSING'
        order.save()
        
        return Response({'message': 'Shipment cancelled and reset successfully'})
        
    except ShipmentTracking.DoesNotExist:
        return Response(
            {'error': 'No shipment found to cancel'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Failed to cancel shipment: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
