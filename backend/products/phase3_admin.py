from django.contrib import admin
from .models import Brand
from .phase3_models import ProductVideo, ProductComparison, ProductBundle


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'featured', 'created_at']
    list_filter = ['is_active', 'featured', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'logo', 'description', 'website')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'featured')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


class ProductVideoInline(admin.TabularInline):
    model = ProductVideo
    extra = 0
    fields = ['title', 'video_file', 'video_url', 'thumbnail', 'order']


@admin.register(ProductVideo)
class ProductVideoAdmin(admin.ModelAdmin):
    list_display = ['product', 'title', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__name', 'title']
    ordering = ['product', 'order']


@admin.register(ProductComparison)
class ProductComparisonAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_key', 'product_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'session_key']
    filter_horizontal = ['products']
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(ProductBundle)
class ProductBundleAdmin(admin.ModelAdmin):
    list_display = ['primary_product', 'discount_type', 'discount_value', 'is_active', 'created_at']
    list_filter = ['is_active', 'discount_type', 'created_at']
    search_fields = ['primary_product__name']
    filter_horizontal = ['bundled_products']
    
    fieldsets = (
        ('Bundle Configuration', {
            'fields': ('primary_product', 'bundled_products')
        }),
        ('Discount', {
            'fields': ('discount_type', 'discount_value')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
