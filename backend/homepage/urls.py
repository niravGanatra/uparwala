from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    homepage_data,
    HeroBannerViewSet, PromotionalBannerViewSet, FeaturedCategoryViewSet,
    DealOfTheDayViewSet, HostingEssentialViewSet, PremiumSectionViewSet,
    CategoryPromotionViewSet
)

router = DefaultRouter()
router.register(r'banners', HeroBannerViewSet, basename='hero-banner')
router.register(r'promotions', PromotionalBannerViewSet, basename='promotional-banner')
router.register(r'categories', FeaturedCategoryViewSet, basename='featured-category')
router.register(r'deals', DealOfTheDayViewSet, basename='deal-of-the-day')
router.register(r'hosting', HostingEssentialViewSet, basename='hosting-essential')
router.register(r'premium', PremiumSectionViewSet, basename='premium-section')
router.register(r'category-promotions', CategoryPromotionViewSet, basename='category-promotion')

urlpatterns = [
    path('', homepage_data, name='homepage-data'),
    path('', include(router.urls)),
]
