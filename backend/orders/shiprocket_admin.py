from django.contrib import admin
from .shiprocket_models import ShiprocketConfig, ShipmentTracking, OrderTrackingStatus


@admin.register(ShiprocketConfig)
class ShiprocketConfigAdmin(admin.ModelAdmin):
    list_display = ['email', 'pickup_location', 'is_active', 'token_expiry', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email', 'pickup_location']
    
    fieldsets = (
        ('API Credentials', {
            'fields': ('email', 'password', 'is_active')
        }),
        ('Token Information', {
            'fields': ('api_token', 'token_expiry'),
            'classes': ('collapse',)
        }),
        ('Pickup Location', {
            'fields': ('pickup_location', 'pickup_name', 'pickup_address', 'pickup_city', 
                      'pickup_state', 'pickup_pincode', 'pickup_phone')
        }),
    )
    
    readonly_fields = ['api_token', 'token_expiry', 'created_at', 'updated_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ['created_at', 'updated_at']
        return self.readonly_fields


@admin.register(ShipmentTracking)
class ShipmentTrackingAdmin(admin.ModelAdmin):
    list_display = ['order', 'awb_code', 'courier_name', 'current_status', 'pickup_scheduled', 'created_at']
    list_filter = ['courier_name', 'current_status', 'pickup_scheduled', 'created_at']
    search_fields = ['order__id', 'awb_code', 'shiprocket_order_id', 'shiprocket_shipment_id']
    readonly_fields = ['order', 'shiprocket_order_id', 'shiprocket_shipment_id', 'awb_code', 
                      'courier_name', 'courier_id', 'current_status', 'tracking_url', 
                      'estimated_delivery', 'label_url', 'manifest_url', 'invoice_url',
                      'pickup_scheduled', 'pickup_token_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'shiprocket_order_id', 'shiprocket_shipment_id')
        }),
        ('Courier Details', {
            'fields': ('courier_name', 'courier_id', 'awb_code')
        }),
        ('Tracking', {
            'fields': ('current_status', 'tracking_url', 'estimated_delivery')
        }),
        ('Documents', {
            'fields': ('label_url', 'manifest_url', 'invoice_url'),
            'classes': ('collapse',)
        }),
        ('Pickup', {
            'fields': ('pickup_scheduled', 'pickup_token_number')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Shipments are created programmatically
    
    def has_delete_permission(self, request, obj=None):
        return False  # Don't allow deletion


@admin.register(OrderTrackingStatus)
class OrderTrackingStatusAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'location', 'timestamp', 'created_at']
    list_filter = ['status', 'timestamp', 'created_at']
    search_fields = ['order__id', 'status', 'location', 'description']
    readonly_fields = ['order', 'shipment', 'status', 'status_code', 'location', 'description',
                      'shiprocket_status', 'courier_status', 'timestamp', 'created_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'shipment')
        }),
        ('Status Details', {
            'fields': ('status', 'status_code', 'description')
        }),
        ('Location & Time', {
            'fields': ('location', 'timestamp')
        }),
        ('Shiprocket Data', {
            'fields': ('shiprocket_status', 'courier_status'),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Tracking statuses are created programmatically
    
    def has_delete_permission(self, request, obj=None):
        return False  # Don't allow deletion
