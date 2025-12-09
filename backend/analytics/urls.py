from django.urls import path
from .views import (
    vendor_sales_metrics,
    vendor_top_products,
    vendor_revenue_chart,
    vendor_order_stats,
    admin_platform_metrics,
    admin_top_sellers,
    admin_category_growth
)

urlpatterns = [
    # Vendor Analytics
    path('vendor/sales/', vendor_sales_metrics, name='vendor-sales'),
    path('vendor/top-products/', vendor_top_products, name='vendor-top-products'),
    path('vendor/revenue-chart/', vendor_revenue_chart, name='vendor-revenue-chart'),
    path('vendor/order-stats/', vendor_order_stats, name='vendor-order-stats'),
    
    # Admin Analytics
    path('admin/platform-metrics/', admin_platform_metrics, name='admin-platform-metrics'),
    path('admin/top-sellers/', admin_top_sellers, name='admin-top-sellers'),
    path('admin/category-growth/', admin_category_growth, name='admin-category-growth'),
]
