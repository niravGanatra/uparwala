from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product


class ProductReview(models.Model):
    """Customer product reviews and ratings"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    
    # Review content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Moderation
    is_approved = models.BooleanField(default=False)
    is_verified_purchase = models.BooleanField(default=False)
    
    # Helpful votes
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    
    # Vendor response
    vendor_response = models.TextField(blank=True)
    vendor_response_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'user']  # One review per user per product
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating}★)"


class ReviewHelpful(models.Model):
    """Track who found reviews helpful"""
    review = models.ForeignKey(ProductReview, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()  # True = helpful, False = not helpful
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['review', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {'Helpful' if self.is_helpful else 'Not Helpful'}"
