"""
Delhivery API Views

Provides REST endpoints for Delhivery shipping operations:
- Create shipment
- Get tracking
- Get label
- Cancel shipment
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from .models import Order
from .delhivery_service import DelhiveryService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_delhivery_shipment(request, order_id):
    """
    Create Delhivery shipment for an order.
    Splits by vendor automatically.
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Permission check
    if not request.user.is_staff and order.user != request.user:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check order status
    if order.status not in ['PROCESSING', 'PENDING']:
        return Response(
            {'error': 'Order must be in PROCESSING or PENDING status'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if AWB already exists
    if order.awb_code:
        return Response(
            {'error': 'Shipment already exists for this order', 'awb': order.awb_code},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        service = DelhiveryService()
        results = service.create_shipments_for_order(order)
        
        successful = [r for r in results if r.get('success')]
        failed = [r for r in results if not r.get('success')]
        
        if not successful:
            return Response(
                {'error': 'All shipment creations failed', 'details': failed},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save first AWB to order
        order.awb_code = successful[0].get('awb', '')
        order.status = 'PROCESSING'
        order.save()
        
        return Response({
            'success': True,
            'shipments': successful,
            'failed': failed,
            'awb': order.awb_code
        }, status=status.HTTP_201_CREATED)
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Failed to create Delhivery shipment for order {order_id}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_delhivery_tracking(request, order_id):
    """
    Get tracking information for an order from Delhivery.
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Permission check
    if not request.user.is_staff and order.user != request.user:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not order.awb_code:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        service = DelhiveryService()
        tracking_data = service.track_shipment(order.awb_code)
        
        return Response({
            'order_id': order.id,
            'awb': order.awb_code,
            'tracking': tracking_data
        })
        
    except Exception as e:
        logger.error(f"Failed to get Delhivery tracking for order {order_id}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_delhivery_label(request, order_id):
    """
    Get shipping label PDF URL for an order.
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Permission check - admin, order owner, or vendor
    is_vendor = hasattr(request.user, 'vendor_profile') and order.items.filter(vendor=request.user.vendor_profile).exists()
    
    if not request.user.is_staff and order.user != request.user and not is_vendor:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not order.awb_code:
        return Response(
            {'error': 'No shipment found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        service = DelhiveryService()
        label_url = service.get_label_url(order.awb_code)
        
        return Response({
            'order_id': order.id,
            'awb': order.awb_code,
            'label_url': label_url
        })
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Failed to get Delhivery label for order {order_id}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_delhivery_shipment(request, order_id):
    """
    Cancel a Delhivery shipment.
    """
    order = get_object_or_404(Order, id=order_id)
    
    # Permission check - admin only for cancellation
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin can cancel shipments'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if not order.awb_code:
        return Response(
            {'error': 'No shipment found to cancel'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        service = DelhiveryService()
        result = service.cancel_shipment(order.awb_code)
        
        if result.get('success'):
            # Clear AWB from order
            order.awb_code = ''
            order.status = 'PROCESSING'
            order.save()
            
            return Response({
                'success': True,
                'message': 'Shipment cancelled successfully'
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Cancellation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Failed to cancel Delhivery shipment for order {order_id}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def register_vendor_warehouse(request, vendor_id):
    """
    Register a vendor's address as a Delhivery warehouse.
    Admin only endpoint.
    """
    from vendors.models import VendorProfile
    
    vendor = get_object_or_404(VendorProfile, id=vendor_id)
    
    try:
        service = DelhiveryService()
        success = service.register_vendor_warehouse(vendor)
        
        if success:
            return Response({
                'success': True,
                'warehouse_name': vendor.delhivery_warehouse_name,
                'message': f'Warehouse registered for {vendor.store_name}'
            })
        else:
            return Response({
                'success': False,
                'error': 'Failed to register warehouse - check vendor address details'
            }, status=status.HTTP_400_BAD_REQUEST)
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Failed to register Delhivery warehouse for vendor {vendor_id}: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def check_delivery_estimate(request):
    """
    Check estimated delivery date for a product to a pincode.
    Query Params: pincode, product_id
    """
    pincode = request.query_params.get('pincode')
    product_id = request.query_params.get('product_id')
    
    if not pincode or not product_id:
        return Response(
            {'error': 'pincode and product_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    try:
        from products.models import Product
        product = get_object_or_404(Product, id=product_id)
        vendor = product.vendor
        
        # Get vendor's pickup pincode
        # Ideally this should be from vendor.shiprocket_pickup_location_name or address
        # For now, we use vendor.zip_code
        origin_pincode = vendor.zip_code
        
        if not origin_pincode:
            # Fallback to default if vendor has no pincode (shouldn't happen)
            return Response(
                {'error': 'Vendor location not available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        service = DelhiveryService()
        result = service.get_delivery_estimate(origin_pincode, pincode)
        
        if result.get('success'):
            return Response(result)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Delivery estimate failed: {e}")
        return Response(
            {'error': 'Could not fetch delivery estimate'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
