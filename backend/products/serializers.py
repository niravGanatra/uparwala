from rest_framework import serializers
from .models import Category, Product, ProductImage, Variation

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_primary')

class VariationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variation
        fields = ('id', 'name', 'value', 'price_adjustment')

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variations = VariationSerializer(many=True, read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    vendor_name = serializers.ReadOnlyField(source='vendor.store_name')

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor', 'created_at', 'updated_at')

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor', 'created_at', 'updated_at')

class ProductListSerializer(ProductSerializer):
    """Serializer for listing products (reusing ProductSerializer for now)"""
    pass
