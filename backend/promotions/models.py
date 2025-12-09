from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Coupon(models.Model):
    """Discount coupons for orders"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    # Basic info
    code = models.CharField(max_length=50, unique=True, help_text="Coupon code (e.g., SAVE20)")
    description = models.TextField(help_text="Description shown to customers")
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # Conditions
    min_order_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Minimum cart value required"
    )
    max_discount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Maximum discount amount (for percentage coupons)"
    )
    
    # Usage limits
    usage_limit = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Total number of times this coupon can be used"
    )
    usage_per_user = models.PositiveIntegerField(
        default=1,
        help_text="Number of times each user can use this coupon"
    )
    times_used = models.PositiveIntegerField(default=0)
    
    # Validity
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    # Restrictions (optional - apply to specific categories/products)
    applicable_categories = models.ManyToManyField(
        'products.Category', 
        blank=True,
        help_text="Leave empty to apply to all categories"
    )
    applicable_products = models.ManyToManyField(
        'products.Product', 
        blank=True,
        help_text="Leave empty to apply to all products"
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='created_coupons'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '₹'}"
    
    def is_valid(self):
        """Check if coupon is currently valid"""
        now = timezone.now()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_to and
            (self.usage_limit is None or self.times_used < self.usage_limit)
        )
    
    def calculate_discount(self, cart_total):
        """Calculate discount amount for given cart total"""
        if cart_total < self.min_order_value:
            return 0
        
        if self.discount_type == 'percentage':
            discount = (cart_total * self.discount_value) / 100
            if self.max_discount:
                discount = min(discount, self.max_discount)
        else:
            discount = min(self.discount_value, cart_total)
        
        return round(discount, 2)


class CouponUsage(models.Model):
    """Track coupon usage by users"""
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-used_at']
    
    def __str__(self):
        return f"{self.user.username} used {self.coupon.code} - ₹{self.discount_amount}"
