from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
from vendors.models import VendorProfile
from django.conf import settings
from django.utils.text import slugify
from django.core.files.storage import default_storage, storages

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='category_images/', blank=True, null=True)
    description = models.TextField(blank=True)
    DISPLAY_TYPE_CHOICES = (
        ('default', 'Default'),
        ('products', 'Products'),
        ('subcategories', 'Subcategories'),
        ('both', 'Both'),
    )
    display_type = models.CharField(max_length=20, choices=DISPLAY_TYPE_CHOICES, default='default')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    commission_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.00,
        validators=[MinValueValidator(2.00), MaxValueValidator(10.00)],
        help_text='Commission rate for products in this category (2-10%)'
    )
    show_in_menu = models.BooleanField(
        default=True,
        help_text='Display this category in the navigation menu'
    )
    menu_order = models.IntegerField(
        default=0,
        help_text='Order in which this category appears in the menu (lower numbers first)'
    )


    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class GlobalAttribute(models.Model):
    """Global Product Attributes (e.g. Size, Color)"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    ORDER_BY_CHOICES = (
        ('menu_order', 'Custom Ordering'),
        ('name', 'Name'),
        ('name_num', 'Name (Numeric)'),
        ('id', 'Term ID'),
    )
    default_sort_order = models.CharField(max_length=20, choices=ORDER_BY_CHOICES, default='menu_order')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class AttributeTerm(models.Model):
    """Terms for Global Attributes (e.g. Red, Blue, S, M)"""
    attribute = models.ForeignKey(GlobalAttribute, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    menu_order = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['attribute', 'slug']
        ordering = ['menu_order', 'name']

    def __str__(self):
        return f"{self.attribute.name}: {self.name}"


class Brand(models.Model):
    """Product brands/manufacturers"""
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    logo = models.ImageField(upload_to='brands/', blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    
    # SEO
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TaxSlab(models.Model):
    """Tax Slabs for GST (e.g., 5%, 12%, 18%, 28%)"""
    name = models.CharField(max_length=50, help_text="e.g., GST 18%")
    rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Total tax rate %")
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Central GST %")
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="State GST %")
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Integrated GST %")
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"
    
    def save(self, *args, **kwargs):
        # Auto-calculate splits if not provided
        if not self.cgst_rate and not self.sgst_rate and not self.igst_rate:
            self.igst_rate = self.rate
            self.cgst_rate = self.rate / 2
            self.sgst_rate = self.rate / 2
        super().save(*args, **kwargs)


class Product(models.Model):
    # Basic Information
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
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
    low_stock_threshold = models.IntegerField(default=2)
    sold_individually = models.BooleanField(default=False)
    
    # Weight & Dimensions
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Weight in kg')
    length = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Length in cm')
    width = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Width in cm')
    height = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, help_text='Height in cm')
    shipping_class = models.CharField(max_length=100, blank=True)
    
    # Tax
    tax_slab = models.ForeignKey('TaxSlab', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    tax_status = models.CharField(max_length=20, default='taxable', choices=[
        ('taxable', 'Taxable'),
        ('shipping', 'Shipping only'),
        ('none', 'None'),
    ])
    tax_class = models.CharField(max_length=50, blank=True, help_text="Deprecated: Use tax_slab instead")
    
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
    
    # Additional Product Information (Phase 3)
    manufacturing_country = models.CharField(max_length=100, blank=True, help_text='Country of manufacture')
    whats_in_box = models.TextField(blank=True, help_text='List items included in the package')
    safety_instructions = models.TextField(blank=True, help_text='Safety warnings and instructions')
    handling_time = models.IntegerField(default=2, help_text='Days required to prepare for shipping')
    expiry_date = models.DateField(null=True, blank=True, help_text='For perishable items')
    
    # Reviews
    enable_reviews = models.BooleanField(default=True)
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('5'))]
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
    # Let ImageField use DEFAULT_FILE_STORAGE automatically (no explicit storage parameter)
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
    
    APPLICABILITY_CHOICES = (
        ('site_wide', 'Site Wide'),
        ('specific_products', 'Specific Products'),
        ('specific_categories', 'Specific Categories'),
        ('new_user', 'New Users Only'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    applicability_type = models.CharField(max_length=20, choices=APPLICABILITY_CHOICES, default='site_wide')
    specific_products = models.ManyToManyField('Product', blank=True, related_name='coupons')
    specific_categories = models.ManyToManyField('Category', blank=True, related_name='coupons')
    
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
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '₹'} ({self.get_applicability_type_display()})"
    
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


class ProductQuestion(models.Model):
    """Customer questions about products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='questions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    question = models.TextField()
    
    # Moderation
    is_approved = models.BooleanField(default=False, help_text="Admin approval for display")
    is_answered = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', '-created_at']),
        ]
    
    def __str__(self):
        return f"Q: {self.question[:50]}... by {self.user.username}"


class StockNotification(models.Model):
    """Track customer requests for back-in-stock notifications"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_notifications')
    email = models.EmailField(blank=True, help_text="Customer email for notification")
    phone = models.CharField(max_length=15, blank=True, help_text="Customer phone for SMS notification")
    created_at = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False, help_text="Whether customer has been notified")
    notified_at = models.DateTimeField(null=True, blank=True, help_text="When notification was sent")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Stock Notification Request"
        verbose_name_plural = "Stock Notification Requests"
    
    def __str__(self):
        contact = self.email or self.phone or "No contact"
        return f"{self.product.name} - {contact}"


class ProductAnswer(models.Model):
    """Answers to product questions"""
    question = models.ForeignKey(ProductQuestion, on_delete=models.CASCADE, related_name='answers')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    answer = models.TextField()
    
    # Answer type
    is_vendor = models.BooleanField(default=False, help_text="Answer from product vendor")
    is_staff = models.BooleanField(default=False, help_text="Answer from staff/admin")
    
    # Moderation
    is_approved = models.BooleanField(default=False, help_text="Admin approval for display")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_vendor', '-is_staff', 'created_at']  # Vendor/staff answers first
    
    def __str__(self):
        answer_type = "Vendor" if self.is_vendor else ("Staff" if self.is_staff else "User")
        return f"A ({answer_type}): {self.answer[:50]}..."
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Mark question as answered
        if self.is_approved and not self.question.is_answered:
            self.question.is_answered = True
            self.question.save()


class RecentlyViewed(models.Model):
    """Track recently viewed products for users and guests"""
    # Support both logged-in users and guest sessions
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='recently_viewed'
    )
    session_key = models.CharField(max_length=40, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['user', '-viewed_at']),
            models.Index(fields=['session_key', '-viewed_at']),
        ]
        # Prevent duplicate entries
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'product'],
                condition=models.Q(user__isnull=False),
                name='unique_user_product'
            ),
            models.UniqueConstraint(
                fields=['session_key', 'product'],
                condition=models.Q(session_key__isnull=False),
                name='unique_session_product'
            ),
        ]
    
    def __str__(self):
        identifier = self.user.username if self.user else f"Session {self.session_key}"
        return f"{identifier} viewed {self.product.name}"
    
    @classmethod
    def add_view(cls, product, user=None, session_key=None):
        """Add or update a product view"""
        if user and user.is_authenticated:
            obj, created = cls.objects.update_or_create(
                user=user,
                product=product,
                defaults={'session_key': None}
            )
        elif session_key:
            obj, created = cls.objects.update_or_create(
                session_key=session_key,
                product=product,
                defaults={'user': None}
            )
        return obj
    
    @classmethod
    def get_recent_products(cls, user=None, session_key=None, limit=10):
        """Get recently viewed products - only active products from verified vendors"""
        if user and user.is_authenticated:
            views = cls.objects.filter(user=user).select_related('product', 'product__vendor')[:limit]
        elif session_key:
            views = cls.objects.filter(session_key=session_key).select_related('product', 'product__vendor')[:limit]
        else:
            return Product.objects.none()
        
        # Filter to only return active products from verified vendors
        products = []
        for view in views:
            if view.product.is_active and view.product.vendor.verification_status == 'verified':
                products.append(view.product)
        
        return products

# ==================== FOOTER MANAGEMENT MODELS ====================

class FooterSection(models.Model):
    """Main footer sections (About, Help, Consumer Policy, etc.)"""
    title = models.CharField(max_length=100)
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Footer Section'
        verbose_name_plural = 'Footer Sections'
    
    def __str__(self):
        return self.title


class FooterLink(models.Model):
    """Individual links within each footer section"""
    section = models.ForeignKey(FooterSection, on_delete=models.CASCADE, related_name='links')
    title = models.CharField(max_length=100)
    url = models.CharField(max_length=500, help_text='Internal path (e.g. /pages/about) or external URL')
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    is_active = models.BooleanField(default=True)
    opens_new_tab = models.BooleanField(default=False, help_text='Open link in new tab')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Footer Link'
        verbose_name_plural = 'Footer Links'
    
    def __str__(self):
        return f'{self.title} ({self.section.title})'


class FooterSocialMedia(models.Model):
    """Social media links"""
    ICON_CHOICES = (
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('youtube', 'Youtube'),
        ('linkedin', 'Linkedin'),
    )
    name = models.CharField(max_length=50)
    url = models.URLField()
    icon = models.CharField(max_length=50, choices=ICON_CHOICES, help_text='Icon name from lucide-react')
    order = models.IntegerField(default=0, help_text='Display order (lower numbers first)')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = 'Social Media Link'
        verbose_name_plural = 'Social Media Links'
    
    def __str__(self):
        return self.name


class FooterSettings(models.Model):
    """Global footer settings (office address, copyright, etc.)"""
    company_name = models.CharField(max_length=200, default='Uparwala')
    registered_address = models.TextField(
        help_text='Full registered office address',
        default='Buildings Alyssa, Begonia & Clove Embassy Tech Village,\nOuter Ring Road, Devarabeesanahalli Village,\nBengaluru, 560103, Karnataka, India'
    )
    cin_number = models.CharField(max_length=100, blank=True, help_text='Corporate Identification Number')
    phone_number = models.CharField(max_length=20, blank=True)
    copyright_text = models.CharField(max_length=200, default='© 2025 Uparwala. All rights reserved.')
    
    class Meta:
        verbose_name = 'Footer Settings'
        verbose_name_plural = 'Footer Settings'
    
    def __str__(self):
        return f'Footer Settings - {self.company_name}'
