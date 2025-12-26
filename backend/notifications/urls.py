from django.urls import path
from .views import TestEmailView, TestWhatsAppView
from .test_views import TestEmailView as TestEmailConfigView

urlpatterns = [
    path('test-email/', TestEmailView.as_view(), name='test-email'),
    path('test-email-config/', TestEmailConfigView.as_view(), name='test-email-config'),
    path('test-whatsapp/', TestWhatsAppView.as_view(), name='test-whatsapp'),
]
