from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Brand, Product
from .phase3_models import ProductVideo, ProductComparison, ProductBundle
from .phase3_serializers import (
    BrandSerializer, ProductVideoSerializer, ProductComparisonSerializer,
    ProductBundleSerializer, ComparisonDetailSerializer
)


# Brand Views
class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for brands"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Get all products for a brand"""
        brand = self.get_object()
        products = brand.products.filter(is_active=True)
        
        from .serializers import ProductSerializer
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


# Product Comparison Views
@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_comparison(request):
    """Add product to comparison"""
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Get or create comparison
    if request.user.is_authenticated:
        comparison, created = ProductComparison.objects.get_or_create(user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        comparison, created = ProductComparison.objects.get_or_create(session_key=session_key)
    
    # Check if already in comparison
    if comparison.products.filter(id=product_id).exists():
        return Response({'message': 'Product already in comparison'}, status=status.HTTP_200_OK)
    
    # Limit to 4 products
    if comparison.products.count() >= 4:
        return Response({'error': 'Maximum 4 products can be compared'}, status=status.HTTP_400_BAD_REQUEST)
    
    comparison.products.add(product)
    
    serializer = ProductComparisonSerializer(comparison)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_comparison(request, product_id):
    """Remove product from comparison"""
    # Get comparison
    if request.user.is_authenticated:
        comparison = ProductComparison.objects.filter(user=request.user).first()
    else:
        session_key = request.session.session_key
        if not session_key:
            return Response({'error': 'No comparison found'}, status=status.HTTP_404_NOT_FOUND)
        comparison = ProductComparison.objects.filter(session_key=session_key).first()
    
    if not comparison:
        return Response({'error': 'No comparison found'}, status=status.HTTP_404_NOT_FOUND)
    
    product = get_object_or_404(Product, id=product_id)
    comparison.products.remove(product)
    
    # Delete comparison if empty
    if comparison.products.count() == 0:
        comparison.delete()
        return Response({'message': 'Comparison cleared'}, status=status.HTTP_200_OK)
    
    serializer = ProductComparisonSerializer(comparison)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_comparison(request):
    """Get current comparison list"""
    # Get comparison
    if request.user.is_authenticated:
        comparison = ProductComparison.objects.filter(user=request.user).first()
    else:
        session_key = request.session.session_key
        if not session_key:
            return Response({'products': []})
        comparison = ProductComparison.objects.filter(session_key=session_key).first()
    
    if not comparison:
        return Response({'products': []})
    
    serializer = ProductComparisonSerializer(comparison)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_comparison_details(request):
    """Get full comparison data with product details"""
    # Get comparison
    if request.user.is_authenticated:
        comparison = ProductComparison.objects.filter(user=request.user).first()
    else:
        session_key = request.session.session_key
        if not session_key:
            return Response({'products': []})
        comparison = ProductComparison.objects.filter(session_key=session_key).first()
    
    if not comparison:
        return Response({'products': []})
    
    serializer = ComparisonDetailSerializer(comparison, context={'request': request})
    return Response(serializer.data)


# Product Bundle Views
@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_bundles(request, product_id):
    """Get bundles for a product"""
    product = get_object_or_404(Product, id=product_id, is_active=True)
    bundles = ProductBundle.objects.filter(primary_product=product, is_active=True)
    
    serializer = ProductBundleSerializer(bundles, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_bundle_to_cart(request):
    """Add entire bundle to cart"""
    bundle_id = request.data.get('bundle_id')
    
    if not bundle_id:
        return Response({'error': 'bundle_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    bundle = get_object_or_404(ProductBundle, id=bundle_id, is_active=True)
    
    # Add primary product and all bundled products to cart
    from orders.models import Cart, CartItem
    
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    # Add primary product
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=bundle.primary_product,
        defaults={'quantity': 1}
    )
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    # Add bundled products
    for product in bundle.bundled_products.all():
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        if not created:
            cart_item.quantity += 1
            cart_item.save()
    
    return Response({
        'message': 'Bundle added to cart',
        'products_added': 1 + bundle.bundled_products.count()
    }, status=status.HTTP_201_CREATED)
