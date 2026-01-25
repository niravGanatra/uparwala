from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    PanditProfileViewSet,
    KYCDocumentViewSet,
    ServiceBookingViewSet,
    PanditAvailabilityView,
    PanditSearchView,
    BookingReviewCreateView,
    PanditDashboardView,
)

router = DefaultRouter()
router.register('services', ServiceViewSet, basename='services')
router.register('pandits', PanditProfileViewSet, basename='pandits')
router.register('kyc-documents', KYCDocumentViewSet, basename='kyc-documents')
router.register('bookings', ServiceBookingViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
    path('pandit/availability/', PanditAvailabilityView.as_view(), name='pandit-availability'),
    path('pandit/dashboard/', PanditDashboardView.as_view(), name='pandit-dashboard'),
    path('pandit/search/', PanditSearchView.as_view(), name='pandit-search'),
    path('reviews/', BookingReviewCreateView.as_view(), name='booking-review-create'),
]
