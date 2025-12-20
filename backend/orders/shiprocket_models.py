from django.db import models
from django.utils import timezone


class ShiprocketConfig(models.Model):
    """Shiprocket API configuration"""
    email = models.EmailField()
    password = models.CharField(max_length=255)
    api_token = models.CharField(max_length=500, blank=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Pickup address
    pickup_location = models.CharField(max_length=255, help_text="Name of pickup location")
    pickup_address = models.TextField()
    pickup_city = models.CharField(max_length=100)
    pickup_state = models.CharField(max_length=100)
    pickup_pincode = models.CharField(max_length=10)
    pickup_phone = models.CharField(max_length=15)
    pickup_name = models.CharField(max_length=255, default="Warehouse")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Shiprocket Configuration'
        verbose_name_plural = 'Shiprocket Configurations'
    
    def __str__(self):
        return f"Shiprocket Config - {self.email}"


class ShipmentTracking(models.Model):
    """Track Shiprocket shipments"""
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='shipments')
    shiprocket_order_id = models.CharField(max_length=100, unique=True)
    shiprocket_shipment_id = models.CharField(max_length=100, blank=True)
    awb_code = models.CharField(max_length=100, blank=True)  # Air Waybill
    courier_name = models.CharField(max_length=100, blank=True)
    courier_id = models.IntegerField(null=True, blank=True)
    
    # Tracking
    current_status = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True)
    
    # Label and manifest
    label_url = models.URLField(blank=True)
    manifest_url = models.URLField(blank=True)
    invoice_url = models.URLField(blank=True)
    
    # Pickup
    pickup_scheduled = models.BooleanField(default=False)
    pickup_token_number = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Shipment Tracking'
        verbose_name_plural = 'Shipment Trackings'
    
    def __str__(self):
        return f"Shipment {self.awb_code or self.shiprocket_order_id} - Order #{self.order.order_number}"


class OrderTrackingStatus(models.Model):
    """Track order status changes and location updates"""
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='tracking_history')
    shipment = models.ForeignKey(ShipmentTracking, on_delete=models.CASCADE, null=True, blank=True, related_name='tracking_events')
    
    status = models.CharField(max_length=100)
    status_code = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    
    # Shiprocket specific data
    shiprocket_status = models.CharField(max_length=100, blank=True)
    courier_status = models.CharField(max_length=100, blank=True)
    
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Order Tracking Status'
        verbose_name_plural = 'Order Tracking Statuses'
    
    def __str__(self):
        return f"{self.order.order_number} - {self.status} at {self.timestamp}"


class ShiprocketPincode(models.Model):
    """
    Master list of all Pincodes supported by Shiprocket.
    Used for local serviceability validation before API calls.
    """
    # Core Data
    pincode = models.CharField(max_length=10, unique=True, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    division_name = models.CharField(max_length=100, blank=True, help_text="Division Name from CSV", db_index=True)
    zone = models.CharField(max_length=10, blank=True, help_text="East, West, North, South")
    
    # Flags
    is_serviceable = models.BooleanField(default=True, db_index=True)
    is_cod_available = models.BooleanField(default=True)
    
    # Metadata
    last_synced_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['state', 'city']),
        ]
        verbose_name = "Serviceable Pincode Master"
        verbose_name_plural = "Serviceable Pincode Masters"

    def __str__(self):
        return f"{self.pincode} - {self.city}, {self.state}"
