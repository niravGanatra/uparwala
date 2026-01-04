from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    CalculateTotalsView,
    ShippingZoneViewSet,
    TaxRateListView,
    PaymentWebhookView,
    ShippingSettingsView,
)

router = DefaultRouter()
router.register(r'shipping-zones', ShippingZoneViewSet, basename='shipping-zone')

urlpatterns = [
    path('', include(router.urls)),
    path('create-order/', CreatePaymentOrderView.as_view(), name='create-payment-order'),
    path('verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('calculate-totals/', CalculateTotalsView.as_view(), name='calculate-totals'),
    path('shipping-settings/', ShippingSettingsView.as_view(), name='shipping-settings'),
    path('tax-rates/', TaxRateListView.as_view(), name='tax-rates'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
]
