from django.db.models import Sum, Count, Avg, Q, F
from django.utils import timezone
from datetime import timedelta
from orders.models import Order, OrderItem
from products.models import Product


class VendorAnalytics:
    """Analytics for vendor dashboard"""
    
    @staticmethod
    def get_sales_metrics(vendor, period='month'):
        """Get sales metrics for a period"""
        now = timezone.now()
        
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=365)
        
        # Get orders for vendor's products
        orders = Order.objects.filter(
            items__product__vendor=vendor,
            created_at__gte=start_date,
            status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).distinct()
        
        total_revenue = orders.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        total_orders = orders.count()
        
        # Get items sold
        items_sold = OrderItem.objects.filter(
            order__in=orders,
            product__vendor=vendor
        ).aggregate(
            total=Sum('quantity')
        )['total'] or 0
        
        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        return {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'items_sold': items_sold,
            'avg_order_value': float(avg_order_value),
            'period': period
        }
    
    @staticmethod
    def get_top_products(vendor, limit=10):
        """Get best selling products"""
        products = Product.objects.filter(vendor=vendor).annotate(
            total_sold=Sum('orderitem__quantity', filter=Q(orderitem__order__status='DELIVERED')),
            total_revenue=Sum(F('orderitem__quantity') * F('orderitem__price'), filter=Q(orderitem__order__status='DELIVERED'))
        ).order_by('-total_sold')[:limit]
        
        return [{
            'id': p.id,
            'name': p.name,
            'total_sold': p.total_sold or 0,
            'total_revenue': float(p.total_revenue or 0),
            'price': float(p.price)
        } for p in products]
    
    @staticmethod
    def get_revenue_chart(vendor, period='month'):
        """Get revenue over time"""
        now = timezone.now()
        
        if period == 'week':
            days = 7
        elif period == 'month':
            days = 30
        else:
            days = 365
        
        start_date = now - timedelta(days=days)
        
        # Get daily revenue
        data = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            next_date = date + timedelta(days=1)
            
            revenue = Order.objects.filter(
                items__product__vendor=vendor,
                created_at__gte=date,
                created_at__lt=next_date,
                status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': float(revenue)
            })
        
        return data
    
    @staticmethod
    def get_order_status_breakdown(vendor):
        """Get order status distribution"""
        orders = Order.objects.filter(items__product__vendor=vendor).values('status').annotate(
            count=Count('id')
        )
        
        return [{
            'status': o['status'],
            'count': o['count']
        } for o in orders]


class AdminAnalytics:
    """Analytics for admin dashboard"""
    
    @staticmethod
    def get_platform_metrics():
        """Get overall platform metrics"""
        from users.models import User
        from vendors.models import VendorProfile
        
        total_revenue = Order.objects.filter(
            status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        total_orders = Order.objects.count()
        total_users = User.objects.count()
        total_vendors = VendorProfile.objects.filter(verification_status='verified').count()
        
        # Today's metrics
        today = timezone.now().replace(hour=0, minute=0, second=0)
        today_revenue = Order.objects.filter(
            created_at__gte=today,
            status__in=['PROCESSING', 'SHIPPED', 'DELIVERED']
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        today_orders = Order.objects.filter(created_at__gte=today).count()
        
        return {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'total_users': total_users,
            'total_vendors': total_vendors,
            'today_revenue': float(today_revenue),
            'today_orders': today_orders
        }
    
    @staticmethod
    def get_top_sellers(limit=10):
        """Get best performing vendors"""
        from vendors.models import VendorProfile
        
        vendors = VendorProfile.objects.annotate(
            total_revenue=Sum('products__orderitem__order__total_amount', 
                            filter=Q(products__orderitem__order__status='DELIVERED')),
            total_orders=Count('products__orderitem__order', 
                             filter=Q(products__orderitem__order__status='DELIVERED'), 
                             distinct=True)
        ).order_by('-total_revenue')[:limit]
        
        return [{
            'id': v.id,
            'store_name': v.store_name,
            'total_revenue': float(v.total_revenue or 0),
            'total_orders': v.total_orders or 0
        } for v in vendors]
    
    @staticmethod
    def get_category_growth():
        """Get category-wise growth"""
        from products.models import Category
        
        categories = Category.objects.annotate(
            total_products=Count('products'),
            total_sold=Sum('products__orderitem__quantity', 
                          filter=Q(products__orderitem__order__status='DELIVERED'))
        ).order_by('-total_sold')[:10]
        
        return [{
            'name': c.name,
            'total_products': c.total_products,
            'total_sold': c.total_sold or 0
        } for c in categories]
