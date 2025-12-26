from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from .google_auth import GoogleLoginView  <-- REMOVED: Using the one in views.py
from .views import RegisterView, UserDetailView, user_profile, GoogleLoginView, ConvertGuestView
from .admin_views import (
    AdminUserStatsView,
    AdminProductStatsView,
    AdminOrderStatsView,
    AdminUserListView,
    AdminUserDetailView,
    VendorApplicationListView,
    VendorApprovalView,
    VendorRejectionView,
)
from .vendor_application import VendorApplicationView, VendorStatusView
from .auth_views import CustomLoginView
from .address_views import (
    AddressListCreateView,
    AddressDetailView,
    SetDefaultAddressView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login-simple/', CustomLoginView.as_view(), name='custom-login'),  # Simple token-based login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('profile/', user_profile, name='user-profile'),
    path('google/login/', GoogleLoginView.as_view(), name='google-login'),
    path('convert-guest/', ConvertGuestView.as_view(), name='convert-guest'),
    
    # Vendor application
    path('vendor/apply/', VendorApplicationView.as_view(), name='vendor-apply'),
    path('vendor/status/', VendorStatusView.as_view(), name='vendor-status'),
    
    # Admin URLs - Stats endpoints for dashboard
    path('admin/stats/users/', AdminUserStatsView.as_view(), name='admin-user-stats'),
    path('admin/stats/products/', AdminProductStatsView.as_view(), name='admin-product-stats'),
    path('admin/stats/orders/', AdminOrderStatsView.as_view(), name='admin-order-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    
    # Admin vendor management
    path('admin/vendor-applications/', VendorApplicationListView.as_view(), name='vendor-applications'),
    path('admin/vendor-applications/<int:pk>/approve/', VendorApprovalView.as_view(), name='approve-vendor'),
    path('admin/vendor-applications/<int:pk>/reject/', VendorRejectionView.as_view(), name='reject-vendor'),

    # Customer Addresses
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='address-detail'),
    path('addresses/<int:pk>/set-default/', SetDefaultAddressView.as_view(), name='set-default-address'),
]
