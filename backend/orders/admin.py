from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')

admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order, OrderAdmin)
