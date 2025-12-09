from django.db import models
from django.conf import settings
from products.models import Product
from vendors.models import VendorProfile
from .shiprocket_models import ShiprocketConfig, ShipmentTracking, OrderTrackingStatus

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

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Order #{self.order.id})"


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
        return f"Return #{self.id} - Order #{self.order.id}"


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
