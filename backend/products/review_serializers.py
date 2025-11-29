from rest_framework import serializers
from .models import ProductReview, ReviewHelpful
from django.db.models import Avg


class ProductReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    is_user_review = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'product', 'user', 'user_name', 'rating', 'title', 'comment',
            'is_approved', 'is_verified_purchase', 'helpful_count', 'not_helpful_count',
            'vendor_response', 'vendor_response_date', 'created_at', 'updated_at',
            'is_user_review', 'user_vote'
        ]
        read_only_fields = ['id', 'user', 'helpful_count', 'not_helpful_count', 'created_at', 'updated_at', 'is_verified_purchase']
    
    def get_is_user_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False
    
    def get_user_vote(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = ReviewHelpful.objects.filter(review=obj, user=request.user).first()
            if vote:
                return 'helpful' if vote.is_helpful else 'not_helpful'
        return None
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user
        
        # Check if user purchased this product
        from orders.models import OrderItem
        has_purchased = OrderItem.objects.filter(
            order__user=request.user,
            product=validated_data['product'],
            order__payment_status='paid'
        ).exists()
        validated_data['is_verified_purchase'] = has_purchased
        
        return super().create(validated_data)


class ReviewHelpfulSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewHelpful
        fields = ['id', 'review', 'is_helpful', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductRatingStatsSerializer(serializers.Serializer):
    """Serializer for product rating statistics"""
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField()
    verified_purchase_count = serializers.IntegerField()
