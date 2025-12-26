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
    shipment_details = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ('total_amount', 'created_at')
    
    def get_label_url(self, obj):
        """Legacy field for backward compatibility"""
        details = self.get_shipment_details(obj)
        return details.get('label_url') if details else ''

    def get_shipment_details(self, obj):
        """
        Get shipment details relevant to the requesting user.
        - Vendors see their own shipment.
        - Admins see the latest (or ideally all, but for list view strictness 1).
        - Customers see all (or prioritized).
        """
        request = self.context.get('request')
        if not request:
            return None
            
        shipments = obj.shipments.all()
        
        # Filter for vendors
        if not request.user.is_staff and request.user != obj.user:
            # Check if user is seller
            if hasattr(request.user, 'vendor_profile'): # Or however we identify vendors
                 shipments = shipments.filter(vendor=request.user)
            elif request.user.pk: # If authenticated but logic is diff
                 shipments = shipments.filter(vendor=request.user)

        shipment = shipments.order_by('-created_at').first()
        
        if shipment:
            return {
                'id': shipment.id,
                'awb_code': shipment.awb_code,
                'label_url': shipment.label_url,
                'pickup_scheduled': shipment.pickup_scheduled,
                'pickup_token': shipment.pickup_token_number,
                'current_status': shipment.current_status,
                'courier_name': shipment.courier_name
            }
        return None


# Gift Option Serializer
from .models import GiftOption

class GiftOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftOption
        fields = ['id', 'name', 'description', 'image', 'price', 'is_active', 'sort_order']
        read_only_fields = ['id']
