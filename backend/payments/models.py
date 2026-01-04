from django.db import models
from django.conf import settings
from orders.models import Order


class Payment(models.Model):
    """Payment transaction record"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('razorpay', 'Razorpay'),
        ('cod', 'Cash on Delivery'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Razorpay payment ID
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_signature = models.CharField(max_length=200, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='razorpay')
    
    # Metadata
    error_message = models.TextField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"


class ShippingZone(models.Model):
    """Shipping zones with different rates"""
    name = models.CharField(max_length=100)
    states = models.JSONField(default=list)  # List of state codes
    base_rate = models.DecimalField(max_digits=10, decimal_places=2)
    per_kg_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    free_shipping_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class TaxRate(models.Model):
    """GST tax rates by state"""
    state_code = models.CharField(max_length=10, unique=True)
    state_name = models.CharField(max_length=100)
    cgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=9.0)  # Central GST
    sgst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=9.0)  # State GST
    igst_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.0)  # Integrated GST
    
    def __str__(self):
        return f"{self.state_name} - GST {self.cgst_rate + self.sgst_rate}%"


class ShippingSettings(models.Model):
    """
    Singleton model for global shipping configuration.
    Only one instance should exist.
    """
    free_shipping_threshold = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Minimum order amount for free shipping. Leave empty to always charge shipping."
    )
    
    class Meta:
        verbose_name = "Shipping Settings"
        verbose_name_plural = "Shipping Settings"
    
    def __str__(self):
        if self.free_shipping_threshold:
            return f"Free shipping above ₹{self.free_shipping_threshold}"
        return "Always charge shipping"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance."""
        obj, created = cls.objects.get_or_create(pk=1)
        return obj
