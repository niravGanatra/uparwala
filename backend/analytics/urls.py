from django.urls import path
from .views import TrackEventView, DashboardMetricsView

urlpatterns = [
    path('events/', TrackEventView.as_view(), name='track-event'),
    path('dashboard/', DashboardMetricsView.as_view(), name='analytics-dashboard'),
]
