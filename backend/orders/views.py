from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer
from products.models import Product

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.AllowAny] # Allow guests

    def get_object(self):
        user = self.request.user
        if user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=user)
        else:
            # Create session if not exists
            if not self.request.session.session_key:
                self.request.session.create()
            session_key = self.request.session.session_key
            cart, created = Cart.objects.get_or_create(session_id=session_key, user=None)
        return cart

class AddToCartView(APIView):
    permission_classes = [permissions.AllowAny] # Allow guests

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        
        user = request.user
        if user.is_authenticated:
             cart, created = Cart.objects.get_or_create(user=user)
        else:
             if not request.session.session_key:
                 request.session.create()
             session_key = request.session.session_key
             cart, created = Cart.objects.get_or_create(session_id=session_key, user=None)

        product = get_object_or_404(Product, id=product_id)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        cart_item.save()

        return Response({'status': 'Item added to cart'}, status=status.HTTP_200_OK)

class RemoveFromCartView(APIView):
    permission_classes = [permissions.AllowAny] # Allow guests

    def delete(self, request, item_id):
        # Identify cart for permission check
        user = request.user
        if user.is_authenticated:
            cart = get_object_or_404(Cart, user=user)
        else:
            if not request.session.session_key:
                 return Response({'error': 'No session'}, status=status.HTTP_400_BAD_REQUEST)
            cart = get_object_or_404(Cart, session_id=request.session.session_key)

        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        return Response({'status': 'Item removed from cart'}, status=status.HTTP_200_OK)

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from .services import PriceCalculatorService

        # Create order container
        order = Order.objects.create(
            user=request.user,
            total_amount=0,
            subtotal=0,
            discount_amount=0
        )

        total_amount = 0
        total_subtotal = 0
        total_discount = 0

        # Create order items using Calculated Price
        for item in cart.items.all():
            price_info = PriceCalculatorService.calculate_price(item.product)
            final_price = price_info['price']
            
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                quantity=item.quantity,
                price=final_price # Store the discounted price as the transaction price
            )
            
            line_total = final_price * item.quantity
            line_subtotal = price_info['original_price'] * item.quantity
            line_discount = price_info['discount_amount'] * item.quantity

            total_amount += line_total
            total_subtotal += line_subtotal
            total_discount += line_discount
        
        # Update order totals
        order.subtotal = total_subtotal
        order.discount_amount = total_discount
        order.total_amount = total_amount
        order.save()
        
        # Clear cart
        cart.items.all().delete()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow admins to access all orders, regular users only their own
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)

class AdminOrderListView(generics.ListAPIView):
    """
    Admin view to list all orders in the system
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        # Return all orders for admin users
        queryset = Order.objects.all().order_by('-created_at')
        
        # Filter by status if provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

from rest_framework import viewsets
from .models import OrderNote
from .serializers import OrderNoteSerializer

class OrderNoteViewSet(viewsets.ModelViewSet):
    """CRUD for Order Notes"""
    queryset = OrderNote.objects.all()
    serializer_class = OrderNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        order = serializer.validated_data['order']
        user = self.request.user
        
        # Security check: User must own the order OR be admin OR be the vendor involved
        is_owner = order.user == user
        # Check if user is a vendor and has items in this order
        is_vendor = False
        if hasattr(user, 'vendor_profile'):
            is_vendor = order.items.filter(vendor=user.vendor_profile).exists()
            
        if not (user.is_staff or is_owner or is_vendor):
             raise PermissionDenied("You do not have permission to add notes to this order.")
             
        # If customer adds note, it must be visible to them? logic says 'is_customer_note' usually means FROM admin TO customer.
        # If customer writes, it is implied visible? Or should strictly be 'customer_note' field on Order?
        # Requirement said: "Private Notes (internal) and Customer Notes (visible to buyer)".
        # And "Vendor can... add a private note."
        
        # Enforce that Vendors can only make PRIVATE notes? Or public tracking notes?
        # For now, fix IDOR - Access Control.
        
        serializer.save(author=user)

    def get_queryset(self):
        # Admins see all notes, Customers see only visible notes for their orders
        user = self.request.user
        if user.is_staff:
            return OrderNote.objects.all()
        return OrderNote.objects.filter(order__user=user, is_customer_note=True)
        return OrderNote.objects.filter(order__user=user, is_customer_note=True)

from .shiprocket_models import ShiprocketConfig
from .shiprocket_serializers import ShiprocketConfigSerializer

class ShiprocketConfigViewSet(viewsets.ModelViewSet):
    """Manage Shiprocket Credentials (Admin Only)"""
    queryset = ShiprocketConfig.objects.all()
    serializer_class = ShiprocketConfigSerializer
    permission_classes = [permissions.IsAdminUser]

    def list(self, request, *args, **kwargs):
        # Always return the first config or empty
        queryset = self.get_queryset()
        if queryset.exists():
            serializer = self.get_serializer(queryset.first())
            return Response(serializer.data)
        return Response({}) # Return empty object if not configured

    def create(self, request, *args, **kwargs):
        # If exists, update instead of create
        queryset = self.get_queryset()
        if queryset.exists():
            instance = queryset.first()
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return super().create(request, *args, **kwargs)


# COD and Gift Wrapping Views (formerly in phase45_views)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import CODPincode, GiftOption


@api_view(['GET'])
@permission_classes([AllowAny])
def check_cod_availability(request):
    """Check if COD is available for a pincode"""
    pincode = request.query_params.get('pincode')
    order_value = float(request.query_params.get('order_value', 0))
    
    if not pincode:
        return Response({'available': False, 'message': 'Pincode required'}, status=400)
    
    try:
        cod_pincode = CODPincode.objects.get(pincode=pincode, is_active=True)
        is_available = cod_pincode.is_cod_available(order_value)
        
        return Response({
            'available': is_available,
            'pincode': pincode,
            'city': cod_pincode.city,
            'state': cod_pincode.state,
            'max_order_value': cod_pincode.max_order_value,
            'message': 'COD available' if is_available else 'COD not available for this order value'
        })
    except CODPincode.DoesNotExist:
        return Response({
            'available': False,
            'pincode': pincode,
            'message': 'COD not available for this pincode'
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def list_gift_options(request):
    """List all active gift wrapping options"""
    from .serializers import GiftOptionSerializer
    gift_options = GiftOption.objects.filter(is_active=True)
    serializer = GiftOptionSerializer(gift_options, many=True)
    return Response(serializer.data)
