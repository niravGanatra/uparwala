from django.contrib import admin
from .package_models import OrderPackage, PackageItem


class PackageItemInline(admin.TabularInline):
    model = PackageItem
    extra = 0
    fields = ['order_item', 'quantity']
    readonly_fields = []


@admin.register(OrderPackage)
class OrderPackageAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'order', 'package_number', 'status', 'awb_code', 'courier_name', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__id', 'awb_code', 'shiprocket_shipment_id']
    inlines = [PackageItemInline]
    
    fieldsets = (
        ('Package Information', {
            'fields': ('order', 'package_number', 'status')
        }),
        ('Dimensions & Weight', {
            'fields': ('length', 'width', 'height', 'weight')
        }),
        ('Shipping Details', {
            'fields': ('awb_code', 'tracking_url', 'courier_name', 'shiprocket_shipment_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PackageItem)
class PackageItemAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'package', 'order_item', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['package__order__id', 'order_item__product__name']
    readonly_fields = ['created_at']
