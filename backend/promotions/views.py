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
    """
    serializer = CouponValidationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code = serializer.validated_data['code'].upper()
    cart_total = serializer.validated_data['cart_total']
    user_id = serializer.validated_data.get('user_id') or (request.user.id if request.user.is_authenticated else None)
    items = serializer.validated_data.get('items', [])
    
    try:
        coupon = Coupon.objects.get(code=code)
        
        # 1. Basic Active Checks
        now = timezone.now()
        if not coupon.is_active:
            return Response({'valid': False, 'error': 'This coupon is no longer active'}, status=400)
        
        if now < coupon.valid_from:
            return Response({'valid': False, 'error': 'This coupon is not yet valid'}, status=400)
        
        if now > coupon.valid_to:
            return Response({'valid': False, 'error': 'This coupon has expired'}, status=400)
            
        if coupon.usage_limit and coupon.usage_count >= coupon.usage_limit:
            return Response({'valid': False, 'error': 'This coupon has reached its usage limit'}, status=400)
            
        # 2. Check Min Purchase (on Cart Total)
        # Note: Model field is `min_purchase_amount`
        if coupon.min_purchase_amount and cart_total < coupon.min_purchase_amount:
            return Response({'valid': False, 'error': f'Minimum order value of ₹{coupon.min_purchase_amount} required'}, status=400)

        # 3. Applicability Logic
        eligible_amount = cart_total
        
        if coupon.applicability_type == 'new_user':
            # Check if user has any previous orders
            if not user_id:
                 return Response({'valid': False, 'error': 'This coupon is for new users only. Please login.'}, status=400)
            
            from orders.models import Order
            previous_orders = Order.objects.filter(user_id=user_id).exists()
            if previous_orders:
                return Response({'valid': False, 'error': 'This coupon is valid for new users only'}, status=400)
        
        elif coupon.applicability_type == 'specific_products':
            if not items:
                return Response({'valid': False, 'error': 'Cart items required for validation'}, status=400)
                
            allowed_product_ids = set(coupon.specific_products.values_list('id', flat=True))
            eligible_amount = sum(
                float(item.get('price', 0)) * int(item.get('quantity', 1)) 
                for item in items 
                if item.get('product_id') in allowed_product_ids
            )
            
            if eligible_amount <= 0:
                 return Response({'valid': False, 'error': 'This coupon does not apply to items in your cart'}, status=400)

        elif coupon.applicability_type == 'specific_categories':
            if not items:
                return Response({'valid': False, 'error': 'Cart items required for validation'}, status=400)
                
            allowed_category_ids = set(coupon.specific_categories.values_list('id', flat=True))
            # Also need to handle recursive categories if complex, but simple match for now
            # Note: client must send category_id in items
            eligible_amount = sum(
                float(item.get('price', 0)) * int(item.get('quantity', 1)) 
                for item in items 
                if item.get('category_id') in allowed_category_ids
            )
            
            if eligible_amount <= 0:
                 return Response({'valid': False, 'error': 'This coupon does not apply to items in your cart'}, status=400)

        # 4. Calculate Discount
        discount_amount = 0
        if coupon.discount_type == 'percentage':
            discount_amount = (float(eligible_amount) * float(coupon.discount_value)) / 100.0
            if coupon.max_discount_amount:
                discount_amount = min(discount_amount, float(coupon.max_discount_amount))
        else:
            discount_amount = float(coupon.discount_value)
            
        # Ensure discount doesn't exceed eligible amount (can't give free money beyond item cost)
        discount_amount = min(discount_amount, float(eligible_amount))

        return Response({
            'valid': True,
            'discount_amount': round(discount_amount, 2),
            'coupon': CouponSerializer(coupon).data,
            'message': f'Coupon applied! You save ₹{round(discount_amount, 2)}'
        })
        
    except Coupon.DoesNotExist:
        return Response({'valid': False, 'error': 'Invalid coupon code'}, status=404)


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


class CouponViewSet(viewsets.ModelViewSet):
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
