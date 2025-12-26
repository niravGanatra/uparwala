from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductAttribute, Variation, 
    ProductDownload, ProductQuestion, ProductAnswer, RecentlyViewed, 
    ProductReview, ReviewHelpful, Wishlist, GlobalAttribute, AttributeTerm,
    Brand, TaxSlab
)
from users.serializers import UserSerializer
from vendors.serializers import VendorProfileSerializer

class TaxSlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxSlab
        fields = '__all__'

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



class AdminProductSerializer(serializers.ModelSerializer):
    """Serializer for admin product creation - allows setting vendor"""
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')  # vendor NOT read-only for admins
    
    def create(self, validated_data):
        print(f"DEBUG: AdminProductSerializer.create() called")
        print(f"DEBUG: validated_data keys: {validated_data.keys()}")
        
        # Create the product first
        product = Product.objects.create(**validated_data)
        print(f"DEBUG: Product created with ID: {product.id}")
        
        # Handle image uploads from request.FILES
        request = self.context.get('request')
        print(f"DEBUG: Request context exists: {request is not None}")
        
        if request and request.FILES:
            print(f"DEBUG: request.FILES keys: {list(request.FILES.keys())}")
            # Images are sent as image_0, image_1, etc.
            for key in request.FILES:
                if key.startswith('image_'):
                    image_file = request.FILES[key]
                    print(f"DEBUG: Creating ProductImage for key: {key}, file: {image_file.name}")
                    try:
                        product_image = ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            is_primary=(key == 'image_0')  # First image is primary
                        )
                        print(f"DEBUG: ProductImage created successfully! ID: {product_image.id}, Image URL: {product_image.image.url}")
                    except Exception as e:
                        print(f"ERROR: Failed to create ProductImage: {type(e).__name__}: {str(e)}")
                        import traceback
                        print(f"ERROR: Traceback: {traceback.format_exc()}")
                        raise  # Re-raise to trigger transaction rollback
        else:
            print(f"DEBUG: No FILES in request or request is None")
        
        return product


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('vendor', 'created_at', 'updated_at', 'slug', 'price')

    def create(self, validated_data):
        print(f"DEBUG: ProductCreateSerializer.create() called")
        # Create the product first
        product = Product.objects.create(**validated_data)
        
        # Handle image uploads from request.FILES
        request = self.context.get('request')
        
        if request and request.FILES:
            # Images are sent as image_0, image_1, etc.
            for key in request.FILES:
                if key.startswith('image_'):
                    image_file = request.FILES[key]
                    try:
                        ProductImage.objects.create(
                            product=product,
                            image=image_file,
                            is_primary=(key == 'image_0')  # First image is primary
                        )
                    except Exception as e:
                        print(f"ERROR: Failed to create ProductImage: {e}")
                        # We don't raise here to allow product creation even if image fails, 
                        # but typically valid validation would catch this earlier.
        
        return product

class ProductListSerializer(ProductSerializer):
    """Serializer for listing products (reusing ProductSerializer for now)"""
    pass
