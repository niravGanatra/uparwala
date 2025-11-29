from django.urls import path
from .views import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    CalculateTotalsView,
    ShippingZoneListView,
    TaxRateListView,
    PaymentWebhookView,
)

urlpatterns = [
    path('create-order/', CreatePaymentOrderView.as_view(), name='create-payment-order'),
    path('verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('calculate-totals/', CalculateTotalsView.as_view(), name='calculate-totals'),
    path('shipping-zones/', ShippingZoneListView.as_view(), name='shipping-zones'),
    path('tax-rates/', TaxRateListView.as_view(), name='tax-rates'),
    path('webhook/', PaymentWebhookView.as_view(), name='payment-webhook'),
]
