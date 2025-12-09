"""
Utility functions for calculating vendor payouts based on delivered orders
"""
from decimal import Decimal
from django.db.models import Sum, Q, F
from django.utils import timezone
from orders.models import OrderItem, Order
from products.models import Category


def calculate_pending_payouts():
    """
    Calculate pending payouts for all vendors based on delivered orders
    that haven't been paid out yet.
    
    Returns:
        list: List of dicts containing vendor payout information
    """
    # Get all delivered order items that haven't been paid to vendor
    unpaid_items = OrderItem.objects.filter(
        order__status='DELIVERED',
        paid_to_vendor=False
    ).select_related('vendor', 'product', 'product__category', 'order')
    
    # Group by vendor
    vendor_payouts = {}
    
    for item in unpaid_items:
        vendor_id = item.vendor.id
        
        if vendor_id not in vendor_payouts:
            vendor_payouts[vendor_id] = {
                'vendor_id': vendor_id,
                'vendor_name': item.vendor.store_name,
                'vendor_email': item.vendor.user.email if item.vendor.user else 'N/A',
                'total_sales': Decimal('0'),
                'total_commission': Decimal('0'),
                'net_payout': Decimal('0'),
                'order_items': [],
                'category_breakdown': {}
            }
        
        # Calculate item total
        item_total = item.price * item.quantity
        
        # Get commission rate from product category
        commission_rate = Decimal('0')
        if item.product.category:
            commission_rate = item.product.category.commission_rate or Decimal('0')
        
        # Calculate commission for this item
        commission = (item_total * commission_rate) / Decimal('100')
        payout = item_total - commission
        
        # Add to vendor totals
        vendor_payouts[vendor_id]['total_sales'] += item_total
        vendor_payouts[vendor_id]['total_commission'] += commission
        vendor_payouts[vendor_id]['net_payout'] += payout
        
        # Track category breakdown
        category_name = item.product.category.name if item.product.category else 'Uncategorized'
        if category_name not in vendor_payouts[vendor_id]['category_breakdown']:
            vendor_payouts[vendor_id]['category_breakdown'][category_name] = {
                'sales': Decimal('0'),
                'commission': Decimal('0'),
                'commission_rate': float(commission_rate)
            }
        
        vendor_payouts[vendor_id]['category_breakdown'][category_name]['sales'] += item_total
        vendor_payouts[vendor_id]['category_breakdown'][category_name]['commission'] += commission
        
        # Add item details
        vendor_payouts[vendor_id]['order_items'].append({
            'order_id': item.order.id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'price': float(item.price),
            'total': float(item_total),
            'commission': float(commission),
            'payout': float(payout),
            'order_date': item.order.created_at.isoformat() if item.order.created_at else None
        })
    
    # Convert to list and format decimals as floats for JSON serialization
    result = []
    for vendor_data in vendor_payouts.values():
        vendor_data['total_sales'] = float(vendor_data['total_sales'])
        vendor_data['total_commission'] = float(vendor_data['total_commission'])
        vendor_data['net_payout'] = float(vendor_data['net_payout'])
        
        # Format category breakdown
        for category in vendor_data['category_breakdown'].values():
            category['sales'] = float(category['sales'])
            category['commission'] = float(category['commission'])
        
        result.append(vendor_data)
    
    # Sort by net payout descending
    result.sort(key=lambda x: x['net_payout'], reverse=True)
    
    return result


def trigger_payout(vendor_id, admin_user, transaction_id='', notes=''):
    """
    Trigger payout for a specific vendor - marks all unpaid delivered items as paid
    
    Args:
        vendor_id: ID of the vendor to pay out
        admin_user: User object of the admin triggering the payout
        transaction_id: Optional transaction reference ID
        notes: Optional admin notes
        
    Returns:
        dict: Payout summary with total amount paid
    """
    from vendors.models import PayoutRequest
    
    # Get all unpaid delivered items for this vendor
    unpaid_items = OrderItem.objects.filter(
        vendor_id=vendor_id,
        order__status='DELIVERED',
        paid_to_vendor=False
    ).select_related('product', 'product__category')
    
    if not unpaid_items.exists():
        raise ValueError('No unpaid items found for this vendor')
    
    total_sales = Decimal('0')
    total_commission = Decimal('0')
    payout_date = timezone.now()
    
    # Process each item
    for item in unpaid_items:
        item_total = item.price * item.quantity
        
        # Get commission rate
        commission_rate = Decimal('0')
        if item.product.category:
            commission_rate = item.product.category.commission_rate or Decimal('0')
        
        commission = (item_total * commission_rate) / Decimal('100')
        payout = item_total - commission
        
        # Update item
        item.paid_to_vendor = True
        item.payout_date = payout_date
        item.payout_amount = payout
        item.commission_amount = commission
        item.save()
        
        total_sales += item_total
        total_commission += commission
    
    net_payout = total_sales - total_commission
    
    # Create payout request record
    payout_request = PayoutRequest.objects.create(
        vendor_id=vendor_id,
        requested_amount=net_payout,
        status='approved',
        requested_at=payout_date,
        approved_at=payout_date,
        approved_by=admin_user,
        transaction_id=transaction_id,
        admin_notes=notes
    )
    
    return {
        'payout_id': payout_request.id,
        'vendor_id': vendor_id,
        'total_sales': float(total_sales),
        'total_commission': float(total_commission),
        'net_payout': float(net_payout),
        'items_count': unpaid_items.count(),
        'payout_date': payout_date.isoformat()
    }


def get_payout_history(vendor_id=None, limit=50):
    """
    Get payout history
    
    Args:
        vendor_id: Optional vendor ID to filter by
        limit: Maximum number of records to return
        
    Returns:
        list: List of payout records
    """
    from vendors.models import PayoutRequest
    
    queryset = PayoutRequest.objects.filter(
        status='approved'
    ).select_related('vendor', 'vendor__user')
    
    if vendor_id:
        queryset = queryset.filter(vendor_id=vendor_id)
    
    queryset = queryset.order_by('-approved_at')[:limit]
    
    result = []
    for payout in queryset:
        result.append({
            'id': payout.id,
            'vendor_id': payout.vendor.id,
            'vendor_name': payout.vendor.store_name,
            'vendor_email': payout.vendor.user.email if payout.vendor.user else 'N/A',
            'amount': float(payout.requested_amount),
            'payout_date': payout.approved_at.isoformat() if payout.approved_at else None,
            'transaction_id': payout.transaction_id or '',
            'approved_by': 'Admin',  # PayoutRequest model doesn't have approved_by field
            'notes': payout.admin_notes or ''
        })
    
    return result
