from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Avg, Count, Min, Max
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer


class ProductSearchView(generics.ListAPIView):
    """Advanced product search with filters and sorting"""
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        
        # Search query
        search_query = self.request.query_params.get('q', '')
        if search_query:
            # PostgreSQL full-text search
            search_vector = SearchVector('name', 'description', 'short_description')
            search_query_obj = SearchQuery(search_query)
            queryset = queryset.annotate(
                search=search_vector,
                rank=SearchRank(search_vector, search_query_obj)
            ).filter(search=search_query_obj).order_by('-rank')
        
        # Category filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Rating filter
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(avg_rating__gte=min_rating)
        
        # Stock status filter
        in_stock_only = self.request.query_params.get('in_stock')
        if in_stock_only == 'true':
            queryset = queryset.filter(stock_status='instock')
        
        # Featured products
        featured_only = self.request.query_params.get('featured')
        if featured_only == 'true':
            queryset = queryset.filter(featured=True)
        
        # Vendor filter
        vendor_id = self.request.query_params.get('vendor')
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        
        # Sorting
        sort_by = self.request.query_params.get('sort', '-created_at')
        if sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).order_by('-avg_rating')
        elif sort_by == 'popularity':
            queryset = queryset.annotate(
                review_count=Count('reviews')
            ).order_by('-review_count')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        else:
            queryset = queryset.order_by(sort_by)
        
        return queryset


class ProductAutocompleteView(APIView):
    """Autocomplete suggestions for product search"""
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if len(query) < 2:
            return Response([])
        
        # Search in product names
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(short_description__icontains=query),
            is_active=True
        )[:10]
        
        suggestions = []
        for product in products:
            suggestions.append({
                'id': product.id,
                'name': product.name,
                'slug': product.slug,
                'price': float(product.price),
                'image': product.image.url if product.image else None
            })
        
        return Response(suggestions)


class FilterOptionsView(APIView):
    """Get available filter options (categories, price range, etc.)"""
    
    def get(self, request):
        # Get all categories
        categories = Category.objects.all()
        category_data = CategorySerializer(categories, many=True).data
        
        # Get price range
        price_stats = Product.objects.filter(is_active=True).aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        # Get available vendors
        vendors = Product.objects.filter(is_active=True).values(
            'vendor__id', 'vendor__business_name'
        ).distinct()
        
        return Response({
            'categories': category_data,
            'price_range': {
                'min': float(price_stats['min_price'] or 0),
                'max': float(price_stats['max_price'] or 0)
            },
            'vendors': list(vendors),
            'ratings': [1, 2, 3, 4, 5]
        })
