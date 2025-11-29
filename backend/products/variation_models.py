from django.db import models
from django.core.validators import MinValueValidator
from .models import Product


class ProductVariation(models.Model):
    """Product variations like size, color, etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variations')
    
    # Variation attributes (stored as JSON for flexibility)
    # Example: {"size": "L", "color": "Red"}
    attributes = models.JSONField()
    
    # SKU for this variation
    sku = models.CharField(max_length=100, unique=True)
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Override product price
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Inventory
    stock = models.PositiveIntegerField(default=0)
    
    # Image (optional, specific to this variation)
    image = models.ImageField(upload_to='product_variations/', blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        attr_str = ', '.join([f"{k}: {v}" for k, v in self.attributes.items()])
        return f"{self.product.name} - {attr_str}"
    
    def get_price(self):
        """Get the effective price (sale price if available, otherwise regular price or product price)"""
        if self.sale_price:
            return self.sale_price
        if self.price:
            return self.price
        return self.product.price


class BulkImportHistory(models.Model):
    """Track bulk product import history"""
    vendor = models.ForeignKey('vendors.VendorProfile', on_delete=models.CASCADE, related_name='import_history')
    
    # File info
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='bulk_imports/')
    
    # Import stats
    total_rows = models.IntegerField(default=0)
    successful_imports = models.IntegerField(default=0)
    failed_imports = models.IntegerField(default=0)
    
    # Error log
    errors = models.JSONField(default=list, blank=True)  # List of error messages
    
    # Status
    STATUS_CHOICES = (
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Bulk import histories'
    
    def __str__(self):
        return f"{self.vendor.business_name} - {self.file_name} ({self.status})"
