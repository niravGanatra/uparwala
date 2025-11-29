from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from vendors.models import VendorProfile
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    # Basic Information
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.TextField(blank=True)
    
    # Product Data
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    featured = models.BooleanField(default=False)
    
    # Pricing
    regular_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Computed field (sale or regular)
    sale_price_start = models.DateTimeField(blank=True, null=True)
    sale_price_end = models.DateTimeField(blank=True, null=True)
    
    # Tax
    TAX_STATUS_CHOICES = [
        ('taxable', 'Taxable'),
        ('shipping', 'Shipping only'),
        ('none', 'None'),
    ]
    tax_status = models.CharField(max_length=20, choices=TAX_STATUS_CHOICES, default='taxable')
    tax_class = models.CharField(max_length=50, blank=True)
    
    # Inventory
    manage_stock = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    STOCK_STATUS_CHOICES = [
        ('instock', 'In Stock'),
        ('outofstock', 'Out of Stock'),
        ('onbackorder', 'On Backorder'),
    ]
    stock_status = models.CharField(max_length=20, choices=STOCK_STATUS_CHOICES, default='instock')
    BACKORDER_CHOICES = [
        ('no', 'Do not allow'),
        ('notify', 'Allow, but notify customer'),
        ('yes', 'Allow'),
    ]
    backorders = models.CharField(max_length=10, choices=BACKORDER_CHOICES, default='no')
    low_stock_threshold = models.PositiveIntegerField(blank=True, null=True)
    
    # Shipping
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Weight in kg')
    length = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Length in cm')
    width = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Width in cm')
    height = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Height in cm')
    shipping_class = models.CharField(max_length=100, blank=True)
    
    # Product Type
    virtual = models.BooleanField(default=False, help_text='Virtual products are intangible and are not shipped')
    downloadable = models.BooleanField(default=False)
    download_limit = models.IntegerField(blank=True, null=True, help_text='-1 for unlimited')
    download_expiry = models.IntegerField(blank=True, null=True, help_text='Number of days before download expires')
    
    # Visibility & Purchase
    CATALOG_VISIBILITY_CHOICES = [
        ('visible', 'Shop and search results'),
        ('catalog', 'Shop only'),
        ('search', 'Search results only'),
        ('hidden', 'Hidden'),
    ]
    catalog_visibility = models.CharField(max_length=20, choices=CATALOG_VISIBILITY_CHOICES, default='visible')
    purchase_note = models.TextField(blank=True, help_text='Note to customer after purchase')
    
    # Reviews
    enable_reviews = models.BooleanField(default=True)
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    review_count = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['sku']),
            models.Index(fields=['featured']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-compute price field
        if self.sale_price and self.sale_price < self.regular_price:
            self.price = self.sale_price
        else:
            self.price = self.regular_price
        
        # Auto-update stock status
        if self.manage_stock:
            if self.stock <= 0:
                self.stock_status = 'outofstock'
            else:
                self.stock_status = 'instock'
        
        super().save(*args, **kwargs)

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class ProductAttribute(models.Model):
    """Product attributes like Color, Size, Material, etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes')
    name = models.CharField(max_length=100)  # e.g., "Color", "Size"
    value = models.CharField(max_length=255)  # e.g., "Red", "Large"
    is_variation = models.BooleanField(default=False)  # Used for variations

    class Meta:
        unique_together = ['product', 'name', 'value']

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"

class Variation(models.Model):
    """Product variations with individual pricing and stock"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variations')
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    # Pricing
    regular_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Stock
    manage_stock = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    
    # Attributes (stored as JSON or separate model)
    attributes = models.JSONField(default=dict)  # e.g., {"Color": "Red", "Size": "Large"}
    
    # Shipping
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        attr_str = ', '.join([f"{k}: {v}" for k, v in self.attributes.items()])
        return f"{self.product.name} - {attr_str}"

class ProductDownload(models.Model):
    """Downloadable files for digital products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='downloads')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='product_downloads/')
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"


class ProductReview(models.Model):
    """Customer product reviews and ratings"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    
    # Review content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Moderation
    is_approved = models.BooleanField(default=True)  # Auto-approve by default
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


class Wishlist(models.Model):
    """Customer wishlist/favorites"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class BulkImportHistory(models.Model):
    """Track bulk product import history"""
    vendor = models.ForeignKey('vendors.VendorProfile', on_delete=models.CASCADE, related_name='import_history')
    
    file_name = models.CharField(max_length=255)
    file_path = models.FileField(upload_to='bulk_imports/')
    
    total_rows = models.IntegerField(default=0)
    successful_imports = models.IntegerField(default=0)
    failed_imports = models.IntegerField(default=0)
    
    errors = models.JSONField(default=list, blank=True)
    
    STATUS_CHOICES = (
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Bulk import histories'
    
    def __str__(self):
        return f"{self.vendor.business_name} - {self.file_name}"


class ProductModeration(models.Model):
    """Product moderation queue"""
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('changes_requested', 'Changes Requested'),
    )
    
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='moderation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    review_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
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
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    min_purchase_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
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
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.title
