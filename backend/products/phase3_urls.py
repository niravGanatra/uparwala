from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .phase3_views import (
    BrandViewSet,
    add_to_comparison,
    remove_from_comparison,
    get_comparison,
    get_comparison_details,
    get_product_bundles,
    add_bundle_to_cart
)

router = DefaultRouter()
router.register(r'brands', BrandViewSet, basename='brand')

urlpatterns = [
    # Brand routes
    path('', include(router.urls)),
    
    # Comparison routes
    path('compare/add/', add_to_comparison, name='add-to-comparison'),
    path('compare/remove/<int:product_id>/', remove_from_comparison, name='remove-from-comparison'),
    path('compare/', get_comparison, name='get-comparison'),
    path('compare/details/', get_comparison_details, name='comparison-details'),
    
    # Bundle routes
    path('<int:product_id>/bundles/', get_product_bundles, name='product-bundles'),
    path('bundles/add-to-cart/', add_bundle_to_cart, name='add-bundle-to-cart'),
]
