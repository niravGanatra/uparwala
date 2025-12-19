from django.urls import path
from .shiprocket_views import (
    create_shipment,
    generate_awb,
    generate_label,
    schedule_pickup,
    get_tracking,
    get_tracking_history,
    shiprocket_webhook,
    get_all_shipments,
    check_product_serviceability
)

urlpatterns = [
    # Shipment operations (Admin only)
    path('<int:order_id>/create-shipment/', create_shipment, name='create-shipment'),
    path('<int:order_id>/generate-awb/', generate_awb, name='generate-awb'),
    path('<int:order_id>/generate-label/', generate_label, name='generate-label'),
    path('<int:order_id>/schedule-pickup/', schedule_pickup, name='schedule-pickup'),
    
    # Tracking (Customer & Admin)
    path('<int:order_id>/tracking/', get_tracking, name='get-tracking'),
    path('<int:order_id>/tracking-history/', get_tracking_history, name='tracking-history'),
    
    # Dashboard
    path('shipments/', get_all_shipments, name='get-all-shipments'),
    
    # Serviceability
    path('serviceability/', check_product_serviceability, name='check-serviceability'),
]

# Webhook URL (separate from orders)
webhook_urlpatterns = [
    path('shiprocket/', shiprocket_webhook, name='shiprocket-webhook'),
]
