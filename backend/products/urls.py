from django.urls import path
from .views import (
    CategoryListView, 
    ProductListView, 
    ProductDetailView,
    VendorProductListCreateView,
    VendorProductDetailView,
    AdminProductDetailView
)
from .review_views import (
    ProductReviewListCreateView,
    ProductReviewDetailView,
    ReviewHelpfulVoteView,
    ProductRatingStatsView,
    VendorResponseView,
)
from .search_views import (
    ProductSearchView,
    ProductAutocompleteView,
    FilterOptionsView,
)
from .wishlist_views import (
    WishlistView,
    WishlistAddRemoveView,
    WishlistCheckView,
    WishlistMoveToCartView,
)
from .moderation_views import (
    ProductModerationListView, ProductModerationDetailView,
    ApproveProductView, RejectProductView, RequestChangesView, ModerationStatsView
)
from .commission_views import (
    GlobalCommissionView, VendorCommissionListView, VendorCommissionCreateView,
    VendorCommissionUpdateView, VendorCommissionDeleteView
)
from .recommendation_views import SimilarProductsView, RecommendedProductsView
from .cms_views import (
    CMSPageListView, CMSPageDetailView, PublishCMSPageView, PublicCMSPageView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('search/', ProductSearchView.as_view(), name='product-search'),
    path('autocomplete/', ProductAutocompleteView.as_view(), name='product-autocomplete'),
    path('filter-options/', FilterOptionsView.as_view(), name='filter-options'),
    
    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistAddRemoveView.as_view(), name='wishlist-add-remove'),
    path('wishlist/<int:product_id>/check/', WishlistCheckView.as_view(), name='wishlist-check'),
    path('wishlist/<int:product_id>/move-to-cart/', WishlistMoveToCartView.as_view(), name='wishlist-move-to-cart'),
    
    path('', ProductListView.as_view(), name='product-list'),
    path('vendor/my-products/', VendorProductListCreateView.as_view(), name='vendor-product-list'),
    path('vendor/my-products/<slug:slug>/', VendorProductDetailView.as_view(), name='vendor-product-detail'),
    path('admin/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    
    # Product reviews
    path('<int:product_id>/reviews/', ProductReviewListCreateView.as_view(), name='product-reviews'),
    path('reviews/<int:pk>/', ProductReviewDetailView.as_view(), name='review-detail'),
    path('reviews/<int:review_id>/vote/', ReviewHelpfulVoteView.as_view(), name='review-vote'),
    path('<int:product_id>/rating-stats/', ProductRatingStatsView.as_view(), name='rating-stats'),
    path('reviews/<int:review_id>/vendor-response/', VendorResponseView.as_view(), name='vendor-response'),
    
    # Product Moderation (Admin)
    path('admin/moderation/', ProductModerationListView.as_view(), name='admin-moderation-list'),
    path('admin/moderation/<int:pk>/', ProductModerationDetailView.as_view(), name='admin-moderation-detail'),
    path('admin/moderation/<int:pk>/approve/', ApproveProductView.as_view(), name='admin-product-approve'),
    path('admin/moderation/<int:pk>/reject/', RejectProductView.as_view(), name='admin-product-reject'),
    path('admin/moderation/<int:pk>/request-changes/', RequestChangesView.as_view(), name='admin-product-request-changes'),
    path('admin/moderation/stats/', ModerationStatsView.as_view(), name='admin-moderation-stats'),
    
    # Commission Management (Admin)
    path('admin/commission/global/', GlobalCommissionView.as_view(), name='admin-commission-global'),
    path('admin/commission/vendors/', VendorCommissionListView.as_view(), name='admin-commission-vendors'),
    path('admin/commission/vendors/create/', VendorCommissionCreateView.as_view(), name='admin-commission-create'),
    path('admin/commission/vendors/<int:pk>/', VendorCommissionUpdateView.as_view(), name='admin-commission-update'),
    path('admin/commission/vendors/<int:pk>/delete/', VendorCommissionDeleteView.as_view(), name='admin-commission-delete'),
    
    # CMS Pages (Admin)
    path('admin/cms-pages/', CMSPageListView.as_view(), name='admin-cms-list'),
    path('admin/cms-pages/<int:pk>/', CMSPageDetailView.as_view(), name='admin-cms-detail'),
    path('admin/cms-pages/<int:pk>/publish/', PublishCMSPageView.as_view(), name='admin-cms-publish'),
    
    # CMS Pages (Public)
    path('pages/<slug:slug>/', PublicCMSPageView.as_view(), name='public-cms-page'),
    
    # Recommendations
    path('<int:pk>/similar/', SimilarProductsView.as_view(), name='product-similar'),
    path('recommendations/', RecommendedProductsView.as_view(), name='product-recommendations'),
    
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
