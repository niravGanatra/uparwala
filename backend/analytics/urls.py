from django.urls import path
from .views import (
    TrackEventView, DashboardMetricsView, 
    PlatformMetricsView, TopSellersView, CategoryGrowthView
)

urlpatterns = [
    path('events/', TrackEventView.as_view(), name='track-event'),
    path('dashboard/', DashboardMetricsView.as_view(), name='analytics-dashboard'),
    
    # New Admin Dashboard Endpoints (Phase 7)
    path('admin/platform-metrics/', PlatformMetricsView.as_view(), name='platform-metrics'),
    path('admin/top-sellers/', TopSellersView.as_view(), name='top-sellers'),
    path('admin/category-growth/', CategoryGrowthView.as_view(), name='category-growth'),
]
