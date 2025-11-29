from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    is_vendor = models.BooleanField(default=False)
    
    # Vendor approval fields
    vendor_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending',
        null=True,
        blank=True,
        help_text='Vendor approval status'
    )
    vendor_application_date = models.DateTimeField(null=True, blank=True)
    vendor_approval_date = models.DateTimeField(null=True, blank=True)
    vendor_rejection_reason = models.TextField(blank=True)
    
    # Vendor business details
    business_name = models.CharField(max_length=255, blank=True)
    business_email = models.EmailField(blank=True)
    business_phone = models.CharField(max_length=15, blank=True)
    business_address = models.TextField(blank=True)
    store_description = models.TextField(blank=True)
    tax_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.username


class Address(models.Model):
    """Customer shipping and billing addresses"""
    ADDRESS_TYPE_CHOICES = (
        ('shipping', 'Shipping'),
        ('billing', 'Billing'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_type = models.CharField(max_length=10, choices=ADDRESS_TYPE_CHOICES, default='shipping')
    
    # Contact information
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    
    # Address details
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    state_code = models.CharField(max_length=10)  # For tax calculation
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    
    # Preferences
    is_default = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name_plural = 'Addresses'
    
    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.state}"
    
    def save(self, *args, **kwargs):
        # If this is set as default, unset other default addresses
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                address_type=self.address_type,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
