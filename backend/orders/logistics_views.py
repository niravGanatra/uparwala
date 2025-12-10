from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django.db import models
from .models import CODPincode, GiftOption
from .logistics_serializers import CODPincodeSerializer, GiftOptionSerializer

class CODPincodeViewSet(viewsets.ModelViewSet):
    """Admin management of COD available pincodes"""
    permission_classes = [IsAdminUser]
    queryset = CODPincode.objects.all()
    serializer_class = CODPincodeSerializer
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by is_active
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by pincode, city, or state
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(pincode__icontains=search) |
                models.Q(city__icontains=search) |
                models.Q(state__icontains=search)
            )
        
        return queryset

class GiftOptionViewSet(viewsets.ModelViewSet):
    """Admin management of gift wrapping options"""
    permission_classes = [IsAdminUser]
    queryset = GiftOption.objects.all()
    serializer_class = GiftOptionSerializer
    ordering = ['sort_order', 'name']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by is_active
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
