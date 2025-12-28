from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from decimal import Decimal
import logging

from .models import Order, OrderItem, Cart
from users.models import Address
from payments.models import Payment
from payments.razorpay_gateway import RazorpayGateway
from payments.tax_calculator import TaxCalculator
from payments.shipping_calculator import ShippingCalculator

logger = logging.getLogger(__name__)


class CheckoutView(APIView):
    """Create order from cart and initiate payment - supports both logged-in and guest users"""
    permission_classes = [AllowAny]  # Allow guests to checkout
    
    @transaction.atomic
    def post(self, request):
        """
        Create order from cart
        
        Expected payload for logged-in users:
        {
            "shipping_address_id": 1,
            "billing_address_id": 1,
            "payment_method": "razorpay",
            "coupon_code": "SAVE10"
        }
        
        Expected payload for guests:
        {
            "guest_email": "guest@example.com",
            "guest_address": {
                "full_name": "John Doe",
                "phone": "9876543210",
                "address_line1": "123 Main St",
                "address_line2": "",
                "city": "Mumbai",
                "state": "Maharashtra",
                "state_code": "MH",
                "pincode": "400001"
            },
            "payment_method": "razorpay"
        }
        """
        user = request.user if request.user.is_authenticated else None
        payment_method = request.data.get('payment_method', 'razorpay')
        coupon_code = request.data.get('coupon_code')
        selected_item_ids = request.data.get('selected_item_ids', [])
        
        logger.info(f"Checkout - user: {user}, selected_item_ids: {selected_item_ids}")
        
        # Handle address based on user type
        if user:
            # Logged-in user: get address from database
            shipping_address_id = request.data.get('shipping_address_id')
            billing_address_id = request.data.get('billing_address_id', shipping_address_id)
            
            try:
                shipping_address = Address.objects.get(id=shipping_address_id, user=user)
                billing_address = Address.objects.get(id=billing_address_id, user=user)
                
                shipping_address_data = {
                    'full_name': shipping_address.full_name,
                    'phone': shipping_address.phone,
                    'address_line1': shipping_address.address_line1,
                    'address_line2': shipping_address.address_line2 or '',
                    'city': shipping_address.city,
                    'state': shipping_address.state,
                    'state_code': shipping_address.state_code or '',
                    'pincode': shipping_address.pincode,
                    'country': shipping_address.country,
                }
                billing_address_data = {
                    'full_name': billing_address.full_name,
                    'phone': billing_address.phone,
                    'address_line1': billing_address.address_line1,
                    'address_line2': billing_address.address_line2 or '',
                    'city': billing_address.city,
                    'state': billing_address.state,
                    'state_code': billing_address.state_code or '',
                    'pincode': billing_address.pincode,
                    'country': billing_address.country,
                }
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Invalid address'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get cart for logged-in user
            try:
                cart = Cart.objects.get(user=user)
            except Cart.DoesNotExist:
                return Response(
                    {'error': 'Cart not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            guest_email = None
            session_id = None
        else:
            # Guest user: get address from request payload
            guest_address = request.data.get('guest_address')
            guest_email = request.data.get('guest_email')
            
            if not guest_address:
                return Response(
                    {'error': 'Address is required for guest checkout'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not guest_email:
                return Response(
                    {'error': 'Email is required for guest checkout'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate required fields
            required_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode']
            for field in required_fields:
                if not guest_address.get(field):
                    return Response(
                        {'error': f'{field} is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            shipping_address_data = {
                'full_name': guest_address.get('full_name'),
                'phone': guest_address.get('phone'),
                'address_line1': guest_address.get('address_line1'),
                'address_line2': guest_address.get('address_line2', ''),
                'city': guest_address.get('city'),
                'state': guest_address.get('state'),
                'state_code': guest_address.get('state_code', ''),
                'pincode': guest_address.get('pincode'),
                'country': 'India',
            }
            billing_address_data = shipping_address_data.copy()
            
            # Get cart for guest user via session
            session_key = request.session.session_key
            if not session_key:
                return Response(
                    {'error': 'Session not found. Please add items to cart first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                cart = Cart.objects.get(session_id=session_key, user=None)
            except Cart.DoesNotExist:
                return Response(
                    {'error': 'Cart not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            session_id = session_key
        
        # Get cart items
        all_cart_items = cart.items.all()
        
        # Filter by selected items if provided (selective checkout)
        if selected_item_ids:
            logger.info(f"Filtering {all_cart_items.count()} cart items to selected: {selected_item_ids}")
            cart_items = all_cart_items.filter(id__in=selected_item_ids)
            logger.info(f"After filter: {cart_items.count()} items")
            if not cart_items.exists():
                return Response(
                    {'error': 'No valid items selected for checkout'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            logger.info("No selected_item_ids - using all cart items")
            cart_items = all_cart_items
        
        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate subtotal
        subtotal = Decimal('0')
        for item in cart_items:
            # Validate stock
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f'Insufficient stock for {item.product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            subtotal += item.product.price * item.quantity
        
        # Validate Pincode Serviceability for all items
        from .utils import is_pincode_servicable
        shipping_pincode = shipping_address_data['pincode']
        
        for item in cart_items:
            is_available, message = is_pincode_servicable(shipping_pincode, item.product.vendor)
            if not is_available:
                return Response(
                    {'error': f"Item '{item.product.name}' cannot be delivered to {shipping_pincode}. {message}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Calculate shipping
        shipping_calc = ShippingCalculator()
        state_code = shipping_address_data.get('state_code', '')
        shipping_data = shipping_calc.calculate_shipping(
            cart_items,
            state_code,
            subtotal
        )
        shipping_cost = Decimal(str(shipping_data['total_shipping']))
        
        # Calculate tax using product-level tax slabs
        tax_calc = TaxCalculator()
        tax_data = tax_calc.calculate_gst_with_slabs(cart_items, state_code)
        tax_amount = Decimal(str(tax_data['total_tax']))
        
        # Apply coupon (TODO: implement coupon logic)
        discount_amount = Decimal('0')
        
        # Validate and get Gift Option if provided
        gift_option_id = request.data.get('gift_option_id')
        gift_message = request.data.get('gift_message', '')
        recipient_name = request.data.get('recipient_name', '')
        gift_option = None
        gift_amount = Decimal('0')
        
        if gift_option_id:
            from .models import GiftOption, OrderGift
            try:
                gift_option = GiftOption.objects.get(id=gift_option_id, is_active=True)
                gift_amount = gift_option.price
            except GiftOption.DoesNotExist:
                pass

        # Calculate total
        total_amount = subtotal + shipping_cost + tax_amount - discount_amount + gift_amount
        
        # Create order
        order = Order.objects.create(
            user=user,  # None for guests
            guest_email=guest_email or '',
            session_id=session_id or '',
            status='PENDING',
            payment_status='pending',
            payment_method=payment_method,
            
            # Amounts
            subtotal=float(subtotal),
            tax_amount=float(tax_amount),
            shipping_amount=float(shipping_cost),
            discount_amount=float(discount_amount),
            total_amount=float(total_amount),
            
            # Addresses (store as JSON for historical record)
            shipping_address_data=shipping_address_data,
            billing_address_data=billing_address_data,
            
            # Tax breakdown
            tax_breakdown=tax_data,
            
            # Customer Note
            customer_note=request.data.get('customer_note', '')
        )
        
        # Create Order Gift Record if selected
        if gift_option:
            from .models import OrderGift
            OrderGift.objects.create(
                order=order,
                gift_option=gift_option,
                gift_message=gift_message,
                recipient_name=recipient_name
            )
        
        # Create order items and reduce stock
        for item in cart_items:
            # Find corresponding tax breakdown for this item
            item_tax = next((t for t in tax_data['items'] if t['product_id'] == item.product.id), {})
            
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                quantity=item.quantity,
                price=item.product.price,
                # Tax details
                tax_rate=item_tax.get('tax_rate', 0),
                tax_amount=item_tax.get('tax_amount', 0),
                cgst_amount=item_tax.get('cgst_amount', 0),
                sgst_amount=item_tax.get('sgst_amount', 0),
                igst_amount=item_tax.get('igst_amount', 0),
            )
            
            # NOTE: Stock reduction moved to payment verification
            # Stock should only be reduced when payment is confirmed
        
        # NOTE: For Razorpay, we do NOT clear cart here. 
        # We clear it only after successful payment in VerifyPaymentView.
        if payment_method == 'cod':
            cart_items.delete()
        
        # Create payment based on method
        if payment_method == 'razorpay':
            # Create Razorpay order
            gateway = RazorpayGateway()
            notes = {'order_id': order.id}
            if user:
                notes['user_id'] = user.id
            else:
                notes['guest_email'] = guest_email
                
            result = gateway.create_order(
                amount=total_amount,
                receipt=f'order_{order.id}',
                notes=notes
            )
            
            if not result['success']:
                # Rollback will happen automatically due to transaction.atomic
                return Response(
                    {'error': 'Failed to create payment order'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create payment record
            payment = Payment.objects.create(
                order=order,
                razorpay_order_id=result['order_id'],
                amount=total_amount,
                status='pending',
                payment_method='razorpay'
            )
            
            return Response({
                'order_id': order.id,
                'order_number': f'ORD-{order.id:06d}',
                'total_amount': float(total_amount),
                'is_guest': user is None,
                'payment': {
                    'razorpay_order_id': result['order_id'],
                    'razorpay_key_id': gateway.client.auth[0],  # Key ID
                    'amount': result['amount'],
                    'currency': result['currency']
                }
            }, status=status.HTTP_201_CREATED)
        
        elif payment_method == 'cod':
            # Cash on Delivery - no payment gateway needed
            order.payment_status = 'cod'
            order.save()
            
            # For COD, reduce stock immediately (accepted business risk)
            for order_item in order.items.all():
                product = order_item.product
                product.stock -= order_item.quantity
                if product.stock < 0:
                    product.stock = 0
                product.save()
            
            # Send Order Confirmation Email (COD)
            try:
                from notifications.resend_service import send_email_via_resend
                from notifications.email_templates import get_email_template
                
                customer_email = order.guest_email if not order.user else order.user.email
                customer_name = order.billing_address_data.get('full_name') if order.billing_address_data else (order.user.get_full_name() if order.user else 'Guest')
                
                if customer_email:
                    conf_context = {
                        'customer_name': customer_name,
                        'order_id': order.id,
                        'total_amount': order.total_amount
                    }
                    conf_template = get_email_template('order_confirmation', conf_context)
                    if conf_template:
                        send_email_via_resend(customer_email, conf_template['subject'], conf_template['content'])
            except Exception as e:
                logger.error(f"Failed to send COD order confirmation for Order {order.id}: {e}")
            
            return Response({
                'order_id': order.id,
                'order_number': f'ORD-{order.id:06d}',
                'total_amount': float(total_amount),
                'is_guest': user is None,
                'message': 'Order placed successfully. Pay on delivery.'
            }, status=status.HTTP_201_CREATED)
        
        else:
            return Response(
                {'error': 'Invalid payment method'},
                status=status.HTTP_400_BAD_REQUEST
            )
