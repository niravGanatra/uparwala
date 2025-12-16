from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from decimal import Decimal

from .models import Payment, ShippingZone, TaxRate
from .serializers import (
    PaymentSerializer, CreatePaymentOrderSerializer, VerifyPaymentSerializer,
    ShippingZoneSerializer, TaxRateSerializer
)
from .razorpay_gateway import RazorpayGateway
from .tax_calculator import TaxCalculator
from .shipping_calculator import ShippingCalculator
from orders.models import Order, Cart
from django.conf import settings


class CreatePaymentOrderView(APIView):
    """Create Razorpay order for payment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CreatePaymentOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        order_id = serializer.validated_data['order_id']
        amount = serializer.validated_data['amount']
        
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create Razorpay order
        gateway = RazorpayGateway()
        result = gateway.create_order(
            amount=amount,
            receipt=f'order_{order.id}',
            notes={'order_id': order.id, 'user_id': request.user.id}
        )
        
        if not result['success']:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create payment record
        payment = Payment.objects.create(
            order=order,
            razorpay_order_id=result['order_id'],
            amount=amount,
            status='pending',
            payment_method='razorpay'
        )
        
        return Response({
            'razorpay_order_id': result['order_id'],
            'amount': result['amount'],
            'currency': result['currency'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'payment_id': payment.id
        })


class VerifyPaymentView(APIView):
    """Verify Razorpay payment signature"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']
        order_id = serializer.validated_data['order_id']
        
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id, order=order)
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response({'error': 'Order or payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Verify signature
        gateway = RazorpayGateway()
        is_valid = gateway.verify_payment_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )
        
        if is_valid:
            # Update payment status
            payment.payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'completed'
            payment.save()
            
            # Update order status
            order.payment_status = 'paid'
            order.status = 'PROCESSING'
            order.save()
            
            # Reduce stock NOW that payment is confirmed
            for order_item in order.items.all():
                product = order_item.product
                product.stock -= order_item.quantity
                if product.stock < 0:
                    product.stock = 0  # Prevent negative stock
                product.save()
            
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'order_id': order.id,
                'payment_id': payment.id
            })
        else:
            payment.status = 'failed'
            payment.error_message = 'Invalid payment signature'
            payment.save()
            
            return Response({
                'success': False,
                'error': 'Payment verification failed'
            }, status=status.HTTP_400_BAD_REQUEST)


class CalculateTotalsView(APIView):
    """Calculate order totals including tax and shipping"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Debug logging
        print(f"DEBUG: Calculate totals request data: {request.data}")
        
        user = request.user
        state_code = request.data.get('state_code')
        cart_id = request.data.get('cart_id')
        gift_option_id = request.data.get('gift_option_id')
        selected_item_ids = request.data.get('selected_item_ids', [])  # For selective checkout
        
        print(f"DEBUG: state_code = '{state_code}', cart_id = '{cart_id}'")
        
        if not state_code:
            print(f"DEBUG: State code validation failed - state_code is: '{state_code}'")
            return Response(
                {'error': 'State code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cart = Cart.objects.get(user=user)
            all_cart_items = cart.items.all()
            
            # Filter by selected items if provided (selective checkout)
            if selected_item_ids:
                cart_items = all_cart_items.filter(id__in=selected_item_ids)
            else:
                cart_items = all_cart_items

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
        discount_total = Decimal('0')
        from orders.services import PriceCalculatorService

        for item in cart_items:
            price_info = PriceCalculatorService.calculate_price(item.product)
            # Ensure we work with Decimals
            final_price = Decimal(str(price_info['price']))
            quantity = Decimal(str(item.quantity))
            
            subtotal += final_price * quantity
            discount_total += Decimal(str(price_info['discount_amount'])) * quantity
        
        # Calculate shipping
        shipping_calc = ShippingCalculator()
        shipping_data = shipping_calc.calculate_shipping(cart_items, state_code, subtotal)
        shipping_cost = Decimal(str(shipping_data['total_shipping']))
        
        # Ensure shipping data values are floats for JSON
        shipping_data['base_rate'] = float(shipping_data['base_rate'])
        shipping_data['weight_charge'] = float(shipping_data['weight_charge'])
        shipping_data['total_shipping'] = float(shipping_data['total_shipping'])

        # Calculate tax using product-level tax slabs
        tax_calc = TaxCalculator()
        tax_data = tax_calc.calculate_gst_with_slabs(cart_items, state_code)
        tax_amount = Decimal(str(tax_data['total_tax']))  # Convert float back to Decimal for calculation
        
        # Calculate delivery estimate
        delivery_estimate = shipping_calc.estimate_delivery_date(state_code)
        
        # Handle Gift Wrapping
        gift_option_id = request.data.get('gift_option_id')
        gift_wrapping_amount = Decimal('0')
        if gift_option_id:
            from orders.models import GiftOption
            try:
                gift_option = GiftOption.objects.get(id=gift_option_id, is_active=True)
                gift_wrapping_amount = gift_option.price
            except GiftOption.DoesNotExist:
                pass
 
        # Calculate total
        total = subtotal + shipping_cost + tax_amount + gift_wrapping_amount
        
        try:
            return Response({
                'subtotal': float(subtotal),
                'discount_total': float(discount_total),
                'shipping': shipping_data,
                'tax': tax_data,
                'tax_amount': float(tax_amount),
                'gift_wrapping_amount': float(gift_wrapping_amount),
                'total': float(total),
                'delivery_estimate': delivery_estimate,
                'items_count': cart_items.count()
            })
        except Exception as e:
            import traceback
            print(f"Calculate totals error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework import viewsets, permissions

class ShippingZoneViewSet(viewsets.ModelViewSet):
    """
    CRUD for Shipping Zones (Admin Only for modifications)
    """
    queryset = ShippingZone.objects.all()
    serializer_class = ShippingZoneSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class TaxRateListView(generics.ListAPIView):
    """List all tax rates"""
    queryset = TaxRate.objects.all()
    serializer_class = TaxRateSerializer


class PaymentWebhookView(APIView):
    """Handle Razorpay webhooks"""
    permission_classes = []  # No authentication for webhooks
    
    def post(self, request):
        # TODO: Verify webhook signature
        # TODO: Handle different webhook events (payment.captured, payment.failed, etc.)
        
        event = request.data.get('event')
        payload = request.data.get('payload', {})
        
        if event == 'payment.captured':
            payment_entity = payload.get('payment', {}).get('entity', {})
            payment_id = payment_entity.get('id')
            
            try:
                payment = Payment.objects.get(payment_id=payment_id)
                payment.status = 'completed'
                payment.save()
                
                # Update order
                order = payment.order
                order.payment_status = 'paid'
                order.status = 'PROCESSING'
                order.save()
                
            except Payment.DoesNotExist:
                pass
        
        elif event == 'payment.failed':
            payment_entity = payload.get('payment', {}).get('entity', {})
            payment_id = payment_entity.get('id')
            
            try:
                payment = Payment.objects.get(payment_id=payment_id)
                payment.status = 'failed'
                payment.error_message = payment_entity.get('error_description', 'Payment failed')
                payment.save()
            except Payment.DoesNotExist:
                pass
        
        return Response({'status': 'ok'})
