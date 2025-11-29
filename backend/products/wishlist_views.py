from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Wishlist, Product
from .serializers import ProductSerializer


class WishlistView(generics.ListAPIView):
    """List all wishlist items for the authenticated user"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        wishlist_items = Wishlist.objects.filter(user=self.request.user).select_related('product')
        return [item.product for item in wishlist_items]


class WishlistAddRemoveView(APIView):
    """Add or remove product from wishlist"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        """Add product to wishlist"""
        product = get_object_or_404(Product, id=product_id)
        
        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )
        
        if created:
            return Response({
                'message': 'Product added to wishlist',
                'in_wishlist': True
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Product already in wishlist',
                'in_wishlist': True
            })
    
    def delete(self, request, product_id):
        """Remove product from wishlist"""
        try:
            wishlist_item = Wishlist.objects.get(
                user=request.user,
                product_id=product_id
            )
            wishlist_item.delete()
            return Response({
                'message': 'Product removed from wishlist',
                'in_wishlist': False
            })
        except Wishlist.DoesNotExist:
            return Response({
                'message': 'Product not in wishlist',
                'in_wishlist': False
            }, status=status.HTTP_404_NOT_FOUND)


class WishlistCheckView(APIView):
    """Check if product is in user's wishlist"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, product_id):
        in_wishlist = Wishlist.objects.filter(
            user=request.user,
            product_id=product_id
        ).exists()
        
        return Response({'in_wishlist': in_wishlist})


class WishlistMoveToCartView(APIView):
    """Move wishlist item to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, product_id):
        from orders.models import Cart, CartItem
        
        # Get or create cart
        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # Get product
        product = get_object_or_404(Product, id=product_id)
        
        # Add to cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        
        if not created:
            cart_item.quantity += 1
            cart_item.save()
        
        # Remove from wishlist
        Wishlist.objects.filter(
            user=request.user,
            product_id=product_id
        ).delete()
        
        return Response({
            'message': 'Product moved to cart',
            'cart_item_id': cart_item.id
        })
