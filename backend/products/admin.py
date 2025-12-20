
from django.contrib import admin
from .models import (Category, Product, ProductImage, ProductAttribute, Variation, ProductDownload,
                      ProductQuestion, ProductAnswer, RecentlyViewed, ProductReview, ReviewHelpful, Wishlist,
                      GlobalAttribute, AttributeTerm, TaxSlab)

# Import Phase 3 admin
from .phase3_admin import BrandAdmin, ProductVideoAdmin, ProductVideoInline, ProductComparisonAdmin, ProductBundleAdmin

@admin.register(TaxSlab)
class TaxSlabAdmin(admin.ModelAdmin):
    list_display = ('name', 'rate', 'cgst_rate', 'sgst_rate', 'igst_rate', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute
    extra = 1

class VariationInline(admin.TabularInline):
    model = Variation
    extra = 1

class ProductDownloadInline(admin.TabularInline):
    model = ProductDownload
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'vendor', 'category', 'regular_price', 'sale_price', 'stock', 'stock_status', 'featured', 'is_returnable', 'is_exchangeable', 'is_active']
    list_filter = ['category', 'featured', 'is_active', 'stock_status', 'virtual', 'downloadable', 'is_returnable', 'is_exchangeable']
    search_fields = ['name', 'sku', 'vendor__store_name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductAttributeInline, VariationInline, ProductDownloadInline]
    readonly_fields = ['average_rating', 'review_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('vendor', 'category', 'brand', 'name', 'slug', 'description', 'short_description')
        }),
        ('Product Data', {
            'fields': ('sku', 'featured', 'virtual', 'downloadable')
        }),
        ('Pricing', {
            'fields': ('regular_price', 'sale_price', 'sale_price_start', 'sale_price_end', 'tax_status', 'tax_class')
        }),
        ('Inventory', {
            'fields': ('manage_stock', 'stock', 'stock_status', 'backorders', 'low_stock_threshold')
        }),
        ('Shipping', {
            'fields': ('weight', 'length', 'width', 'height', 'shipping_class')
        }),
        ('Downloads', {
            'fields': ('download_limit', 'download_expiry'),
            'classes': ('collapse',)
        }),
        ('Visibility & Reviews', {
            'fields': ('catalog_visibility', 'enable_reviews', 'average_rating', 'review_count', 'purchase_note')
        }),
        ('Returns & Exchanges', {
            'fields': ('is_returnable', 'is_exchangeable')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_primary', 'alt_text']
    list_filter = ['is_primary']
    search_fields = ['product__name', 'alt_text']

@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'value', 'is_variation']
    list_filter = ['is_variation']
    search_fields = ['product__name', 'name', 'value']

@admin.register(Variation)
class VariationAdmin(admin.ModelAdmin):
    list_display = ['product', 'sku', 'regular_price', 'sale_price', 'stock', 'is_active']
    list_filter = ['is_active', 'manage_stock']
    search_fields = ['product__name', 'sku']

@admin.register(ProductDownload)
class ProductDownloadAdmin(admin.ModelAdmin):
    list_display = ['product', 'name']
    search_fields = ['product__name', 'name']

class AttributeTermInline(admin.TabularInline):
    model = AttributeTerm
    extra = 1

@admin.register(GlobalAttribute)
class GlobalAttributeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [AttributeTermInline]

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating', 'created_at']
    search_fields = ['product__name', 'user__username', 'title']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ReviewHelpful)
class ReviewHelpfulAdmin(admin.ModelAdmin):
    list_display = ['review', 'user', 'is_helpful']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']

@admin.register(ProductQuestion)
class ProductQuestionAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'question', 'is_approved', 'created_at']
    list_filter = ['is_approved']
    search_fields = ['product__name', 'question']

@admin.register(ProductAnswer)
class ProductAnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'user', 'answer', 'is_approved']

@admin.register(RecentlyViewed)
class RecentlyViewedAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['user__username', 'product__name']
