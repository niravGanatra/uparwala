from django.contrib import admin
from .models import (
    Cart, CartItem, Order, OrderItem, OrderReturn,
    AddressVerification, CODPincode, GiftOption, OrderGift
)

# Import admin modules
from . import shiprocket_admin
from . import package_admin
from . import phase45_admin

class OrderItemInline(admin.TabularInline):
    model = OrderItem

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('id', 'user', 'total_amount', 'status', 'awb_code', 'courier_name', 'created_at')

admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
