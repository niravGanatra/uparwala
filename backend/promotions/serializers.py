from rest_framework import serializers
from .models import Coupon, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon display"""
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_type', 'discount_value', 
                  'min_order_value', 'max_discount', 'valid_from', 'valid_to']
        read_only_fields = fields


class CouponValidationSerializer(serializers.Serializer):
    """Serializer for validating coupon codes"""
    code = serializers.CharField(max_length=50)
    cart_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    user_id = serializers.IntegerField(required=False)


class CouponUsageSerializer(serializers.ModelSerializer):
    """Serializer for coupon usage history"""
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon_code', 'user_email', 'order', 'discount_amount', 'used_at']
        read_only_fields = fields
