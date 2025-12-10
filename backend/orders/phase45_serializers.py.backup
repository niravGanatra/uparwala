from rest_framework import serializers
from .models import AddressVerification, CODPincode, GiftOption, OrderGift


class AddressVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddressVerification
        fields = ['id', 'order', 'status', 'verified_address', 'verification_method',
                 'verification_notes', 'verified_by', 'verified_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CODPincodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CODPincode
        fields = ['id', 'pincode', 'city', 'state', 'is_active', 'max_order_value', 'notes']
        read_only_fields = ['id']


class GiftOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftOption
        fields = ['id', 'name', 'description', 'image', 'price', 'is_active', 'sort_order']
        read_only_fields = ['id']


class OrderGiftSerializer(serializers.ModelSerializer):
    gift_option_detail = GiftOptionSerializer(source='gift_option', read_only=True)
    
    class Meta:
        model = OrderGift
        fields = ['id', 'order', 'gift_option', 'gift_option_detail', 
                 'gift_message', 'recipient_name', 'created_at']
        read_only_fields = ['id', 'created_at']
