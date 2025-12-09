from django.db import models
from django.conf import settings
from orders.models import Order


class AddressVerification(models.Model):
    """Address verification for high-value orders"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='address_verification')
    
    # Verification status
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('failed', 'Verification Failed'),
        ('manual_review', 'Manual Review Required'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Verification data
    verified_address = models.TextField(blank=True, help_text="Verified address details")
    verification_method = models.CharField(max_length=50, blank=True, help_text="Method used for verification")
    verification_notes = models.TextField(blank=True)
    
    # Admin actions
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='verified_addresses'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Address Verification'
        verbose_name_plural = 'Address Verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification for Order #{self.order.id} - {self.status}"


class CODPincode(models.Model):
    """Allowed pincodes for Cash on Delivery"""
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Restrictions
    max_order_value = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Maximum order value allowed for COD (leave blank for no limit)"
    )
    notes = models.TextField(blank=True, help_text="Internal notes about this pincode")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'COD Pincode'
        verbose_name_plural = 'COD Pincodes'
        ordering = ['state', 'city', 'pincode']
    
    def __str__(self):
        return f"{self.pincode} - {self.city}, {self.state}"
    
    def is_cod_available(self, order_value):
        """Check if COD is available for given order value"""
        if not self.is_active:
            return False
        if self.max_order_value and order_value > self.max_order_value:
            return False
        return True


class GiftOption(models.Model):
    """Gift wrapping options"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='gift_wrapping/', blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Additional charge for gift wrapping")
    
    # Status
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0, help_text="Display order")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Gift Option'
        verbose_name_plural = 'Gift Options'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return f"{self.name} - ₹{self.price}"


class OrderGift(models.Model):
    """Gift details for an order"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='gift_details')
    gift_option = models.ForeignKey(GiftOption, on_delete=models.SET_NULL, null=True)
    
    # Gift details
    gift_message = models.TextField(max_length=500, blank=True, help_text="Personal message for recipient")
    recipient_name = models.CharField(max_length=200, blank=True, help_text="Gift recipient name")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Order Gift'
        verbose_name_plural = 'Order Gifts'
    
    def __str__(self):
        return f"Gift for Order #{self.order.id}"
