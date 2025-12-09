from django.urls import path
from .views import track_utm, list_campaigns, campaign_detail

urlpatterns = [
    path('track-utm/', track_utm, name='track-utm'),
    path('campaigns/', list_campaigns, name='list-campaigns'),
    path('campaigns/<int:campaign_id>/', campaign_detail, name='campaign-detail'),
]
