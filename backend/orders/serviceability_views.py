from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .shiprocket_models import ShiprocketPincode
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers


class ShiprocketPincodeSerializer(serializers.ModelSerializer):
    """Serializer for Shiprocket Pincode management"""
    class Meta:
        model = ShiprocketPincode
        fields = '__all__'


class AdminServiceabilityViewSet(viewsets.ModelViewSet):
    """
    Admin API to manage Serviceable Pincodes.
    Supports filtering, searching, and bulk updates.
    """
    queryset = ShiprocketPincode.objects.all().order_by('state', 'city', 'pincode')
    serializer_class = ShiprocketPincodeSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['state', 'city', 'is_serviceable', 'is_cod_available', 'zone']
    search_fields = ['pincode', 'city', 'state']
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """
        Bulk update serviceable/COD status for a list of IDs.
        Payload: { 
            "ids": [1, 2, 3], 
            "is_serviceable": true, 
            "is_cod_available": false 
        }
        """
        ids = request.data.get('ids', [])
        update_data = {}
        
        if 'is_serviceable' in request.data:
            update_data['is_serviceable'] = request.data['is_serviceable']
        if 'is_cod_available' in request.data:
            update_data['is_cod_available'] = request.data['is_cod_available']
            
        if not ids or not update_data:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
            
        count = ShiprocketPincode.objects.filter(id__in=ids).update(**update_data)
        return Response({'message': f'Updated {count} records'})


class PublicServiceabilityCheckView(APIView):
    """
    Public API to check if a pincode is serviceable.
    Strategy: Hybrid Cache.
    1. Check Local DB. If exists, use that (allows blocking).
    2. If NOT exists, check Shiprocket API Live.
    3. Save result to DB for future checks.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, pincode):
        from .shiprocket_service import ShiprocketService
        from .shiprocket_models import ShiprocketConfig
        
        # 1. Check Local DB Override
        pincode_obj = ShiprocketPincode.objects.filter(pincode=pincode).first()
        
        if pincode_obj:
            if not pincode_obj.is_serviceable:
                return Response({
                    'serviceable': False,
                    'message': 'We currently do not ship to this location.'
                })
            
            return Response({
                'serviceable': True,
                'cod_available': pincode_obj.is_cod_available,
                'city': pincode_obj.city,
                'state': pincode_obj.state,
                'message': 'Delivery available.'
            })
            
        # 2. Not in DB? Check Live Shiprocket API
        try:
            service = ShiprocketService()
            config = ShiprocketConfig.objects.first()
            
            if not config or not config.pickup_pincode:
                # If config missing, fail closed? Or fail open?
                # Fail closed for safety.
                return Response({
                    'serviceable': False,
                    'message': 'Shipping configuration missing.'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # Check serviceability (assume 0.5kg standard)
            # This returns a list of couriers if serviceable
            couriers = service.check_serviceability(
                pickup_pincode=config.pickup_pincode,
                delivery_pincode=pincode,
                weight=0.5,
                cod=1
            )
            
            is_serviceable = False
            is_cod_available = False
            
            if couriers and len(couriers) > 0:
                is_serviceable = True
                # Check for COD support in any courier
                for c in couriers:
                    if str(c.get('cod', '0')) == '1':
                        is_cod_available = True
                        break
            
            # 3. Cache Result to DB (So Admin can block it later)
            # Where to get City/State? 
            # Ideally verify with Postcode API, but for now use "Unknown" or infer?
            # We will save it as serviceable, Admin can filter/block in UI.
            
            ShiprocketPincode.objects.create(
                pincode=pincode,
                city="Unknown", # Metadata update can happen via sync script later
                state="Unknown",
                is_serviceable=is_serviceable,
                is_cod_available=is_cod_available
            )
            
            if not is_serviceable:
                 return Response({
                    'serviceable': False,
                    'message': 'Courier service not available for this pincode.'
                })

            return Response({
                'serviceable': True,
                'cod_available': is_cod_available,
                'city': "Unknown",
                'state': "Unknown",
                'message': 'Delivery available.'
            })

        except Exception as e:
            print(f"Live Serviceability Check Failed: {e}")
            return Response({
                'serviceable': False,
                'message': 'Unable to verify pincode.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
