from django.urls import path
from .phase45_views import (
    verify_address,
    get_verification_status,
    check_cod_availability,
    list_gift_options,
    add_gift_to_order,
    get_order_gift
)

urlpatterns = [
    # Address Verification
    path('orders/<int:order_id>/verify-address/', verify_address, name='verify-address'),
    path('orders/<int:order_id>/verification-status/', get_verification_status, name='verification-status'),
    
    # COD Pincode
    path('check-cod/', check_cod_availability, name='check-cod'),
    
    # Gift Wrapping
    path('gift-options/', list_gift_options, name='gift-options'),
    path('orders/<int:order_id>/add-gift/', add_gift_to_order, name='add-gift'),
    path('orders/<int:order_id>/gift/', get_order_gift, name='order-gift'),
]
