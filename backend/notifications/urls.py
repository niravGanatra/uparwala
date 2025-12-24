from django.urls import path
from .views import TestEmailView, TestWhatsAppView

urlpatterns = [
    path('test-email/', TestEmailView.as_view(), name='test-email'),
    path('test-whatsapp/', TestWhatsAppView.as_view(), name='test-whatsapp'),
]
