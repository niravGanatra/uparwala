from django.contrib import admin
from .models import (
    HeroBanner, PromotionalBanner, FeaturedCategory, 
    DealOfTheDay, HostingEssential, PremiumSection, CategoryPromotion
)


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'subtitle', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'subtitle']
    list_editable = ['is_active', 'priority']
    ordering = ['-priority', '-created_at']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle')
        }),
        ('Design', {
            'fields': ('background_color', 'background_image')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(PromotionalBanner)
class PromotionalBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'discount_text', 'position', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'position', 'created_at']
    search_fields = ['title', 'discount_text']
    list_editable = ['is_active', 'priority']
    ordering = ['-priority', '-created_at']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'discount_text', 'link_url')
        }),
        ('Design', {
            'fields': ('background_color', 'background_image', 'position')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(FeaturedCategory)
class FeaturedCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    list_editable = ['is_active', 'priority']
    ordering = ['priority', 'name']
    
    fieldsets = (
        ('Content', {
            'fields': ('name', 'link_url')
        }),
        ('Design', {
            'fields': ('icon', 'image')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(DealOfTheDay)
class DealOfTheDayAdmin(admin.ModelAdmin):
    list_display = ['product', 'discount_percentage', 'start_date', 'end_date', 'is_active', 'priority']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['product__name']
    list_editable = ['is_active', 'priority']
    ordering = ['-priority', '-created_at']
    autocomplete_fields = ['product']
    
    fieldsets = (
        ('Product', {
            'fields': ('product', 'discount_percentage')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(HostingEssential)
class HostingEssentialAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    list_editable = ['is_active', 'priority']
    ordering = ['priority', 'name']
    
    fieldsets = (
        ('Content', {
            'fields': ('name', 'link_url')
        }),
        ('Design', {
            'fields': ('image', 'emoji')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(PremiumSection)
class PremiumSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'subtitle', 'position', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'position', 'created_at']
    search_fields = ['title', 'subtitle']
    list_editable = ['is_active', 'priority']
    ordering = ['-priority', '-created_at']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle', 'link_url')
        }),
        ('Design', {
            'fields': ('background_color', 'background_image', 'icon', 'position')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )


@admin.register(CategoryPromotion)
class CategoryPromotionAdmin(admin.ModelAdmin):
    list_display = ['name', 'discount_text', 'is_active', 'priority', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'discount_text']
    list_editable = ['is_active', 'priority']
    ordering = ['priority', 'name']
    
    fieldsets = (
        ('Content', {
            'fields': ('name', 'discount_text', 'link_url')
        }),
        ('Design', {
            'fields': ('background_color', 'background_image')
        }),
        ('Settings', {
            'fields': ('is_active', 'priority')
        }),
    )
