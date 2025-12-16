from rest_framework import serializers
from .models import StockNotification


class StockNotificationSerializer(serializers.ModelSerializer):
    """Serializer for stock notification requests"""
    
    class Meta:
        model = StockNotification
        fields = ['id', 'product', 'email', 'phone', 'created_at', 'notified']
        read_only_fields = ['id', 'created_at', 'notified']
    
    def validate(self, data):
        """Ensure at least one contact method is provided"""
        if not data.get('email') and not data.get('phone'):
            raise serializers.ValidationError(
                "Please provide either an email address or phone number"
            )
        return data
