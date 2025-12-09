from django.db import models
from django.conf import settings
from orders.models import Order


class Campaign(models.Model):
    """Marketing campaigns with UTM tracking"""
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    
    # UTM Parameters
    utm_source = models.CharField(max_length=100, help_text="Traffic source (e.g., google, facebook)")
    utm_medium = models.CharField(max_length=100, help_text="Marketing medium (e.g., cpc, email)")
    utm_campaign = models.CharField(max_length=100, help_text="Campaign name")
    
    # Tracking metrics
    clicks = models.IntegerField(default=0, help_text="Total clicks/visits")
    conversions = models.IntegerField(default=0, help_text="Total orders from this campaign")
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total revenue generated")
    
    # Campaign details
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Campaign'
        verbose_name_plural = 'Campaigns'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def get_conversion_rate(self):
        """Calculate conversion rate"""
        if self.clicks == 0:
            return 0
        return (self.conversions / self.clicks) * 100
    
    def get_roi(self):
        """Calculate ROI if budget is set"""
        if not self.budget or self.budget == 0:
            return None
        return ((self.revenue - self.budget) / self.budget) * 100


class UTMTracking(models.Model):
    """Track UTM parameters for user sessions"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='utm_tracking'
    )
    session_key = models.CharField(max_length=40, db_index=True)
    
    # UTM Parameters
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    utm_term = models.CharField(max_length=100, blank=True, help_text="Paid search keywords")
    utm_content = models.CharField(max_length=100, blank=True, help_text="Ad variation")
    
    # Additional tracking
    referrer = models.URLField(blank=True, help_text="HTTP referrer")
    landing_page = models.URLField(help_text="First page visited")
    
    # Attribution
    campaign = models.ForeignKey(
        Campaign, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='tracking_entries'
    )
    order = models.ForeignKey(
        Order, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='utm_tracking'
    )
    converted = models.BooleanField(default=False)
    conversion_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    converted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'UTM Tracking'
        verbose_name_plural = 'UTM Tracking'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['session_key', '-created_at']),
            models.Index(fields=['utm_campaign', '-created_at']),
        ]
    
    def __str__(self):
        return f"UTM: {self.utm_source}/{self.utm_medium}/{self.utm_campaign}"
