from rest_framework import serializers
from .models import Brand, Product
from .phase3_models import ProductVideo, ProductComparison, ProductBundle


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'website', 
                 'meta_title', 'meta_description', 'is_active', 'featured', 
                 'product_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductVideoSerializer(serializers.ModelSerializer):
    """Serializer for Product Videos"""
    video_source = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVideo
        fields = ['id', 'product', 'title', 'video_file', 'video_url', 
                 'video_source', 'thumbnail', 'duration', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_video_source(self, obj):
        return obj.get_video_source()


class ProductComparisonSerializer(serializers.ModelSerializer):
    """Serializer for Product Comparison"""
    products = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Product.objects.filter(is_active=True)
    )
    
    class Meta:
        model = ProductComparison
        fields = ['id', 'user', 'session_key', 'products', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class ProductBundleSerializer(serializers.ModelSerializer):
    """Serializer for Product Bundles"""
    primary_product_name = serializers.CharField(source='primary_product.name', read_only=True)
    bundled_products_detail = serializers.SerializerMethodField()
    bundle_price = serializers.SerializerMethodField()
    savings = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductBundle
        fields = ['id', 'primary_product', 'primary_product_name', 
                 'bundled_products', 'bundled_products_detail', 
                 'discount_type', 'discount_value', 'bundle_price', 
                 'savings', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_bundled_products_detail(self, obj):
        from .serializers import ProductSerializer
        return ProductSerializer(obj.bundled_products.all(), many=True, context=self.context).data
    
    def get_bundle_price(self, obj):
        return float(obj.get_bundle_price())
    
    def get_savings(self, obj):
        return float(obj.get_savings())


class ComparisonDetailSerializer(serializers.Serializer):
    """Detailed comparison data for multiple products"""
    products = serializers.SerializerMethodField()
    
    def get_products(self, obj):
        from .serializers import ProductSerializer
        return ProductSerializer(obj.products.all(), many=True, context=self.context).data
