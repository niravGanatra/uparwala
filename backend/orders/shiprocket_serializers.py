from rest_framework import serializers
from .shiprocket_models import ShipmentTracking, OrderTrackingStatus


class ShipmentTrackingSerializer(serializers.ModelSerializer):
    """Serializer for shipment tracking information"""
    order_number = serializers.CharField(source='order.id', read_only=True)
    
    class Meta:
        model = ShipmentTracking
        fields = [
            'id', 'order', 'order_number', 'shiprocket_order_id', 
            'shiprocket_shipment_id', 'awb_code', 'courier_name', 
            'courier_id', 'current_status', 'tracking_url', 
            'estimated_delivery', 'label_url', 'manifest_url', 
            'invoice_url', 'pickup_scheduled', 'pickup_token_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderTrackingStatusSerializer(serializers.ModelSerializer):
    """Serializer for tracking status events"""
    
    class Meta:
        model = OrderTrackingStatus
        fields = [
            'id', 'order', 'shipment', 'status', 'status_code',
            'location', 'description', 'shiprocket_status',
            'courier_status', 'timestamp', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TrackingHistorySerializer(serializers.Serializer):
    """Combined serializer for order tracking history"""
    order_id = serializers.IntegerField()
    order_number = serializers.CharField()
    awb_code = serializers.CharField()
    courier_name = serializers.CharField()
    current_status = serializers.CharField()
    tracking_url = serializers.URLField()
    tracking_url = serializers.URLField()
    tracking_events = OrderTrackingStatusSerializer(many=True)

from .shiprocket_models import ShiprocketConfig

class ShiprocketConfigSerializer(serializers.ModelSerializer):
    """Serializer for Shiprocket Configuration"""
    class Meta:
        model = ShiprocketConfig
        fields = '__all__'
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = ('api_token', 'token_expiry', 'created_at', 'updated_at')
