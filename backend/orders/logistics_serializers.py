from rest_framework import serializers
from .models import CODPincode, GiftOption

class CODPincodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CODPincode
        fields = ['id', 'pincode', 'city', 'state', 'is_active', 'max_order_value', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class GiftOptionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GiftOption
        fields = ['id', 'name', 'description', 'image', 'image_url', 'price', 'is_active', 'sort_order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
