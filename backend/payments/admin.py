from django.contrib import admin
from .models import Payment, ShippingZone, TaxRate


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'payment_id', 'amount', 'status', 'payment_method', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['payment_id', 'razorpay_order_id', 'order__id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'amount', 'payment_method')
        }),
        ('Razorpay Details', {
            'fields': ('payment_id', 'razorpay_order_id', 'razorpay_signature')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_rate', 'per_kg_rate', 'free_shipping_threshold', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    
    fieldsets = (
        ('Zone Information', {
            'fields': ('name', 'states', 'is_active')
        }),
        ('Rates', {
            'fields': ('base_rate', 'per_kg_rate', 'free_shipping_threshold')
        }),
    )


@admin.register(TaxRate)
class TaxRateAdmin(admin.ModelAdmin):
    list_display = ['state_name', 'state_code', 'cgst_rate', 'sgst_rate', 'igst_rate', 'total_gst']
    search_fields = ['state_name', 'state_code']
    
    def total_gst(self, obj):
        return f"{obj.cgst_rate + obj.sgst_rate}%"
    total_gst.short_description = 'Total GST'
