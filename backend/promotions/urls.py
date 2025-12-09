from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'coupons', views.CouponViewSet, basename='coupon')
router.register(r'usage', views.CouponUsageViewSet, basename='coupon-usage')

urlpatterns = [
    path('validate-coupon/', views.validate_coupon, name='validate-coupon'),
    path('my-coupons/', views.my_coupons, name='my-coupons'),
    path('', include(router.urls)),
]
