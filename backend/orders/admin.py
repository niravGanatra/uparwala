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
