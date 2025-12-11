from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address

admin.site.register(User, UserAdmin)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'address_type', 'full_name', 'city', 'state', 'is_default']
    list_filter = ['address_type', 'is_default', 'state']
    search_fields = ['user__username', 'full_name', 'city', 'pincode']
