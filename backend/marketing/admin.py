from django.contrib import admin
from .models import Campaign, UTMTracking


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'utm_source', 'utm_medium', 'utm_campaign', 'clicks', 'conversions', 'revenue', 'is_active']
    list_filter = ['is_active', 'utm_source', 'utm_medium', 'start_date', 'end_date']
    search_fields = ['name', 'utm_campaign']
    readonly_fields = ['clicks', 'conversions', 'revenue', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Campaign Info', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('UTM Parameters', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign')
        }),
        ('Campaign Details', {
            'fields': ('start_date', 'end_date', 'budget')
        }),
        ('Performance Metrics', {
            'fields': ('clicks', 'conversions', 'revenue'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UTMTracking)
class UTMTrackingAdmin(admin.ModelAdmin):
    list_display = ['utm_source', 'utm_medium', 'utm_campaign', 'user', 'converted', 'conversion_value', 'created_at']
    list_filter = ['converted', 'utm_source', 'utm_medium', 'created_at']
    search_fields = ['utm_campaign', 'user__username', 'session_key']
    readonly_fields = ['created_at', 'converted_at']
    
    fieldsets = (
        ('UTM Parameters', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content')
        }),
        ('Tracking Info', {
            'fields': ('user', 'session_key', 'referrer', 'landing_page')
        }),
        ('Attribution', {
            'fields': ('campaign', 'order', 'converted', 'conversion_value', 'converted_at')
        }),
    )
