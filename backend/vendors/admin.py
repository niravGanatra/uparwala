from django.contrib import admin
from .models import (
    VendorProfile, Wallet, Withdrawal, Transaction,
    StoreReview, StoreFollower, VendorCoupon, VendorAnnouncement
)

@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'user', 'verification_status', 'verified_badge', 'average_rating', 'created_at']
    list_filter = ['verification_status', 'verified_badge', 'vacation_mode']
    search_fields = ['store_name', 'user__username', 'user__email']
    readonly_fields = ['average_rating', 'review_count', 'created_at', 'updated_at']

@admin.register(StoreReview)
class StoreReviewAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'customer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['vendor__store_name', 'customer__username']

@admin.register(StoreFollower)
class StoreFollowerAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'customer', 'created_at']
    search_fields = ['vendor__store_name', 'customer__username']

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'balance', 'pending_balance', 'total_earned', 'total_withdrawn']
    readonly_fields = ['updated_at']
    search_fields = ['vendor__store_name']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['wallet', 'transaction_type', 'amount', 'description', 'balance_after', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['wallet__vendor__store_name', 'description', 'reference_id']
    readonly_fields = ['created_at']

@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'amount', 'status', 'payment_method', 'requested_at', 'processed_at']
    list_filter = ['status', 'payment_method', 'requested_at']
    search_fields = ['vendor__store_name', 'transaction_id']
    readonly_fields = ['requested_at']

@admin.register(VendorCoupon)
class VendorCouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'vendor', 'discount_type', 'discount_value', 'is_active', 'usage_count', 'start_date', 'end_date']
    list_filter = ['discount_type', 'is_active', 'start_date']
    search_fields = ['code', 'vendor__store_name']

@admin.register(VendorAnnouncement)
class VendorAnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'vendor', 'is_active', 'start_date', 'end_date', 'created_at']
    list_filter = ['is_active', 'start_date']
    search_fields = ['title', 'vendor__store_name']
