from rest_framework import serializers
from .models import Coupon, CouponUsage


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for coupon display and management"""
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value', 
            'min_purchase_amount', 'max_discount_amount', 'valid_from', 'valid_to',
            'applicability_type', 'specific_products', 'specific_categories',
            'usage_limit', 'is_active'
        ]

class CouponValidationSerializer(serializers.Serializer):
    """Serializer for validating coupon codes"""
    code = serializers.CharField(max_length=50)
    cart_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    user_id = serializers.IntegerField(required=False)
    items = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text="List of items in cart [{'product_id': 1, 'price': 100, 'category_id': 5}]"
    )


class CouponUsageSerializer(serializers.ModelSerializer):
    """Serializer for coupon usage history"""
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon_code', 'user_email', 'order', 'discount_amount', 'used_at']
        read_only_fields = fields
