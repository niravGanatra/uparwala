from django.db import models
from django.conf import settings
from .models import Order, OrderItem


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
    refund_method = models.CharField(max_length=50, blank=True)  # 'original', 'wallet', etc.
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
