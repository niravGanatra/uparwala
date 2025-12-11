from django.contrib import admin
from .models import (
    Cart, CartItem, Order, OrderItem, OrderReturn,
    AddressVerification, CODPincode, GiftOption, OrderGift
)

# Import admin modules
from . import shiprocket_admin
from . import package_admin

class OrderItemInline(admin.TabularInline):
    model = OrderItem

from .models import OrderNote
class OrderNoteInline(admin.TabularInline):
    model = OrderNote
    extra = 0
    readonly_fields = ['created_at', 'author']

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline, OrderNoteInline]
    readonly_fields = ['created_at', 'updated_at', 'shipped_at', 'delivered_at']
    list_display = ('id', 'user', 'total_amount', 'status', 'awb_code', 'courier_name', 'created_at')

    actions = ['push_to_shiprocket']

    def push_to_shiprocket(self, request, queryset):
        """Manually trigger Shiprocket Order Creation"""
        from orders.shiprocket_service import ShiprocketService
        service = ShiprocketService()
        success_count = 0
        
        for order in queryset:
            try:
                shipments = service.create_orders(order)
                if shipments:
                    success_count += 1
            except Exception as e:
                self.message_user(request, f"Error pushing order {order.id}: {e}", level='error')
        
        self.message_user(request, f"Successfully pushed {success_count} orders to Shiprocket.")
    push_to_shiprocket.short_description = "Push selected orders to Shiprocket"

admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)

@admin.register(OrderReturn)
class OrderReturnAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'return_reason', 'created_at']
    list_filter = ['status', 'return_reason', 'created_at']
    search_fields = ['order__id', 'return_reason']

@admin.register(AddressVerification)
class AddressVerificationAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'method', 'verified_at']
    list_filter = ['status', 'method']

@admin.register(CODPincode)
class CODPincodeAdmin(admin.ModelAdmin):
    list_display = ['pincode', 'city', 'state', 'is_active']
    search_fields = ['pincode', 'city']
    list_filter = ['is_active', 'state']

@admin.register(GiftOption)
class GiftOptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active']

@admin.register(OrderGift)
class OrderGiftAdmin(admin.ModelAdmin):
    list_display = ['order', 'gift_option', 'from_name', 'to_name']
