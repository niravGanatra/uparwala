from django.db import models
from django.conf import settings


class ProductVideo(models.Model):
    """Product videos - uploaded files or external URLs"""
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200, blank=True)
    
    # Video source (either file or URL)
    video_file = models.FileField(upload_to='products/videos/', blank=True, help_text="Upload video file")
    video_url = models.URLField(blank=True, help_text="YouTube/Vimeo URL")
    
    # Metadata
    thumbnail = models.ImageField(upload_to='products/video_thumbnails/', blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text="Duration in seconds")
    order = models.IntegerField(default=0, help_text="Display order")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Product Video'
        verbose_name_plural = 'Product Videos'
    
    def __str__(self):
        return f"{self.product.name} - Video {self.id}"
    
    def get_video_source(self):
        """Return the video source (file or URL)"""
        if self.video_file:
            return self.video_file.url
        return self.video_url


class ProductComparison(models.Model):
    """User product comparisons - can be session-based or user-based"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='comparisons')
    session_key = models.CharField(max_length=40, blank=True, help_text="For anonymous users")
    products = models.ManyToManyField('Product', related_name='in_comparisons')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product Comparison'
        verbose_name_plural = 'Product Comparisons'
    
    def __str__(self):
        user_str = self.user.username if self.user else f"Session {self.session_key[:8]}"
        return f"Comparison by {user_str} - {self.products.count()} products"


class ProductBundle(models.Model):
    """Frequently bought together - product bundles"""
    primary_product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='bundles')
    bundled_products = models.ManyToManyField('Product', related_name='bundled_in', help_text="Products frequently bought with primary")
    
    # Discount on bundle
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Discount amount or percentage")
    
    # Status
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Product Bundle'
        verbose_name_plural = 'Product Bundles'
    
    def __str__(self):
        return f"Bundle for {self.primary_product.name}"
    
    def get_bundle_price(self):
        """Calculate total bundle price with discount"""
        total = self.primary_product.price
        
        for product in self.bundled_products.all():
            total += product.price
        
        if self.discount_type == 'percentage':
            discount = total * (self.discount_value / 100)
        else:
            discount = self.discount_value
        
        final_price = total - discount
        return max(final_price, 0)
    
    def get_savings(self):
        """Calculate savings amount"""
        total_without_discount = self.primary_product.price
        for product in self.bundled_products.all():
            total_without_discount += product.price
        
        return total_without_discount - self.get_bundle_price()
