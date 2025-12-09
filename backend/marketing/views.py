from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone

from .models import Campaign, UTMTracking
from .serializers import CampaignSerializer, UTMTrackingSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def track_utm(request):
    """Track UTM parameters from landing"""
    utm_source = request.data.get('utm_source', '')
    utm_medium = request.data.get('utm_medium', '')
    utm_campaign = request.data.get('utm_campaign', '')
    utm_term = request.data.get('utm_term', '')
    utm_content = request.data.get('utm_content', '')
    referrer = request.data.get('referrer', '')
    landing_page = request.data.get('landing_page', '')
    
    # Get or create session
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key
    
    # Find matching campaign
    campaign = None
    if utm_source and utm_medium and utm_campaign:
        campaign = Campaign.objects.filter(
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign,
            is_active=True
        ).first()
        
        if campaign:
            campaign.clicks += 1
            campaign.save()
    
    # Create tracking entry
    tracking = UTMTracking.objects.create(
        user=request.user if request.user.is_authenticated else None,
        session_key=session_key,
        utm_source=utm_source,
        utm_medium=utm_medium,
        utm_campaign=utm_campaign,
        utm_term=utm_term,
        utm_content=utm_content,
        referrer=referrer,
        landing_page=landing_page,
        campaign=campaign
    )
    
    serializer = UTMTrackingSerializer(tracking)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_campaigns(request):
    """List all campaigns with performance metrics"""
    campaigns = Campaign.objects.all().order_by('-created_at')
    serializer = CampaignSerializer(campaigns, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def campaign_detail(request, campaign_id):
    """Get campaign details"""
    try:
        campaign = Campaign.objects.get(id=campaign_id)
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)
    except Campaign.DoesNotExist:
        return Response({'error': 'Campaign not found'}, status=status.HTTP_404_NOT_FOUND)
