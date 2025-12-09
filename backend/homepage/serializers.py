from rest_framework import serializers
from .models import (
    HeroBanner, PromotionalBanner, FeaturedCategory,
    DealOfTheDay, HostingEssential, PremiumSection, CategoryPromotion
)
from products.serializers import ProductSerializer


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = ['id', 'title', 'subtitle', 'background_color', 'background_image', 'is_active', 'priority']


class PromotionalBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionalBanner
        fields = ['id', 'title', 'discount_text', 'background_color', 'background_image', 
                  'link_url', 'position', 'is_active', 'priority']


class FeaturedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FeaturedCategory
        fields = ['id', 'name', 'icon', 'image', 'link_url', 'priority', 'is_active']


class DealOfTheDaySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    discounted_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = DealOfTheDay
        fields = ['id', 'product', 'discount_percentage', 'discounted_price', 
                  'start_date', 'end_date', 'is_active', 'priority']


class HostingEssentialSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostingEssential
        fields = ['id', 'name', 'image', 'emoji', 'link_url', 'priority', 'is_active']


class PremiumSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PremiumSection
        fields = ['id', 'title', 'subtitle', 'background_color', 'background_image', 
                  'icon', 'link_url', 'position', 'is_active', 'priority']


class CategoryPromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryPromotion
        fields = ['id', 'name', 'discount_text', 'background_color', 'background_image', 
                  'link_url', 'priority', 'is_active']


class HomepageDataSerializer(serializers.Serializer):
    """Combined serializer for all homepage data"""
    hero_banner = HeroBannerSerializer()
    promotional_banners = PromotionalBannerSerializer(many=True)
    featured_categories = FeaturedCategorySerializer(many=True)
    deals = DealOfTheDaySerializer(many=True)
    hosting_essentials = HostingEssentialSerializer(many=True)
    premium_sections = PremiumSectionSerializer(many=True)
    category_promotions = CategoryPromotionSerializer(many=True)
