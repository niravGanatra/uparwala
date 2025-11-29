from rest_framework import serializers
from .models import Payment, ShippingZone, TaxRate
from orders.models import Order


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'payment_id', 'razorpay_order_id', 'razorpay_signature',
            'amount', 'status', 'payment_method', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CreatePaymentOrderSerializer(serializers.Serializer):
    """Serializer for creating Razorpay order"""
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class VerifyPaymentSerializer(serializers.Serializer):
    """Serializer for verifying payment"""
    razorpay_order_id = serializers.CharField(max_length=100)
    razorpay_payment_id = serializers.CharField(max_length=100)
    razorpay_signature = serializers.CharField(max_length=200)
    order_id = serializers.IntegerField()


class ShippingZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingZone
        fields = ['id', 'name', 'states', 'base_rate', 'per_kg_rate', 'free_shipping_threshold', 'is_active']


class TaxRateSerializer(serializers.ModelSerializer):
    total_gst = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxRate
        fields = ['id', 'state_code', 'state_name', 'cgst_rate', 'sgst_rate', 'igst_rate', 'total_gst']
    
    def get_total_gst(self, obj):
        return float(obj.cgst_rate + obj.sgst_rate)
