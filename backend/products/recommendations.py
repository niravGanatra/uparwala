from .models import Product, Category
from django.db.models import Count, Q

class RecommendationEngine:
    def get_similar_products(self, product_id, limit=6):
        """
        Get similar products based on category and price range
        """
        try:
            product = Product.objects.get(id=product_id)
            
            # Base query: same category, exclude current product, only active products from verified vendors
            similar = Product.objects.filter(
                category=product.category,
                is_active=True,
                vendor__verification_status='verified'
            ).exclude(id=product_id)
            
            # Price range logic (within 30% range)
            min_price = product.price * 0.7
            max_price = product.price * 1.3
            
            # Prioritize by price similarity
            similar = similar.filter(
                price__gte=min_price,
                price__lte=max_price
            ).order_by('?')[:limit]  # Randomize results
            
            # If not enough products, relax price constraint
            if similar.count() < limit:
                more_similar = list(Product.objects.filter(
                    category=product.category,
                    is_active=True,
                    vendor__verification_status='verified',
                    vendor__user__is_active=True
                ).exclude(
                    id__in=[p.id for p in similar]
                ).exclude(
                    id=product_id
                ).order_by('?')[:limit - similar.count()])
                
                similar = list(similar) + more_similar
                
            return similar
            
        except Product.DoesNotExist:
            return []

    def get_frequently_bought_together(self, product_id, limit=4):
        """
        Get products frequently bought with this product based on order history
        """
        # This is a placeholder for actual order analysis logic
        # For now, return random products from same category
        try:
            product = Product.objects.get(id=product_id)
            return Product.objects.filter(
                category=product.category,
                is_active=True,
                vendor__user__is_active=True
            ).exclude(id=product_id).order_by('?')[:limit]
        except Product.DoesNotExist:
            return []

    def get_personalized_recommendations(self, user, limit=10):
        """
        Get personalized recommendations based on user history
        """
        if not user.is_authenticated:
            # Return popular products for guests
            recommendations = Product.objects.filter(
                is_active=True,
                vendor__verification_status='verified',
                vendor__user__is_active=True
            ).order_by('-review_count')[:limit]
            return recommendations
            
        # For logged in users, return popular products
        # TODO: Implement actual personalization based on order/view history
        recommendations = Product.objects.filter(
            is_active=True,
            vendor__verification_status='verified',
            vendor__user__is_active=True
        ).order_by('-review_count', '?')[:limit]
        return recommendations
