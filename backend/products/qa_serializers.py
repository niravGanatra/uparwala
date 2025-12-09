from rest_framework import serializers
from .models import ProductQuestion, ProductAnswer
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user info for Q&A"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class ProductAnswerSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = ProductAnswer
        fields = ['id', 'user', 'answer', 'is_vendor', 'is_staff', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'is_vendor', 'is_staff', 'is_approved', 'created_at']


class ProductQuestionSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    answers = ProductAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductQuestion
        fields = ['id', 'product', 'user', 'question', 'is_answered', 'is_approved', 'answers', 'created_at']
        read_only_fields = ['id', 'user', 'is_answered', 'is_approved', 'created_at']
