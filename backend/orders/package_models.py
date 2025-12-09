from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError


class OrderPackage(models.Model):
    """Support for multiple packages in one order"""
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='packages')
    package_number = models.IntegerField()
    
    # Dimensions (in cm and kg)
    length = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    width = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    height = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    weight = models.DecimalField(max_digits=10, decimal_places=2, default=0.5)
    
    # Tracking
    awb_code = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(blank=True)
    courier_name = models.CharField(max_length=100, blank=True)
    
    # Status
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('manifested', 'Manifested'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    
    # Shiprocket integration
    shiprocket_shipment_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['package_number']
        unique_together = ['order', 'package_number']
        verbose_name = 'Order Package'
        verbose_name_plural = 'Order Packages'
    
    def __str__(self):
        return f"Package {self.package_number} - Order #{self.order.id}"
    
    def get_total_items(self):
        """Get total number of items in this package"""
        return sum(item.quantity for item in self.items.all())


class PackageItem(models.Model):
    """Items in each package"""
    package = models.ForeignKey(OrderPackage, on_delete=models.CASCADE, related_name='items')
    order_item = models.ForeignKey('OrderItem', on_delete=models.CASCADE, related_name='package_items')
    quantity = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Package Item'
        verbose_name_plural = 'Package Items'
    
    def __str__(self):
        return f"{self.order_item.product.name} x{self.quantity} in Package {self.package.package_number}"
    
    def clean(self):
        """Validate that package item quantity doesn't exceed order item quantity"""
        if self.order_item:
            # Get total quantity already assigned to packages for this order item
            existing_quantity = PackageItem.objects.filter(
                order_item=self.order_item
            ).exclude(pk=self.pk).aggregate(
                total=models.Sum('quantity')
            )['total'] or 0
            
            # Check if total would exceed order item quantity
            if existing_quantity + self.quantity > self.order_item.quantity:
                raise ValidationError(
                    f"Cannot assign {self.quantity} items. Only {self.order_item.quantity - existing_quantity} remaining."
                )
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
