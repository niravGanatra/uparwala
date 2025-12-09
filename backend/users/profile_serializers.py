from rest_framework import serializers
from django.contrib.auth import get_user_model
from products.models import Category

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with enhancements"""
    preferred_categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'date_of_birth', 'gender', 'preferred_language', 'preferred_currency',
            'preferred_categories'
        ]
        read_only_fields = ['id', 'username', 'email']


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for updating just preferences"""
    class Meta:
        model = User
        fields = ['preferred_language', 'preferred_currency', 'preferred_categories']
