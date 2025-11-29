from django.urls import path
from . import views
from .payout_views import (
    PayoutRequestListView, PayoutRequestDetailView,
    ApprovePayoutView, RejectPayoutView, VendorPayoutStatsView
)

app_name = 'vendors'

urlpatterns = [
    # Vendor profile
    path('profile/', views.VendorProfileView.as_view(), name='vendor-profile'),
    path('applications/', views.VendorApplicationsView.as_view(), name='vendor-applications'),
    path('applications/<int:pk>/approve/', views.ApproveVendorView.as_view(), name='approve-vendor'),
    path('applications/<int:pk>/reject/', views.RejectVendorView.as_view(), name='reject-vendor'),
    path('admin/vendors/', views.VendorListView.as_view(), name='admin-vendor-list'),
    
    # Payout management (Admin)
    path('admin/payouts/', PayoutRequestListView.as_view(), name='admin-payout-list'),
    path('admin/payouts/<int:pk>/', PayoutRequestDetailView.as_view(), name='admin-payout-detail'),
    path('admin/payouts/<int:pk>/approve/', ApprovePayoutView.as_view(), name='admin-payout-approve'),
    path('admin/payouts/<int:pk>/reject/', RejectPayoutView.as_view(), name='admin-payout-reject'),
    path('admin/payouts/stats/', VendorPayoutStatsView.as_view(), name='admin-payout-stats'),
]
