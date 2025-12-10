from django.urls import path, include
from . import views
from .views import (
    CartDetailView, AddToCartView, RemoveFromCartView, 
    OrderListCreateView, OrderDetailView, AdminOrderListView,
    OrderNoteViewSet, ShiprocketConfigViewSet
)
from .checkout_views import CheckoutView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'notes', OrderNoteViewSet, basename='order-note')
router.register(r'shiprocket-config', ShiprocketConfigViewSet, basename='shiprocket-config')

urlpatterns = [
    path('manage/', include(router.urls)), # /api/orders/manage/notes/
    
    # Existing URLs
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/items/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    
    # COD and Gift Options
    path('check-cod/', views.check_cod_availability, name='check-cod'),
    path('gift-options/', views.list_gift_options, name='gift-options'),
    
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    
    # Shiprocket endpoints
    path('', include('orders.shiprocket_urls')),
    
    # Package and cancellation endpoints
    path('', include('orders.package_urls')),
]
