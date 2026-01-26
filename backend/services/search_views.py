"""
Pandit Search API with Location-Based Filtering using Haversine Formula
"""
import math
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import PanditProfile, Service
from .serializers import PanditProfileSerializer


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in kilometers.
    """
    if None in (lat1, lon1, lat2, lon2):
        return float('inf')
    
    # Convert to floats
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in kilometers
    r = 6371
    return c * r


class PanditSearchViewSet(viewsets.ViewSet):
    """
    API for searching Pandits based on location and service.
    
    Supports:
    - Geo-location filtering (lat/lng with configurable radius)
    - Pincode fallback filtering
    - Service-specific filtering
    """
    permission_classes = [AllowAny]
    
    def list(self, request):
        """
        Search for Pandits.
        
        Query Parameters:
        - service_id: Filter by specific service (optional)
        - lat: User's latitude (optional)
        - lng: User's longitude (optional)
        - pincode: Fallback filter by pincode if no lat/lng (optional)
        - online_only: Only return online pandits (default: true)
        """
        queryset = PanditProfile.objects.filter(verification_status='verified')
        
        # Filter by service if provided
        service_id = request.query_params.get('service_id')
        if service_id:
            queryset = queryset.filter(specializations__id=service_id)
        
        # Filter by online status
        online_only = request.query_params.get('online_only', 'true').lower() == 'true'
        if online_only:
            queryset = queryset.filter(is_online=True)
        
        # Get location parameters
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        pincode = request.query_params.get('pincode')
        
        results = []
        
        if lat and lng:
            # Geo-location based filtering using Haversine formula
            try:
                user_lat = float(lat)
                user_lng = float(lng)
                
                for pandit in queryset:
                    if pandit.latitude and pandit.longitude:
                        distance = haversine_distance(
                            user_lat, user_lng,
                            float(pandit.latitude), float(pandit.longitude)
                        )
                        # Check if pandit is within their service radius
                        if distance <= pandit.service_radius_km:
                            results.append({
                                'pandit': pandit,
                                'distance_km': round(distance, 2)
                            })
                
                # Sort by distance
                results.sort(key=lambda x: x['distance_km'])
                
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid latitude or longitude values'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif pincode:
            # Fallback to pincode-based filtering
            for pandit in queryset:
                if pincode in pandit.serviceable_pincodes:
                    results.append({
                        'pandit': pandit,
                        'distance_km': None  # Distance unknown for pincode matching
                    })
        else:
            # No location filter - return all verified pandits
            for pandit in queryset:
                results.append({
                    'pandit': pandit,
                    'distance_km': None
                })
        
        # Serialize results
        serialized_results = []
        for item in results:
            pandit_data = PanditProfileSerializer(item['pandit']).data
            pandit_data['distance_km'] = item['distance_km']
            serialized_results.append(pandit_data)
        
        return Response({
            'count': len(serialized_results),
            'results': serialized_results
        })
    
    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Convenience endpoint for finding nearby pandits.
        Requires lat and lng parameters.
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        if not lat or not lng:
            return Response(
                {'error': 'lat and lng parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delegate to list with geo params
        return self.list(request)
