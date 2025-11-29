from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class CommissionSettings(models.Model):
    """Global and vendor-specific commission settings"""
    vendor = models.OneToOneField('vendors.VendorProfile', on_delete=models.CASCADE, null=True, blank=True, related_name='commission_settings')
    
    # Commission rates
    commission_type = models.CharField(max_length=20, choices=[
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount')
    ], default='percentage')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Minimum thresholds
    min_payout_amount = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.vendor:
            return f"{self.vendor.business_name} - {self.commission_rate}%"
        return f"Global - {self.commission_rate}%"
    
    class Meta:
        verbose_name_plural = 'Commission settings'


class PayoutRequest(models.Model):
    """Vendor payout requests"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )
    
    vendor = models.ForeignKey('vendors.VendorProfile', on_delete=models.CASCADE, related_name='payout_requests')
    
    # Amount
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Payment details
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Admin notes
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.vendor.business_name} - ₹{self.requested_amount} ({self.status})"


class ProductModeration(models.Model):
    """Product moderation queue"""
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('changes_requested', 'Changes Requested'),
    )
    
    product = models.OneToOneField('products.Product', on_delete=models.CASCADE, related_name='moderation')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Review details
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='moderated_products')
    review_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.product.name} - {self.status}"


class Coupon(models.Model):
    """Discount coupons"""
    DISCOUNT_TYPE_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Discount
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Restrictions
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '₹'}"
    
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.usage_limit is None or self.usage_count < self.usage_limit)
        )


class CMSPage(models.Model):
    """Content Management System pages"""
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    
    # Status
    is_published = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.title
