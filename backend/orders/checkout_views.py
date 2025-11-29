from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem, Cart
from users.models import Address
from payments.models import Payment
from payments.razorpay_gateway import RazorpayGateway
from payments.tax_calculator import TaxCalculator
from payments.shipping_calculator import ShippingCalculator


class CheckoutView(APIView):
    """Create order from cart and initiate payment"""
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        """
        Create order from cart
        
        Expected payload:
        {
            "shipping_address_id": 1,
            "billing_address_id": 1,  # optional, defaults to shipping
            "payment_method": "razorpay",  # or "cod"
            "coupon_code": "SAVE10"  # optional
        }
        """
        user = request.user
        shipping_address_id = request.data.get('shipping_address_id')
        billing_address_id = request.data.get('billing_address_id', shipping_address_id)
        payment_method = request.data.get('payment_method', 'razorpay')
        coupon_code = request.data.get('coupon_code')
        
        # Validate addresses
        try:
            shipping_address = Address.objects.get(id=shipping_address_id, user=user)
            billing_address = Address.objects.get(id=billing_address_id, user=user)
        except Address.DoesNotExist:
            return Response(
                {'error': 'Invalid address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get cart
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.all()
            
            if not cart_items.exists():
                return Response(
                    {'error': 'Cart is empty'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'},
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
        
        # Calculate shipping
        shipping_calc = ShippingCalculator()
        shipping_data = shipping_calc.calculate_shipping(
            cart_items,
            shipping_address.state_code,
            subtotal
        )
        shipping_cost = Decimal(str(shipping_data['total_shipping']))
        
        # Calculate tax
        tax_calc = TaxCalculator()
        tax_data = tax_calc.calculate_gst(subtotal, shipping_address.state_code)
        tax_amount = tax_data['total_tax']
        
        # Apply coupon (TODO: implement coupon logic)
        discount_amount = Decimal('0')
        
        # Calculate total
        total_amount = subtotal + shipping_cost + tax_amount - discount_amount
        
        # Create order
        order = Order.objects.create(
            user=user,
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
            shipping_address_data={
                'full_name': shipping_address.full_name,
                'phone': shipping_address.phone,
                'address_line1': shipping_address.address_line1,
                'address_line2': shipping_address.address_line2,
                'city': shipping_address.city,
                'state': shipping_address.state,
                'state_code': shipping_address.state_code,
                'pincode': shipping_address.pincode,
                'country': shipping_address.country,
            },
            billing_address_data={
                'full_name': billing_address.full_name,
                'phone': billing_address.phone,
                'address_line1': billing_address.address_line1,
                'address_line2': billing_address.address_line2,
                'city': billing_address.city,
                'state': billing_address.state,
                'state_code': billing_address.state_code,
                'pincode': billing_address.pincode,
                'country': billing_address.country,
            },
            
            # Tax breakdown
            tax_breakdown=tax_data
        )
        
        # Create order items and reduce stock
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                quantity=item.quantity,
                price=item.product.price
            )
            
            # Reduce stock
            item.product.stock -= item.quantity
            item.product.save()
        
        # Clear cart
        cart_items.delete()
        
        # Create payment based on method
        if payment_method == 'razorpay':
            # Create Razorpay order
            gateway = RazorpayGateway()
            result = gateway.create_order(
                amount=total_amount,
                receipt=f'order_{order.id}',
                notes={'order_id': order.id, 'user_id': user.id}
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
            
            return Response({
                'order_id': order.id,
                'order_number': f'ORD-{order.id:06d}',
                'total_amount': float(total_amount),
                'message': 'Order placed successfully. Pay on delivery.'
            }, status=status.HTTP_201_CREATED)
        
        else:
            return Response(
                {'error': 'Invalid payment method'},
                status=status.HTTP_400_BAD_REQUEST
            )
