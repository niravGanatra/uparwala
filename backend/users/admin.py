from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address, CareerApplication

admin.site.register(User, UserAdmin)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_type', 'full_name', 'city', 'state', 'is_default']
    list_filter = ['address_type', 'is_default', 'state']
    search_fields = ['user__username', 'full_name', 'city', 'pincode']

@admin.register(CareerApplication)
class CareerApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'created_at', 'resume']
    list_filter = ['created_at']
    search_fields = ['full_name', 'email', 'phone']
    readonly_fields = ['created_at']
