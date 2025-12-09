from django.contrib import admin
from .models import AddressVerification, CODPincode, GiftOption, OrderGift


@admin.register(AddressVerification)
class AddressVerificationAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'verified_by', 'verified_at', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__id', 'verified_address']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'status')
        }),
        ('Verification Details', {
            'fields': ('verified_address', 'verification_method', 'verification_notes')
        }),
        ('Admin Actions', {
            'fields': ('verified_by', 'verified_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CODPincode)
class CODPincodeAdmin(admin.ModelAdmin):
    list_display = ['pincode', 'city', 'state', 'is_active', 'max_order_value']
    list_filter = ['is_active', 'state']
    search_fields = ['pincode', 'city', 'state']
    
    fieldsets = (
        ('Location', {
            'fields': ('pincode', 'city', 'state')
        }),
        ('Restrictions', {
            'fields': ('is_active', 'max_order_value', 'notes')
        }),
    )


@admin.register(GiftOption)
class GiftOptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active', 'sort_order']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    
    fieldsets = (
        ('Gift Details', {
            'fields': ('name', 'description', 'image', 'price')
        }),
        ('Display', {
            'fields': ('is_active', 'sort_order')
        }),
    )


@admin.register(OrderGift)
class OrderGiftAdmin(admin.ModelAdmin):
    list_display = ['order', 'gift_option', 'recipient_name', 'created_at']
    list_filter = ['created_at']
    search_fields = ['order__id', 'recipient_name', 'gift_message']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Order', {
            'fields': ('order', 'gift_option')
        }),
        ('Gift Details', {
            'fields': ('gift_message', 'recipient_name')
        }),
    )
