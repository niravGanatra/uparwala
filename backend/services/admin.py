from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import Service, PanditProfile, KYCDocument, ServiceBooking, BookingReview


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'base_price', 'duration_minutes', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


class KYCDocumentInline(admin.TabularInline):
    model = KYCDocument
    extra = 0
    readonly_fields = ['uploaded_at', 'document_preview']
    fields = ['document_type', 'document_name', 'document_file', 'document_preview', 'is_verified', 'admin_notes']
    
    def document_preview(self, obj):
        if obj.document_file:
            url = obj.document_file.url
            return format_html('<a href="{}" target="_blank">View Document</a>', url)
        return "-"
    document_preview.short_description = "Preview"


@admin.register(PanditProfile)
class PanditProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'verification_status', 'is_online', 
        'years_experience', 'average_rating', 'total_bookings_completed', 'created_at'
    ]
    list_filter = ['verification_status', 'is_online', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['average_rating', 'total_reviews', 'total_bookings_completed', 'created_at', 'updated_at']
    inlines = [KYCDocumentInline]
    filter_horizontal = ['specializations']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'profile_photo', 'bio')
        }),
        ('Professional Details', {
            'fields': ('years_experience', 'languages_spoken', 'specializations')
        }),
        ('Verification', {
            'fields': ('verification_status', 'verification_notes', 'verified_at'),
            'classes': ('collapse',)
        }),
        ('Availability & Location', {
            'fields': ('is_online', 'latitude', 'longitude', 'serviceable_pincodes')
        }),
        ('Statistics', {
            'fields': ('average_rating', 'total_reviews', 'total_bookings_completed'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_pandits', 'reject_pandits']
    
    @admin.action(description="Approve selected Pandits (mark as Verified)")
    def approve_pandits(self, request, queryset):
        updated = queryset.update(
            verification_status='verified',
            verified_at=timezone.now()
        )
        # Also verify all their KYC documents
        for pandit in queryset:
            pandit.kyc_documents.update(is_verified=True, verified_at=timezone.now())
        self.message_user(request, f"{updated} Pandit(s) approved successfully.")
    
    @admin.action(description="Reject selected Pandits")
    def reject_pandits(self, request, queryset):
        updated = queryset.update(
            verification_status='rejected',
            is_online=False  # Force offline
        )
        self.message_user(request, f"{updated} Pandit(s) rejected.")


@admin.register(KYCDocument)
class KYCDocumentAdmin(admin.ModelAdmin):
    list_display = ['pandit', 'document_type', 'is_verified', 'uploaded_at']
    list_filter = ['document_type', 'is_verified', 'uploaded_at']
    search_fields = ['pandit__user__username', 'pandit__user__email']
    readonly_fields = ['uploaded_at', 'document_preview']
    
    actions = ['approve_documents', 'reject_documents']
    
    def document_preview(self, obj):
        if obj.document_file:
            url = obj.document_file.url
            return format_html('<a href="{}" target="_blank">View Document</a>', url)
        return "-"
    document_preview.short_description = "Preview"
    
    @admin.action(description="Approve selected KYC documents")
    def approve_documents(self, request, queryset):
        updated = queryset.update(is_verified=True, verified_at=timezone.now())
        self.message_user(request, f"{updated} document(s) approved.")
    
    @admin.action(description="Reject selected KYC documents")
    def reject_documents(self, request, queryset):
        updated = queryset.update(is_verified=False)
        self.message_user(request, f"{updated} document(s) rejected.")


@admin.register(ServiceBooking)
class ServiceBookingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer', 'pandit', 'service', 
        'booking_date', 'status', 'payment_status', 'total_amount', 'created_at'
    ]
    list_filter = ['status', 'payment_status', 'booking_date', 'created_at']
    search_fields = [
        'customer__username', 'customer__email',
        'pandit__user__username', 'pandit__user__email',
        'service__name', 'pincode'
    ]
    readonly_fields = [
        'otp_start', 'otp_end', 'created_at', 'updated_at',
        'accepted_at', 'started_travel_at', 'arrived_at',
        'service_started_at', 'completed_at', 'cancelled_at'
    ]
    date_hierarchy = 'booking_date'
    
    fieldsets = (
        ('Booking Parties', {
            'fields': ('customer', 'pandit', 'service')
        }),
        ('Booking Details', {
            'fields': ('booking_date', 'booking_time', 'address', 'pincode', 'special_instructions')
        }),
        ('Status', {
            'fields': ('status', 'rejection_reason', 'cancellation_reason')
        }),
        ('OTP Verification', {
            'fields': ('otp_start', 'otp_end'),
            'classes': ('collapse',)
        }),
        ('Payment', {
            'fields': ('base_amount', 'convenience_fee', 'total_amount', 'payment_status', 'payment_id')
        }),
        ('Timestamps', {
            'fields': (
                'created_at', 'updated_at', 'accepted_at', 'started_travel_at',
                'arrived_at', 'service_started_at', 'completed_at', 'cancelled_at'
            ),
            'classes': ('collapse',)
        }),
    )


@admin.register(BookingReview)
class BookingReviewAdmin(admin.ModelAdmin):
    list_display = ['booking', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['booking__customer__username', 'booking__pandit__user__username']
    readonly_fields = ['created_at']
