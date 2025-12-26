from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, OrderNote
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity')

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'created_at', 'total_amount', 'subtotal', 'discount_amount')

    def get_totals(self, obj):
        # Cache calculations to avoid running 3 times
        if not hasattr(self, '_cart_totals'):
            from .services import PriceCalculatorService
            self._cart_totals = PriceCalculatorService.calculate_cart_total(obj)
        return self._cart_totals

    def get_total_amount(self, obj):
        return self.get_totals(obj)['total_amount']

    def get_subtotal(self, obj):
        return self.get_totals(obj)['subtotal']

    def get_discount_amount(self, obj):
        return self.get_totals(obj)['discount_amount']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price')

class UserBasicSerializer(serializers.Serializer):
    """Basic user info for order display"""
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

class OrderNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.email')

    class Meta:
        model = OrderNote
        fields = '__all__'
        read_only_fields = ('author', 'created_at')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserBasicSerializer(read_only=True)
    notes = OrderNoteSerializer(many=True, read_only=True)
    label_url = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('total_amount', 'created_at')
    
    def get_label_url(self, obj):
        """Get label_url from related ShipmentTracking if exists"""
        if hasattr(obj, 'shipment') and obj.shipment:
            return obj.shipment.label_url or ''
        return ''


# Gift Option Serializer
from .models import GiftOption

class GiftOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftOption
        fields = ['id', 'name', 'description', 'image', 'price', 'is_active', 'sort_order']
        read_only_fields = ['id']
