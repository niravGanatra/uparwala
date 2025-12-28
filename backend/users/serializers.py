from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Address, CareerApplication
from vendors.serializers import VendorProfileSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    vendor_profile = VendorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'is_active', 'is_vendor', 'is_staff', 'is_superuser',
            'date_joined', 'last_login',
            'vendor_status', 'vendor_application_date', 'vendor_approval_date',
            'vendor_rejection_reason', 'business_name', 'business_email',
            'business_phone', 'business_address', 'store_description', 'tax_number',
            'vendor_profile'
        ]
        
    def validate_email(self, value):
        """Strict email validation"""
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        """Strict email validation"""
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Enter a valid email address.")
        return value

    def create(self, validated_data):
        # Auto-generate username from email if not provided
        username = validated_data.get('username')
        if not username:
            # Use email prefix as username, make it unique
            email = validated_data['email']
            base_username = email.split('@')[0]
            username = base_username
            
            # Ensure uniqueness
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
        
        # Check if is_vendor is passed in context (for vendor registration)
        is_vendor = self.context.get('is_vendor', False)

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            is_vendor=is_vendor
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

from dj_rest_auth.serializers import PasswordResetSerializer
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from notifications.resend_service import send_email_via_resend
from notifications.email_templates import get_email_template

class CustomPasswordResetSerializer(PasswordResetSerializer):
    """
    Custom serializer to send password reset emails via Resend API
    instead of Django's default SMTP to avoid blocking issues.
    """
    def save(self):
        request = self.context.get('request')
        email = self.validated_data['email']
        
        # Filter active users with this email (Django logic)
        active_users = User.objects.filter(email__iexact=email, is_active=True)
        
        for user in active_users:
            if not user.has_usable_password():
                continue
                
            # Generate token and uid
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Construct reset URL (frontend)
            # Typically: https://uparwala.in/reset-password/<uid>/<token>
            # Ensure FRONTEND_URL doesn't have trailing slash for clean concatenation
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
            reset_url = f"{frontend_url}/password-reset/{uid}/{token}/"
            
            # Send email via Resend
            try:
                context = {
                    'customer_name': user.get_full_name() or user.username or 'there',
                    'reset_url': reset_url
                }
                email_data = get_email_template('password_reset', context)
                
                if email_data:
                    send_email_via_resend(
                        to_email=user.email,
                        subject=email_data['subject'],
                        html_content=email_data['content']
                    )
            except Exception as e:
                # Log error but don't expose to user (security)
                print(f"Failed to send password reset email to {email}: {e}")

class CareerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerApplication
        fields = '__all__'
