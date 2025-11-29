from rest_framework import serializers
from .models import ProductModeration, Coupon, CMSPage


class ProductModerationSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    vendor_name = serializers.CharField(source='product.vendor.store_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = ProductModeration
        fields = [
            'id', 'product', 'product_name', 'product_price', 'product_category',
            'vendor_name', 'status', 'reviewed_by', 'reviewed_by_name',
            'reviewed_at', 'rejection_reason', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'reviewed_at', 'reviewed_by']


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'usage_count']


class CMSPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CMSPage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
