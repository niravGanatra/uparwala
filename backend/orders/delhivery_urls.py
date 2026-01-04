"""
Delhivery API URL Configuration
"""
from django.urls import path
from . import delhivery_views

urlpatterns = [
    # Shipment operations
    path('shipment/<int:order_id>/create/', delhivery_views.create_delhivery_shipment, name='delhivery-create-shipment'),
    path('shipment/<int:order_id>/tracking/', delhivery_views.get_delhivery_tracking, name='delhivery-tracking'),
    path('shipment/<int:order_id>/label/', delhivery_views.get_delhivery_label, name='delhivery-label'),
    path('shipment/<int:order_id>/cancel/', delhivery_views.cancel_delhivery_shipment, name='delhivery-cancel'),
    
    # Vendor warehouse registration
    path('warehouse/<int:vendor_id>/register/', delhivery_views.register_vendor_warehouse, name='delhivery-register-warehouse'),
]
