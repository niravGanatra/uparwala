from django.urls import path
from .views import CartDetailView, AddToCartView, RemoveFromCartView, OrderListCreateView, OrderDetailView, AdminOrderListView
from .checkout_views import CheckoutView

urlpatterns = [
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/items/<int:item_id>/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
]
