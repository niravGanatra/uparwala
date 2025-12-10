from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Order, AddressVerification, CODPincode, GiftOption, OrderGift
from .phase45_serializers import (
    AddressVerificationSerializer, CODPincodeSerializer,
    GiftOptionSerializer, OrderGiftSerializer
)


# Address Verification Views
@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_address(request, order_id):
    """Manually verify an address for high-value order"""
    order = get_object_or_404(Order, id=order_id)
    
    verification, created = AddressVerification.objects.get_or_create(order=order)
    verification.status = request.data.get('status', 'verified')
    verification.verified_address = request.data.get('verified_address', '')
    verification.verification_notes = request.data.get('notes', '')
    verification.verified_by = request.user
    verification.verified_at = timezone.now()
    verification.save()
    
    serializer = AddressVerificationSerializer(verification)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_verification_status(request, order_id):
    """Get address verification status for an order"""
    order = get_object_or_404(Order, id=order_id)
    
    try:
        verification = AddressVerification.objects.get(order=order)
        serializer = AddressVerificationSerializer(verification)
        return Response(serializer.data)
    except AddressVerification.DoesNotExist:
        return Response({'status': 'not_required'})


# COD Pincode Views
@api_view(['GET'])
@permission_classes([AllowAny])
def check_cod_availability(request):
    """Check if COD is available for a pincode"""
    pincode = request.query_params.get('pincode')
    order_value = float(request.query_params.get('order_value', 0))
    
    if not pincode:
        return Response({'available': False, 'message': 'Pincode required'}, status=400)
    
    try:
        cod_pincode = CODPincode.objects.get(pincode=pincode, is_active=True)
        is_available = cod_pincode.is_cod_available(order_value)
        
        return Response({
            'available': is_available,
            'pincode': pincode,
            'city': cod_pincode.city,
            'state': cod_pincode.state,
            'max_order_value': cod_pincode.max_order_value,
            'message': 'COD available' if is_available else 'COD not available for this order value'
        })
    except CODPincode.DoesNotExist:
        return Response({
            'available': False,
            'pincode': pincode,
            'message': 'COD not available for this pincode'
        })


# Gift Wrapping Views
@api_view(['GET'])
@permission_classes([AllowAny])
def list_gift_options(request):
    """List all active gift wrapping options"""
    gift_options = GiftOption.objects.filter(is_active=True)
    serializer = GiftOptionSerializer(gift_options, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_gift_to_order(request, order_id):
    """Add gift wrapping to an order"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    gift_option_id = request.data.get('gift_option_id')
    
    if not gift_option_id:
        return Response({'error': 'gift_option_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    gift_option = get_object_or_404(GiftOption, id=gift_option_id, is_active=True)
    
    # Create or update order gift
    order_gift, created = OrderGift.objects.update_or_create(
        order=order,
        defaults={
            'gift_option': gift_option,
            'gift_message': request.data.get('gift_message', ''),
            'recipient_name': request.data.get('recipient_name', '')
        }
    )
    
    # Update order total to include gift price
    order.total_amount += gift_option.price
    order.save()
    
    serializer = OrderGiftSerializer(order_gift)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_order_gift(request, order_id):
    """Get gift details for an order"""
    order = get_object_or_404(Order, id=order_id, user=request.user)
    
    try:
        order_gift = OrderGift.objects.get(order=order)
        serializer = OrderGiftSerializer(order_gift)
        return Response(serializer.data)
    except OrderGift.DoesNotExist:
        return Response({'message': 'No gift wrapping for this order'}, status=status.HTTP_404_NOT_FOUND)
