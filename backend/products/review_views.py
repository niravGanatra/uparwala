from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Avg, Count, Q
from django.utils import timezone

from .models import Product, ProductReview, ReviewHelpful
from .review_serializers import ProductReviewSerializer, ReviewHelpfulSerializer, ProductRatingStatsSerializer


class ProductReviewListCreateView(generics.ListCreateAPIView):
    """List reviews for a product or create a new review"""
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        queryset = ProductReview.objects.filter(product_id=product_id, is_approved=True)
        
        # Filter by rating
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=rating)
        
        # Filter by verified purchase
        verified_only = self.request.query_params.get('verified_only')
        if verified_only == 'true':
            queryset = queryset.filter(is_verified_purchase=True)
        
        # Sort options
        sort_by = self.request.query_params.get('sort', '-created_at')
        if sort_by == 'helpful':
            queryset = queryset.order_by('-helpful_count', '-created_at')
        elif sort_by == 'rating_high':
            queryset = queryset.order_by('-rating', '-created_at')
        elif sort_by == 'rating_low':
            queryset = queryset.order_by('rating', '-created_at')
        else:
            queryset = queryset.order_by(sort_by)
        
        return queryset
    
    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_id')
        serializer.save(product_id=product_id)


class ProductReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a review"""
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductReview.objects.filter(user=self.request.user)


class ReviewHelpfulVoteView(APIView):
    """Mark a review as helpful or not helpful"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, review_id):
        is_helpful = request.data.get('is_helpful', True)
        
        try:
            review = ProductReview.objects.get(id=review_id)
        except ProductReview.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user already voted
        vote, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=request.user,
            defaults={'is_helpful': is_helpful}
        )
        
        if not created:
            # Update existing vote
            old_is_helpful = vote.is_helpful
            vote.is_helpful = is_helpful
            vote.save()
            
            # Update counts
            if old_is_helpful != is_helpful:
                if is_helpful:
                    review.helpful_count += 1
                    review.not_helpful_count -= 1
                else:
                    review.helpful_count -= 1
                    review.not_helpful_count += 1
                review.save()
        else:
            # New vote
            if is_helpful:
                review.helpful_count += 1
            else:
                review.not_helpful_count += 1
            review.save()
        
        return Response({
            'message': 'Vote recorded',
            'helpful_count': review.helpful_count,
            'not_helpful_count': review.not_helpful_count
        })


class ProductRatingStatsView(APIView):
    """Get rating statistics for a product"""
    permission_classes = []
    
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        reviews = ProductReview.objects.filter(product=product, is_approved=True)
        
        # Calculate statistics
        stats = reviews.aggregate(
            average_rating=Avg('rating'),
            total_reviews=Count('id'),
            verified_purchase_count=Count('id', filter=Q(is_verified_purchase=True))
        )
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[str(i)] = reviews.filter(rating=i).count()
        
        stats['rating_distribution'] = rating_distribution
        stats['average_rating'] = round(stats['average_rating'] or 0, 1)
        
        serializer = ProductRatingStatsSerializer(stats)
        return Response(serializer.data)


class VendorResponseView(APIView):
    """Add or update vendor response to a review"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, review_id):
        response_text = request.data.get('response')
        
        if not response_text:
            return Response({'error': 'Response text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            review = ProductReview.objects.get(id=review_id)
        except ProductReview.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is the vendor of this product
        if not hasattr(request.user, 'vendor_profile') or review.product.vendor != request.user.vendor_profile:
            return Response({'error': 'Only the product vendor can respond'}, status=status.HTTP_403_FORBIDDEN)
        
        review.vendor_response = response_text
        review.vendor_response_date = timezone.now()
        review.save()
        
        serializer = ProductReviewSerializer(review, context={'request': request})
        return Response(serializer.data)
