from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_active', 'is_vendor', 'is_staff', 'is_superuser',
            'date_joined', 'last_login',
            'vendor_status', 'vendor_application_date', 'vendor_approval_date',
            'vendor_rejection_reason', 'business_name', 'business_email',
            'business_phone', 'business_address', 'store_description', 'tax_number'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id', 'address_type', 'full_name', 'phone', 'email',
            'address_line1', 'address_line2', 'city', 'state', 'state_code',
            'pincode', 'country', 'is_default', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set user from request context
        user = self.context['request'].user
        return Address.objects.create(user=user, **validated_data)
