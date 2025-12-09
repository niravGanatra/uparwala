from rest_framework import serializers
from .package_models import OrderPackage, PackageItem
from .models import OrderItem
from products.serializers import ProductSerializer


class PackageItemSerializer(serializers.ModelSerializer):
    """Serializer for items in a package"""
    product_name = serializers.CharField(source='order_item.product.name', read_only=True)
    product_price = serializers.DecimalField(source='order_item.price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = PackageItem
        fields = ['id', 'order_item', 'product_name', 'product_price', 'quantity', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderPackageSerializer(serializers.ModelSerializer):
    """Serializer for order packages"""
    items = PackageItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderPackage
        fields = [
            'id', 'order', 'package_number', 'length', 'width', 'height', 'weight',
            'awb_code', 'tracking_url', 'courier_name', 'status', 
            'shiprocket_shipment_id', 'items', 'total_items',
            'created_at', 'updated_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.get_total_items()


class CancelItemSerializer(serializers.Serializer):
    """Serializer for cancelling order items"""
    quantity = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(max_length=500)
    
    def validate_quantity(self, value):
        """Validate that quantity can be cancelled"""
        order_item = self.context.get('order_item')
        if order_item and not order_item.can_cancel(value):
            raise serializers.ValidationError(
                f"Cannot cancel {value} items. Only {order_item.get_active_quantity()} available."
            )
        return value


class OrderItemCancellationSerializer(serializers.ModelSerializer):
    """Serializer for order item with cancellation info"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    active_quantity = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'quantity', 'price',
            'cancelled_quantity', 'active_quantity', 'cancellation_reason',
            'cancelled_at', 'refund_amount', 'refund_processed'
        ]
        read_only_fields = ['id', 'cancelled_quantity', 'cancellation_reason', 
                           'cancelled_at', 'refund_amount', 'refund_processed']
    
    def get_active_quantity(self, obj):
        return obj.get_active_quantity()
