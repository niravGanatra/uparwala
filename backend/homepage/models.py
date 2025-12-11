from django.db import models
from products.models import Product
from django.core.validators import MinValueValidator, MaxValueValidator


class HeroBanner(models.Model):
    """Hero banner section at the top of homepage"""
    title = models.CharField(max_length=200, help_text="Main headline (e.g., 'HO HO HOME SALE')")
    subtitle = models.CharField(max_length=300, blank=True, help_text="Secondary text")
    background_color = models.CharField(max_length=50, default='#eab308', help_text="Hex color or CSS gradient")
    background_image = models.ImageField(upload_to='homepage/hero/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Hero Banner'
        verbose_name_plural = 'Hero Banners'

    def __str__(self):
        return self.title


class PromotionalBanner(models.Model):
    """Promotional banners for deals and offers"""
    POSITION_CHOICES = [
        ('large_left', 'Large Left'),
        ('large_right', 'Large Right'),
        ('side', 'Side Banner'),
        ('full_width', 'Full Width'),
    ]

    title = models.CharField(max_length=200, help_text="Banner title (e.g., 'Lights & Lamps')")
    discount_text = models.CharField(max_length=100, help_text="Discount display (e.g., 'UPTO 65% OFF')")
    background_color = models.CharField(max_length=50, default='#065f46', help_text="Hex color or CSS gradient")
    background_image = models.ImageField(upload_to='homepage/banners/', blank=True, null=True)
    link_url = models.CharField(max_length=500, help_text="Where banner links to")
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default='large_left')
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Promotional Banner'
        verbose_name_plural = 'Promotional Banners'

    def __str__(self):
        return f"{self.title} - {self.discount_text}"


class FeaturedCategory(models.Model):
    """Featured categories displayed on homepage"""
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon identifier (e.g., 'frame', 'lamp')")
    image = models.ImageField(upload_to='homepage/categories/', blank=True, null=True)
    link_url = models.CharField(max_length=500, help_text="Link destination")
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name = 'Featured Category'
        verbose_name_plural = 'Featured Categories'

    def __str__(self):
        return self.name


class DealOfTheDay(models.Model):
    """Deal of the day featured products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='daily_deals')
    discount_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Discount percentage (0-100)"
    )
    start_date = models.DateField(help_text="Deal start date")
    end_date = models.DateField(help_text="Deal end date")
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Deal of the Day'
        verbose_name_plural = 'Deals of the Day'

    def __str__(self):
        return f"{self.product.name} - {self.discount_percentage}% off"

    @property
    def discounted_price(self):
        """Calculate discounted price"""
        discount_amount = (self.product.price * self.discount_percentage) / 100
        return self.product.price - discount_amount


class HostingEssential(models.Model):
    """Pooja essentials category section - Hindu worship items"""
    name = models.CharField(max_length=100, help_text="Category name (e.g., 'Diyas', 'Incense Holders')")
    image = models.ImageField(upload_to='homepage/hosting/', blank=True, null=True)
    emoji = models.CharField(max_length=10, blank=True, help_text="Optional emoji representation")
    link_url = models.CharField(max_length=500, help_text="Link destination")
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name = 'Pooja Essential'
        verbose_name_plural = 'Pooja Essentials'

    def __str__(self):
        return self.name


class PremiumSection(models.Model):
    """Premium quality sections"""
    POSITION_CHOICES = [
        ('left', 'Left'),
        ('right', 'Right'),
    ]

    title = models.CharField(max_length=100, help_text="Section title (e.g., 'Premium')")
    subtitle = models.CharField(max_length=200, help_text="Section subtitle (e.g., 'museum quality')")
    background_color = models.CharField(max_length=50, default='#f1f5f9', help_text="Hex color or CSS gradient")
    background_image = models.ImageField(upload_to='homepage/premium/', blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon identifier")
    link_url = models.CharField(max_length=500, help_text="Link destination")
    position = models.CharField(max_length=10, choices=POSITION_CHOICES, default='left')
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']
        verbose_name = 'Premium Section'
        verbose_name_plural = 'Premium Sections'

    def __str__(self):
        return f"{self.title} - {self.subtitle}"


class CategoryPromotion(models.Model):
    """Bottom category promotion grid"""
    name = models.CharField(max_length=100, help_text="Promotion name (e.g., 'Mirrors')")
    discount_text = models.CharField(max_length=100, help_text="Discount display (e.g., 'UPTO 60% OFF')")
    background_color = models.CharField(max_length=50, default='#334155', help_text="Hex color or CSS gradient")
    background_image = models.ImageField(upload_to='homepage/promotions/', blank=True, null=True)
    link_url = models.CharField(max_length=500, help_text="Link destination")
    priority = models.IntegerField(default=0, help_text="Higher priority shows first")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['priority', 'name']
        verbose_name = 'Category Promotion'
        verbose_name_plural = 'Category Promotions'

    def __str__(self):
        return f"{self.name} - {self.discount_text}"
