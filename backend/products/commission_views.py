from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q

from vendors.models import CommissionSettings, VendorProfile
from rest_framework import serializers


class CommissionSettingsSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True, allow_null=True)
    
    class Meta:
        model = CommissionSettings
        fields = [
            'id', 'vendor', 'vendor_name', 'commission_rate',
            'is_active', 'effective_from', 'effective_until',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GlobalCommissionView(APIView):
    """Get and update global commission settings (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Get global commission (vendor=null)
        global_commission = CommissionSettings.objects.filter(
            vendor__isnull=True,
            is_active=True
        ).first()
        
        if global_commission:
            serializer = CommissionSettingsSerializer(global_commission)
            return Response(serializer.data)
        
        return Response({
            'commission_rate': 10.0,  # Default
            'message': 'No global commission set, using default'
        })
    
    def post(self, request):
        commission_rate = request.data.get('commission_rate')
        
        if commission_rate is None:
            return Response(
                {'error': 'Commission rate is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            commission_rate = float(commission_rate)
            if commission_rate < 0 or commission_rate > 100:
                raise ValueError()
        except ValueError:
            return Response(
                {'error': 'Commission rate must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deactivate old global commission
        CommissionSettings.objects.filter(
            vendor__isnull=True,
            is_active=True
        ).update(is_active=False)
        
        # Create new global commission
        commission = CommissionSettings.objects.create(
            vendor=None,
            commission_rate=commission_rate,
            is_active=True
        )
        
        serializer = CommissionSettingsSerializer(commission)
        return Response({
            'message': 'Global commission updated successfully',
            'commission': serializer.data
        }, status=status.HTTP_201_CREATED)


class VendorCommissionListView(generics.ListAPIView):
    """List vendor-specific commission overrides (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = CommissionSettingsSerializer
    
    def get_queryset(self):
        queryset = CommissionSettings.objects.filter(
            vendor__isnull=False
        ).select_related('vendor').order_by('-created_at')
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by vendor name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(vendor__store_name__icontains=search)
        
        return queryset


class VendorCommissionCreateView(APIView):
    """Create vendor-specific commission override (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request):
        vendor_id = request.data.get('vendor_id')
        commission_rate = request.data.get('commission_rate')
        
        if not vendor_id or commission_rate is None:
            return Response(
                {'error': 'vendor_id and commission_rate are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            vendor = VendorProfile.objects.get(id=vendor_id)
        except VendorProfile.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            commission_rate = float(commission_rate)
            if commission_rate < 0 or commission_rate > 100:
                raise ValueError()
        except ValueError:
            return Response(
                {'error': 'Commission rate must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Deactivate old commission for this vendor (not needed with OneToOneField)
        # CommissionSettings.objects.filter(
        #     vendor=vendor,
        #     is_active=True
        # ).update(is_active=False)
        
        # Create or update commission (OneToOneField allows only one per vendor)
        commission, created = CommissionSettings.objects.update_or_create(
            vendor=vendor,
            defaults={
                'commission_rate': commission_rate,
                'is_active': True
            }
        )
        
        serializer = CommissionSettingsSerializer(commission)
        action = 'created' if created else 'updated'
        return Response({
            'message': f'Vendor commission {action} successfully',
            'commission': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class VendorCommissionUpdateView(APIView):
    """Update vendor commission (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        try:
            commission = CommissionSettings.objects.get(pk=pk)
        except CommissionSettings.DoesNotExist:
            return Response(
                {'error': 'Commission setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        commission_rate = request.data.get('commission_rate')
        is_active = request.data.get('is_active')
        
        if commission_rate is not None:
            try:
                commission_rate = float(commission_rate)
                if commission_rate < 0 or commission_rate > 100:
                    raise ValueError()
                commission.commission_rate = commission_rate
            except ValueError:
                return Response(
                    {'error': 'Commission rate must be between 0 and 100'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if is_active is not None:
            commission.is_active = is_active
        
        commission.save()
        
        serializer = CommissionSettingsSerializer(commission)
        return Response({
            'message': 'Commission updated successfully',
            'commission': serializer.data
        })


class VendorCommissionDeleteView(APIView):
    """Delete vendor commission (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def delete(self, request, pk):
        try:
            commission = CommissionSettings.objects.get(pk=pk)
        except CommissionSettings.DoesNotExist:
            return Response(
                {'error': 'Commission setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        commission.delete()
        
        return Response({
            'message': 'Commission deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
