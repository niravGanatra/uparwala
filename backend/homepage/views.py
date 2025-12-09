from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
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
        
        # Get active deals (within date range)
        today = timezone.now().date()
        deals = DealOfTheDay.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        
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


class HeroBannerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for hero banners"""
    queryset = HeroBanner.objects.filter(is_active=True)
    serializer_class = HeroBannerSerializer
    permission_classes = [AllowAny]


class PromotionalBannerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for promotional banners"""
    queryset = PromotionalBanner.objects.filter(is_active=True)
    serializer_class = PromotionalBannerSerializer
    permission_classes = [AllowAny]


class FeaturedCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for featured categories"""
    queryset = FeaturedCategory.objects.filter(is_active=True)
    serializer_class = FeaturedCategorySerializer
    permission_classes = [AllowAny]


class DealOfTheDayViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for deals of the day"""
    serializer_class = DealOfTheDaySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        today = timezone.now().date()
        return DealOfTheDay.objects.filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )


class HostingEssentialViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for hosting essentials"""
    queryset = HostingEssential.objects.filter(is_active=True)
    serializer_class = HostingEssentialSerializer
    permission_classes = [AllowAny]


class PremiumSectionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for premium sections"""
    queryset = PremiumSection.objects.filter(is_active=True)
    serializer_class = PremiumSectionSerializer
    permission_classes = [AllowAny]


class CategoryPromotionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for category promotions"""
    queryset = CategoryPromotion.objects.filter(is_active=True)
    serializer_class = CategoryPromotionSerializer
    permission_classes = [AllowAny]
