from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .services import VendorAnalytics, AdminAnalytics


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_sales_metrics(request):
    """Get sales metrics for vendor"""
    vendor = request.user.vendor_profile
    period = request.query_params.get('period', 'month')
    
    metrics = VendorAnalytics.get_sales_metrics(vendor, period)
    return Response(metrics)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_top_products(request):
    """Get top products for vendor"""
    vendor = request.user.vendor_profile
    limit = int(request.query_params.get('limit', 10))
    
    products = VendorAnalytics.get_top_products(vendor, limit)
    return Response(products)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_revenue_chart(request):
    """Get revenue chart data for vendor"""
    vendor = request.user.vendor_profile
    period = request.query_params.get('period', 'month')
    
    data = VendorAnalytics.get_revenue_chart(vendor, period)
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_order_stats(request):
    """Get order status breakdown for vendor"""
    vendor = request.user.vendor_profile
    
    stats = VendorAnalytics.get_order_status_breakdown(vendor)
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_platform_metrics(request):
    """Get platform-wide metrics"""
    metrics = AdminAnalytics.get_platform_metrics()
    return Response(metrics)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_top_sellers(request):
    """Get top performing vendors"""
    limit = int(request.query_params.get('limit', 10))
    
    sellers = AdminAnalytics.get_top_sellers(limit)
    return Response(sellers)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_category_growth(request):
    """Get category growth data"""
    data = AdminAnalytics.get_category_growth()
    return Response(data)
