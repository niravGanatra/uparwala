from django.urls import path
from . import views
from .payout_views import (
    PayoutRequestListView, PayoutRequestDetailView,
    ApprovePayoutView, RejectPayoutView, VendorPayoutStatsView,
    CalculatePendingPayoutsView, TriggerPayoutView, PayoutHistoryView
)

app_name = 'vendors'

urlpatterns = [
    # Vendor profile
    path('profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    
    # Vendor approvals (Admin)
    path('pending/', views.pending_vendors_list, name='pending-vendors'),
    path('<int:vendor_id>/approve/', views.approve_vendor, name='approve-vendor'),
    path('<int:vendor_id>/reject/', views.reject_vendor, name='reject-vendor'),
    path('stats/', views.vendor_stats, name='vendor-stats'),
    path('applications/', views.VendorApplicationsView.as_view(), name='vendor-applications'),
    path('applications/<int:pk>/approve/', views.ApproveVendorView.as_view(), name='approve-vendor-old'),
    path('applications/<int:pk>/reject/', views.RejectVendorView.as_view(), name='reject-vendor-old'),
    path('admin/vendors/', views.VendorListView.as_view(), name='admin-vendor-list'),
    
    # Payout management (Admin)
    path('admin/payouts/', PayoutRequestListView.as_view(), name='admin-payout-list'),
    path('admin/payouts/<int:pk>/', PayoutRequestDetailView.as_view(), name='admin-payout-detail'),
    path('admin/payouts/<int:pk>/approve/', ApprovePayoutView.as_view(), name='admin-payout-approve'),
    path('admin/payouts/<int:pk>/reject/', RejectPayoutView.as_view(), name='admin-payout-reject'),
    path('admin/payouts/stats/', VendorPayoutStatsView.as_view(), name='admin-payout-stats'),
    
    # New payout endpoints
    path('admin/payouts/calculate/', CalculatePendingPayoutsView.as_view(), name='calculate-pending-payouts'),
    path('admin/payouts/trigger/<int:vendor_id>/', TriggerPayoutView.as_view(), name='trigger-payout'),
    path('admin/payouts/trigger/<int:vendor_id>/', TriggerPayoutView.as_view(), name='trigger-payout'),
    path('admin/payouts/history/', PayoutHistoryView.as_view(), name='payout-history'),
    
    # Vendor Personal Wallet
    path('wallet/stats/', views.VendorWalletStatsView.as_view(), name='vendor-wallet-stats'),
]
