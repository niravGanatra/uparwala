from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Product
from .serializers import ProductListSerializer
from .recommendations import RecommendationEngine

class SimilarProductsView(generics.ListAPIView):
    """Get similar products for a given product"""
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    
    def get_queryset(self):
        product_id = self.kwargs.get('pk')
        engine = RecommendationEngine()
        return engine.get_similar_products(product_id)

class RecommendedProductsView(generics.ListAPIView):
    """Get personalized recommendations for the user"""
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    
    def get_queryset(self):
        engine = RecommendationEngine()
        return engine.get_personalized_recommendations(self.request.user)
