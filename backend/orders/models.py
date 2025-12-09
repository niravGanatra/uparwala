from django.db import models
from django.conf import settings
from products.models import Product
from vendors.models import VendorProfile
from .shiprocket_models import ShiprocketConfig, ShipmentTracking, OrderTrackingStatus
from .package_models import OrderPackage, PackageItem

class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cod', 'Cash on Delivery'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('razorpay', 'Razorpay'),
        ('cod', 'Cash on Delivery'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Payment information
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='razorpay')
    
    # Amount breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Addresses (stored as JSON for historical record)
    shipping_address = models.TextField()  # Keep for backward compatibility
    shipping_address_data = models.JSONField(default=dict, blank=True)
    billing_address_data = models.JSONField(default=dict, blank=True)
    
    # Tax breakdown
    tax_breakdown = models.JSONField(default=dict, blank=True)
    
    # Tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    
    # Shiprocket integration
    shiprocket_order_id = models.CharField(max_length=100, blank=True)
    awb_code = models.CharField(max_length=100, blank=True, help_text="Air Waybill Code")
    courier_name = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2) # Price at time of purchase
    
    # Payout tracking
    paid_to_vendor = models.BooleanField(default=False)
    payout_date = models.DateTimeField(null=True, blank=True)
    payout_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Partial cancellation support
    cancelled_quantity = models.PositiveIntegerField(default=0)
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    refund_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order.id})"
    
    def get_active_quantity(self):
        """Get quantity that hasn't been cancelled"""
        return self.quantity - self.cancelled_quantity
    
    def can_cancel(self, quantity):
        """Check if quantity can be cancelled"""
        return quantity <= self.get_active_quantity()
    
    def cancel_partial(self, quantity, reason):
        """Cancel partial quantity and calculate refund"""
        from django.utils import timezone
        
        if not self.can_cancel(quantity):
            raise ValueError(f"Cannot cancel {quantity} items. Only {self.get_active_quantity()} available.")
        
        # Update cancelled quantity
        self.cancelled_quantity += quantity
        self.cancellation_reason = reason
        self.cancelled_at = timezone.now()
        
        # Calculate refund amount (price per item * cancelled quantity)
        refund = self.price * quantity
        self.refund_amount += refund
        
        self.save()
        
        # Restore inventory
        self.product.stock += quantity
        self.product.save()
        
        return refund


class OrderReturn(models.Model):
    """Customer return requests"""
    RETURN_STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('received', 'Received'),
        ('refunded', 'Refunded'),
    )
    
    RETURN_REASON_CHOICES = (
        ('defective', 'Defective/Damaged'),
        ('wrong_item', 'Wrong Item Sent'),
        ('not_as_described', 'Not as Described'),
        ('quality_issue', 'Quality Issue'),
        ('changed_mind', 'Changed Mind'),
        ('other', 'Other'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='returns', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='returns')
    
    # Return details
    reason = models.CharField(max_length=50, choices=RETURN_REASON_CHOICES)
    description = models.TextField()
    quantity = models.PositiveIntegerField(default=1)
    
    # Status
    status = models.CharField(max_length=20, choices=RETURN_STATUS_CHOICES, default='requested')
    
    # Refund
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_method = models.CharField(max_length=50, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    # Admin notes
    admin_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Return Request #{self.id} for Order #{self.order.id}"


# Phase 4-5 Models: Address Verification, COD, Gift Wrapping

class AddressVerification(models.Model):
    """Address verification for high-value orders"""
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='address_verification')
    
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('failed', 'Verification Failed'),
        ('manual_review', 'Manual Review Required'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    verified_address = models.TextField(blank=True)
    verification_method = models.CharField(max_length=50, blank=True)
    verification_notes = models.TextField(blank=True)
    
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_addresses')
    verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Address Verification'
        verbose_name_plural = 'Address Verifications'
    
    def __str__(self):
        return f"Verification for Order #{self.order.id} - {self.status}"


class CODPincode(models.Model):
    """Allowed pincodes for Cash on Delivery"""
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    max_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'COD Pincode'
        verbose_name_plural = 'COD Pincodes'
    
    def __str__(self):
        return f"{self.pincode} - {self.city}, {self.state}"
    
        return True


class ServiceablePincode(models.Model):
    """Global list of serviceable pincodes for the platform"""
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Serviceable Pincode'
        verbose_name_plural = 'Serviceable Pincodes'
    
    def __str__(self):
        return f"{self.pincode} - {self.city}"


class GiftOption(models.Model):
    """Gift wrapping options"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='gift_wrapping/', blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
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
    gift_message = models.TextField(max_length=500, blank=True)
    recipient_name = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Order Gift'
        verbose_name_plural = 'Order Gifts'
    
    def __str__(self):
        return f"Gift for Order #{self.order.id}"


class OrderStatusHistory(models.Model):
    """Track order status changes"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name_plural = 'Order status histories'
    
    def __str__(self):
        return f"Order #{self.order.id} - {self.status}"
