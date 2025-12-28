from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductListView,
    ProductDetailView,
    GlobalAttributeViewSet,
    AttributeTermViewSet,
    TaxSlabViewSet,
    VendorProductListCreateView,
    VendorProductDetailView,
    AdminProductListCreateView,
    AdminProductDetailView,
    product_questions,
    answer_question,
    recently_viewed,
    track_product_view,
    bulk_upload_products,
    download_csv_template,
    check_product_pincode
)
from .review_views import (
    ProductReviewListCreateView,
    ProductReviewDetailView,
    ReviewHelpfulVoteView,
    ProductRatingStatsView,
    VendorResponseView,
    AdminReviewListView,
    AdminReviewDeleteView,
    AdminReviewApprovalView,
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
    CategoryCommissionListView, CategoryCommissionUpdateView
)
from .recommendation_views import SimilarProductsView, RecommendedProductsView
from .cms_views import (
    CMSPageListView, CMSPageDetailView, PublishCMSPageView, PublicCMSPageView
)
from . import stock_views

router = DefaultRouter()
router.register(r'manage/categories', CategoryViewSet, basename='category-manage')
router.register(r'manage/attributes/global', GlobalAttributeViewSet, basename='attribute-global')
router.register(r'manage/attributes/terms', AttributeTermViewSet, basename='attribute-term')
router.register(r'manage/tax-slabs', TaxSlabViewSet, basename='tax-slab')

urlpatterns = [
    path('', ProductListView.as_view(), name='product-list'), # Explicit Product List at /api/products/
    path('', include(router.urls)),
    path('categories/', CategoryViewSet.as_view({'get': 'list'}), name='category-list'), # Public list
    
    path('vendor/my-products/', VendorProductListCreateView.as_view(), name='vendor-product-list'),
    path('vendor/my-products/<slug:slug>/', VendorProductDetailView.as_view(), name='vendor-product-detail'),
    
    # Wishlist (Added)
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistAddRemoveView.as_view(), name='wishlist-add-remove'),
    path('wishlist/<int:product_id>/check/', WishlistCheckView.as_view(), name='wishlist-check'),
    path('wishlist/<int:product_id>/move-to-cart/', WishlistMoveToCartView.as_view(), name='wishlist-move-to-cart'),

    path('admin/', AdminProductListCreateView.as_view(), name='admin-product-list-create'),
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
    
    # Review Management (Admin)
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
    path('admin/reviews/<int:review_id>/delete/', AdminReviewDeleteView.as_view(), name='admin-review-delete'),
    path('admin/reviews/<int:review_id>/approval/', AdminReviewApprovalView.as_view(), name='admin-review-approval'),
    
    # Commission Management (Admin)
    path('admin/commission/categories/', CategoryCommissionListView.as_view(), name='admin-commission-categories'),
    path('admin/commission/categories/<int:pk>/', CategoryCommissionUpdateView.as_view(), name='admin-commission-update'),
    
    # CMS Pages (Admin)
    path('admin/cms-pages/', CMSPageListView.as_view(), name='admin-cms-list'),
    path('admin/cms-pages/<int:pk>/', CMSPageDetailView.as_view(), name='admin-cms-detail'),
    path('admin/cms-pages/<int:pk>/publish/', PublishCMSPageView.as_view(), name='admin-cms-publish'),
    
    # CMS Pages (Public)
    path('pages/<slug:slug>/', PublicCMSPageView.as_view(), name='public-cms-page'),
    
    # Recommendations
    path('<int:pk>/similar/', SimilarProductsView.as_view(), name='product-similar'),
    path('recommendations/', RecommendedProductsView.as_view(), name='product-recommendations'),
    
    # Product Q&A
    path('<int:product_id>/questions/', product_questions, name='product-questions'),
    path('questions/<int:question_id>/answer/', answer_question, name='answer-question'),
    
    # Recently Viewed
    path('recently-viewed/', recently_viewed, name='recently-viewed'),
    path('<int:product_id>/track-view/', track_product_view, name='track-view'),
    
    # Bulk Upload
    path('bulk-upload/', bulk_upload_products, name='bulk-upload'),
    path('bulk-template/', download_csv_template, name='bulk-template'),
    
    path('<slug:slug>/check-pincode/', check_product_pincode, name='check-product-pincode'),
    
    # Stock Notifications
    path('stock-notifications/', stock_views.register_stock_notification, name='register-stock-notification'),
    
    # Phase 3 endpoints (brands, comparison, bundles)
    path('phase3/', include('products.phase3_urls')),
    
    # Main product detail (must be last)
    path('<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
]
