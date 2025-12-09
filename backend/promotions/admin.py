from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'min_order_value', 
                    'times_used', 'usage_limit', 'valid_from', 'valid_to', 'is_active']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_to']
    search_fields = ['code', 'description']
    list_editable = ['is_active']
    filter_horizontal = ['applicable_categories', 'applicable_products']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'description', 'discount_type', 'discount_value')
        }),
        ('Conditions', {
            'fields': ('min_order_value', 'max_discount')
        }),
        ('Usage Limits', {
            'fields': ('usage_limit', 'usage_per_user', 'times_used')
        }),
        ('Validity', {
            'fields': ('valid_from', 'valid_to', 'is_active')
        }),
        ('Restrictions (Optional)', {
            'fields': ('applicable_categories', 'applicable_products'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['times_used', 'created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # New object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ['coupon', 'user', 'order', 'discount_amount', 'used_at']
    list_filter = ['used_at', 'coupon']
    search_fields = ['user__username', 'user__email', 'coupon__code']
    readonly_fields = ['coupon', 'user', 'order', 'discount_amount', 'used_at']
    
    def has_add_permission(self, request):
        return False  # Usage is tracked automatically
    
    def has_change_permission(self, request, obj=None):
        return False
