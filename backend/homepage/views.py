from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.utils import timezone
from .models import (
    HeroBanner, PromotionalBanner, FeaturedCategory,
    DealOfTheDay, HostingEssential, PremiumSection, CategoryPromotion
)
from .serializers import (
    HeroBannerSerializer, PromotionalBannerSerializer, FeaturedCategorySerializer,
    DealOfTheDaySerializer, HostingEssentialSerializer, PremiumSectionSerializer,
    CategoryPromotionSerializer, HomepageDataSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


@api_view(['GET'])
def homepage_data(request):
    """
    Get all homepage data in a single request
    """
    try:
        # Get active hero banner (highest priority)
        hero_banner = HeroBanner.objects.filter(is_active=True).first()
        
        # Get active promotional banners
        promotional_banners = PromotionalBanner.objects.filter(is_active=True)
        
        # Get active featured categories
        featured_categories = FeaturedCategory.objects.filter(is_active=True)
        
        # Get active deals - only active products from verified vendors
        deals = DealOfTheDay.objects.filter(
            is_active=True,
            start_date__lte=timezone.now(),
            end_date__gte=timezone.now(),
            product__is_active=True,
            product__vendor__verification_status='verified'
        ).select_related('product', 'product__vendor').order_by('-priority')
        
        # Get active hosting essentials
        hosting_essentials = HostingEssential.objects.filter(is_active=True)
        
        # Get active premium sections
        premium_sections = PremiumSection.objects.filter(is_active=True)
        
        # Get active category promotions
        category_promotions = CategoryPromotion.objects.filter(is_active=True)
        
        context = {'request': request}
        
        data = {
            'hero_banner': HeroBannerSerializer(hero_banner, context=context).data if hero_banner else None,
            'promotional_banners': PromotionalBannerSerializer(promotional_banners, many=True, context=context).data,
            'featured_categories': FeaturedCategorySerializer(featured_categories, many=True, context=context).data,
            'deals': DealOfTheDaySerializer(deals, many=True, context=context).data,
            'hosting_essentials': HostingEssentialSerializer(hosting_essentials, many=True, context=context).data,
            'premium_sections': PremiumSectionSerializer(premium_sections, many=True, context=context).data,
            'category_promotions': CategoryPromotionSerializer(category_promotions, many=True, context=context).data,
        }
        
        return Response(data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class HeroBannerViewSet(viewsets.ModelViewSet):
    """ViewSet for hero banners"""
    queryset = HeroBanner.objects.all()
    serializer_class = HeroBannerSerializer
    permission_classes = [IsAdminOrReadOnly]


class PromotionalBannerViewSet(viewsets.ModelViewSet):
    """ViewSet for promotional banners"""
    queryset = PromotionalBanner.objects.all()
    serializer_class = PromotionalBannerSerializer
    permission_classes = [IsAdminOrReadOnly]


class FeaturedCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for featured categories"""
    queryset = FeaturedCategory.objects.all()
    serializer_class = FeaturedCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class DealOfTheDayViewSet(viewsets.ModelViewSet):
    """ViewSet for deals of the day"""
    queryset = DealOfTheDay.objects.all()
    serializer_class = DealOfTheDaySerializer
    permission_classes = [IsAdminOrReadOnly]


class HostingEssentialViewSet(viewsets.ModelViewSet):
    """ViewSet for hosting essentials"""
    queryset = HostingEssential.objects.all()
    serializer_class = HostingEssentialSerializer
    permission_classes = [IsAdminOrReadOnly]


class PremiumSectionViewSet(viewsets.ModelViewSet):
    """ViewSet for premium sections"""
    queryset = PremiumSection.objects.all()
    serializer_class = PremiumSectionSerializer
    permission_classes = [IsAdminOrReadOnly]


class CategoryPromotionViewSet(viewsets.ModelViewSet):
    """ViewSet for category promotions"""
    queryset = CategoryPromotion.objects.all()
    serializer_class = CategoryPromotionSerializer
    permission_classes = [IsAdminOrReadOnly]
