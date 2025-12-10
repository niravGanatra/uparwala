from rest_framework import serializers
from .models import Category, Product, ProductImage, Variation, GlobalAttribute, AttributeTerm

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = '__all__'
    
    def get_subcategories(self, obj):
        # For parent categories, include their subcategories
        if not obj.parent:
            subcats = Category.objects.filter(parent=obj)
            return [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in subcats]
        return []

class GlobalAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalAttribute
        fields = '__all__'

class AttributeTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeTerm
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            # Fallback for cases where request context is not available
            return obj.image.url
        return None

class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ('id', 'name', 'value', 'price_adjustment')

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variations = VariationSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    vendor_name = serializers.ReadOnlyField(source='vendor.store_name')
    active_deal = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor', 'created_at', 'updated_at')

    def get_active_deal(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        # Use the reverse relation 'daily_deals' from DealOfTheDay model
        deal = obj.daily_deals.filter(
            is_active=True, 
            start_date__lte=today, 
            end_date__gte=today
        ).first() # Priority is handled by default ordering in DealOfTheDay Meta
        
        if deal:
            return {
                'id': deal.id,
                'discount_percentage': deal.discount_percentage,
                'discounted_price': deal.discounted_price,
                'end_date': deal.end_date
            }
        return None

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor', 'created_at', 'updated_at')

class ProductListSerializer(ProductSerializer):
    """Serializer for listing products (reusing ProductSerializer for now)"""
    pass
