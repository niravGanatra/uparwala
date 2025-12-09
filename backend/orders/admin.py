from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

# Import Shiprocket admin
from .shiprocket_admin import ShiprocketConfigAdmin, ShipmentTrackingAdmin, OrderTrackingStatusAdmin

class OrderItemInline(admin.TabularInline):
    model = OrderItem

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('id', 'user', 'total_amount', 'status', 'awb_code', 'courier_name', 'created_at')

admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
