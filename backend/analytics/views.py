from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import AnalyticsEvent
from orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()

class TrackEventView(views.APIView):
    """
    Endpoint to receive analytics events from frontend.
    POST /analytics/events/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            event_type = data.get('event_type')
            session_id = data.get('session_id')
            
            if not event_type or not session_id:
                return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)

            # Create event
            event = AnalyticsEvent.objects.create(
                user=request.user if request.user.is_authenticated else None,
                session_id=session_id,
                event_type=event_type,
                data=data.get('data', {}),
                url=data.get('url', '')[:500],
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Helper: If IP address extraction needed
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                event.ip_address = x_forwarded_for.split(',')[0]
                event.save(update_fields=['ip_address'])
            else:
                event.ip_address = request.META.get('REMOTE_ADDR')
                event.save(update_fields=['ip_address'])

            return Response({'status': 'success', 'id': event.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DashboardMetricsView(views.APIView):
    """
    Endpoint to serve aggregated analytics metrics for the Admin Dashboard.
    GET /analytics/dashboard/
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        # Time range filter (default 30 days)
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # --- data fetching ---
        orders = Order.objects.filter(created_at__gte=start_date).exclude(status='CANCELLED')
        events = AnalyticsEvent.objects.filter(timestamp__gte=start_date)
        
        # A. Sales & Finance
        total_orders = orders.count()
        gmv = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        avg_order_value = gmv / total_orders if total_orders > 0 else 0
        
        # Net Revenue (GMV - Returns)
        returned_orders_val = orders.filter(status='RETURNED').aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
        # Also could subtract discounts if not already handled
        net_revenue = gmv - returned_orders_val
        
        return_rate = (orders.filter(status='RETURNED').count() / total_orders * 100) if total_orders > 0 else 0

        # B. User Funnel
        # Unique sessions
        total_sessions = events.filter(event_type='session_start').count() or 1 # Avoid div by zero
        # Add to cart sessions
        cart_sessions_qs = events.filter(event_type='add_to_cart').values('session_id').distinct()
        cart_sessions_count = cart_sessions_qs.count()
        
        # Purchases (using Orders as proxy for purchase sessions)
        purchase_count = total_orders 
        
        conversion_rate = (purchase_count / total_sessions * 100) if total_sessions > 0 else 0
        add_to_cart_rate = (cart_sessions_count / total_sessions * 100) if total_sessions > 0 else 0
        
        # Cart Abandonment: (1 - Purchases/Carts) * 100
        cart_abandonment = 0
        if cart_sessions_count > 0:
            cart_abandonment = (1 - (purchase_count / cart_sessions_count)) * 100
            if cart_abandonment < 0: cart_abandonment = 0 # Safety if data sync issues

        # C. Customer Health
        # Repeat Customer Rate
        # Users with > 1 order in this period (or lifetime? Usually lifetime for the rate, but period for activity)
        # Let's do Period Repeat Rate for now
        repeat_customers = orders.values('user').annotate(count=Count('id')).filter(count__gt=1).count()
        total_unique_customers = orders.values('user').distinct().count() or 1
        repeat_rate = (repeat_customers / total_unique_customers * 100)
        
        # D. Technical
        # Avg Page Load
        # We assume 'page_view' events have data={'load_time': ms}
        # SQLite JSON field querying is tricky, usually handled by Application logic if DB doesn't support JSON ops well
        # But Django can do it if using Postgres. Assuming Postgres or iterating.
        # For compatibility with SQLite/Postgres generic JSON, let's fetch valid load times
        # Ideally, use database aggregation. For MVP/SQLite:
        
        # To make it robust:
        # avg_load_time = events.filter(event_type='page_view').aggregate(Avg('data__load_time')) # This fails on SQLite usually
        
        # Simple python aggregation for MVP stability
        page_views = events.filter(event_type='page_view')[:1000] # Sample
        load_times = [e.data.get('load_time') for e in page_views if e.data.get('load_time')]
        avg_load_time = sum(load_times) / len(load_times) if load_times else 0
        
        # Zero Results
        searches = events.filter(event_type='search')
        top_searches = [] # TODO extract
        zero_result_searches = 0
        for s in searches:
            if s.data.get('results_count', 1) == 0:
                zero_result_searches += 1
        
        zero_result_rate = (zero_result_searches / searches.count() * 100) if searches.exists() else 0
        
        # Recent Errors
        errors = events.filter(event_type='error').order_by('-timestamp')[:5]
        recent_errors = [{'code': e.data.get('code'), 'url': e.url, 'time': e.timestamp} for e in errors]

        data = {
            'sales': {
                'gmv': gmv,
                'aov': avg_order_value,
                'net_revenue': net_revenue,
                'return_rate': round(return_rate, 2),
                'total_orders': total_orders
            },
            'funnel': {
                'conversion_rate': round(conversion_rate, 2),
                'cart_abandonment': round(cart_abandonment, 2),
                'add_to_cart_rate': round(add_to_cart_rate, 2),
                'total_sessions': total_sessions
            },
            'customer': {
                'repeat_rate': round(repeat_rate, 2),
                'total_customers': total_unique_customers
            },
            'technical': {
                'avg_load_time_ms': round(avg_load_time, 2),
                'zero_result_rate': round(zero_result_rate, 2),
                'recent_errors': recent_errors
            }
        }
        
        return Response(data)
