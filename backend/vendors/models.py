from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

User = get_user_model()

class VendorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    store_name = models.CharField(max_length=255)
    store_slug = models.SlugField(unique=True, blank=True, null=True)
    
    # Store Information
    store_description = models.TextField(blank=True)
    store_banner = models.ImageField(upload_to='vendor_banners/', blank=True, null=True)
    store_logo = models.ImageField(upload_to='vendor_logos/', blank=True, null=True)
    
    # Contact Information
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    # Store Settings
    store_hours = models.JSONField(default=dict, blank=True)  # {"monday": {"open": "09:00", "close": "18:00"}}
    vacation_mode = models.BooleanField(default=False)
    vacation_message = models.TextField(blank=True)
    
    # SEO
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)
    
    # Store Policies
    return_policy = models.TextField(blank=True)
    shipping_policy = models.TextField(blank=True)
    privacy_policy = models.TextField(blank=True)
    
    # Verification & Status
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verified_badge = models.BooleanField(default=False)
    
    # Approval tracking
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_vendors', help_text='Admin who approved this vendor')
    approved_at = models.DateTimeField(null=True, blank=True, help_text='When the vendor was approved')
    rejection_reason = models.TextField(blank=True, help_text='Reason for rejection if status is rejected')
    
    # Commission - DEPRECATED/REMOVED
    # Commission is now strictly calculated based on Product Category
    
    # Ratings
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(Decimal('0')), MaxValueValidator(Decimal('5'))]
    )
    review_count = models.PositiveIntegerField(default=0)
    
    # Compliance & Legal
    is_food_vendor = models.BooleanField(default=False, help_text="Is this vendor selling food products?")
    food_license_number = models.CharField(max_length=50, blank=True)
    food_license_certificate = models.FileField(upload_to='vendor_docs/food_license/', blank=True, null=True, help_text="Upload FSSAI license")

    # ID Proof Documents (Required)
    pan_card = models.FileField(upload_to='vendor_docs/pan/', blank=True, null=True, help_text="PAN Card (Firm or Individual)")
    aadhar_card = models.FileField(upload_to='vendor_docs/aadhar/', blank=True, null=True, help_text="Aadhar Card (Address Proof)")
    
    # GST & Tax (Optional)
    gst_certificate = models.FileField(upload_to='vendor_docs/gst/', blank=True, null=True, help_text="GST Certificate (Optional)")
    
    # Business Proof (Optional)
    business_proof = models.FileField(upload_to='vendor_docs/business/', blank=True, null=True, help_text="Shop & Establishment / Udham / Trade License")
    business_proof_remarks = models.TextField(blank=True, help_text="Remarks if business proof not available")
    
    # Non-GST Declaration Consent
    non_gst_declaration_accepted = models.BooleanField(default=False, help_text="Vendor accepted Non-GST declaration")
    non_gst_declaration_accepted_at = models.DateTimeField(null=True, blank=True)
    non_gst_declaration_ip = models.GenericIPAddressField(null=True, blank=True)

    # Bank Details
    bank_account_holder_name = models.CharField(max_length=255, blank=True)
    bank_name = models.CharField(max_length=255, blank=True)
    bank_branch = models.CharField(max_length=255, blank=True)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_ifsc_code = models.CharField(max_length=20, blank=True)
    cancelled_cheque = models.FileField(upload_to='vendor_docs/bank/', blank=True, null=True, help_text="Upload cancelled cheque or passbook copy")


    # Serviceability
    serviceable_pincodes = models.TextField(blank=True, help_text="Comma-separated list of pincodes. Leave empty to serve all (subject to global restrictions).")
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    
    # Shiprocket Integration
    shiprocket_pickup_location_name = models.CharField(max_length=100, blank=True, help_text="Unique Pickup Location Name in Shiprocket")

    # Delhivery Integration
    delhivery_warehouse_name = models.CharField(max_length=100, blank=True, help_text="Registered Warehouse Name in Delhivery")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.store_name

class StoreReview(models.Model):
    """Customer reviews for vendor stores"""
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='store_reviews')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='store_reviews_given')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['vendor', 'customer']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.username} - {self.vendor.store_name} ({self.rating}★)"

class StoreFollower(models.Model):
    """Customers following vendor stores"""
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='followers')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_stores')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['vendor', 'customer']

    def __str__(self):
        return f"{self.customer.username} follows {self.vendor.store_name}"

class Wallet(models.Model):
    vendor = models.OneToOneField(VendorProfile, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    pending_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_earned = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_withdrawn = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # Withdrawal Settings
    minimum_withdrawal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('100.00'))
    PAYMENT_METHOD_CHOICES = [
        ('bank', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('upi', 'UPI'),
    ]
    preferred_payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='bank')
    
    # Payment Details (stored as JSON for flexibility)
    payment_details = models.JSONField(default=dict, blank=True)  # {"bank_name": "...", "account_number": "..."}
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vendor.store_name} - Balance: ₹{self.balance}"

class Transaction(models.Model):
    """Financial transaction history"""
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    TRANSACTION_TYPE_CHOICES = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Transaction Details
    description = models.CharField(max_length=255)
    reference_id = models.CharField(max_length=100, blank=True)  # Order ID, Withdrawal ID, etc.
    
    # Balance after transaction
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.upper()} - ₹{self.amount} - {self.description}"

class Withdrawal(models.Model):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    payment_method = models.CharField(max_length=20)
    payment_details = models.JSONField(default=dict)
    
    # Admin notes
    admin_note = models.TextField(blank=True)
    
    # Transaction reference
    transaction_id = models.CharField(max_length=100, blank=True)
    
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.vendor.store_name} - ₹{self.amount} ({self.status})"




class PayoutRequest(models.Model):
    """Vendor payout requests"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    )
    
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='payout_requests')
    requested_amount = models.DecimalField(max_digits=10, decimal_places=2)
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.vendor.store_name} - ₹{self.requested_amount} ({self.status})"

class VendorCoupon(models.Model):
    """Vendor-specific discount coupons"""
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='coupons')
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    
    # Discount
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Restrictions
    minimum_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    usage_limit = models.PositiveIntegerField(blank=True, null=True, help_text='Total usage limit')
    usage_limit_per_user = models.PositiveIntegerField(blank=True, null=True)
    
    # Validity
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Status
    is_active = models.BooleanField(default=True)
    usage_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.vendor.store_name}"

class VendorAnnouncement(models.Model):
    """Promotional announcements for vendor stores"""
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='announcements')
    title = models.CharField(max_length=255)
    content = models.TextField()
    banner_image = models.ImageField(upload_to='announcements/', blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vendor.store_name} - {self.title}"

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import VendorProfile

@receiver(post_save, sender=VendorProfile)
def sync_shiprocket_pickup(sender, instance, created, **kwargs):
    """Sync Vendor Address to Shiprocket as Pickup Location"""
    # Only sync if address fields are present
    if instance.address and instance.city and instance.zip_code:
        # We perform this asynchronously in production (Celery), 
        # but for now we do it synchronously or try/except to avoid blocking
        try:
            from orders.shiprocket_service import ShiprocketService
            service = ShiprocketService()
            service.sync_vendor_pickup_location(instance)
        except Exception as e:
            # Don't break the save if SR fails (e.g. invalid config)
            print(f"Auto-sync Shiprocket failed: {e}")
