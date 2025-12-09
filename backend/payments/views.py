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
        state_code = request.data.get('state_code')
        cart_id = request.data.get('cart_id')
        
        if not state_code:
            return Response({'error': 'State code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get cart items
            if cart_id:
                cart = Cart.objects.get(id=cart_id, user=request.user)
                cart_items = cart.items.all()
            else:
                cart = Cart.objects.filter(user=request.user).first()
                if not cart:
                    return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
                cart_items = cart.items.all()
            
            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate subtotal
            subtotal = Decimal('0')
            for item in cart_items:
                subtotal += item.product.price * item.quantity
            
            # Calculate shipping
            shipping_calc = ShippingCalculator()
            shipping_data = shipping_calc.calculate_shipping(cart_items, state_code, subtotal)
            shipping_cost = Decimal(str(shipping_data['total_shipping']))
            
            # Calculate tax
            tax_calc = TaxCalculator()
            tax_data = tax_calc.calculate_gst(subtotal, state_code)
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
            
            return Response({
                'subtotal': float(subtotal),
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


class ShippingZoneListView(generics.ListAPIView):
    """List all active shipping zones"""
    queryset = ShippingZone.objects.filter(is_active=True)
    serializer_class = ShippingZoneSerializer


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
