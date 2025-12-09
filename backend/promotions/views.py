from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, CouponValidationSerializer, CouponUsageSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    """
    Validate a coupon code and return discount amount
    
    POST /api/promotions/validate-coupon/
    {
        "code": "SAVE20",
        "cart_total": 1000.00,
        "user_id": 1  // optional
    }
    """
    serializer = CouponValidationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code = serializer.validated_data['code'].upper()
    cart_total = serializer.validated_data['cart_total']
    user_id = serializer.validated_data.get('user_id') or request.user.id if request.user.is_authenticated else None
    
    try:
        # Get coupon
        coupon = Coupon.objects.get(code=code)
        
        # Check if active
        if not coupon.is_active:
            return Response({
                'valid': False,
                'error': 'This coupon is no longer active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check validity dates
        now = timezone.now()
        if now < coupon.valid_from:
            return Response({
                'valid': False,
                'error': 'This coupon is not yet valid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if now > coupon.valid_to:
            return Response({
                'valid': False,
                'error': 'This coupon has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check total usage limit
        if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
            return Response({
                'valid': False,
                'error': 'This coupon has reached its usage limit'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check per-user usage limit
        if user_id:
            user_usage_count = CouponUsage.objects.filter(
                coupon=coupon,
                user_id=user_id
            ).count()
            
            if user_usage_count >= coupon.usage_per_user:
                return Response({
                    'valid': False,
                    'error': 'You have already used this coupon the maximum number of times'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check minimum order value
        if cart_total < coupon.min_order_value:
            return Response({
                'valid': False,
                'error': f'Minimum order value of ₹{coupon.min_order_value} required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate discount
        discount_amount = coupon.calculate_discount(cart_total)
        
        return Response({
            'valid': True,
            'discount_amount': discount_amount,
            'coupon': CouponSerializer(coupon).data,
            'message': f'Coupon applied! You save ₹{discount_amount}'
        })
        
    except Coupon.DoesNotExist:
        return Response({
            'valid': False,
            'error': 'Invalid coupon code'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_coupons(request):
    """Get available coupons for current user"""
    now = timezone.now()
    
    # Get active coupons that user hasn't exhausted
    coupons = Coupon.objects.filter(
        is_active=True,
        valid_from__lte=now,
        valid_to__gte=now
    ).filter(
        Q(usage_limit__isnull=True) | Q(times_used__lt=models.F('usage_limit'))
    )
    
    # Filter out coupons user has already used max times
    available_coupons = []
    for coupon in coupons:
        user_usage = CouponUsage.objects.filter(
            coupon=coupon,
            user=request.user
        ).count()
        
        if user_usage < coupon.usage_per_user:
            available_coupons.append(coupon)
    
    serializer = CouponSerializer(available_coupons, many=True)
    return Response(serializer.data)


class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing coupons (admin only)
    """
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Coupon.objects.all()
        # Regular users only see active coupons
        now = timezone.now()
        return Coupon.objects.filter(
            is_active=True,
            valid_from__lte=now,
            valid_to__gte=now
        )


class CouponUsageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing coupon usage history
    """
    serializer_class = CouponUsageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return CouponUsage.objects.all()
        # Regular users only see their own usage
        return CouponUsage.objects.filter(user=self.request.user)
