from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .shiprocket_models import ShiprocketPincode
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers


class ServiceabilityPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


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
    pagination_class = ServiceabilityPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['state', 'city', 'is_serviceable', 'is_cod_available', 'zone']
    search_fields = ['pincode', 'city', 'state']
    
    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        """
        Upload and import CSV file with BULK support (Fast Import)
        """
        import csv
        import io
        
        csv_file = request.FILES.get('file')
        
        if not csv_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'File must be CSV format'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Read and decode CSV
            file_data = csv_file.read().decode('utf-8')
            reader = csv.DictReader(io.StringIO(file_data))
            
            # Normalize headers (lowercase, strip)
            # This is tricky with DictReader as keys are fixed. 
            # We will just be flexible in our get calls.
            
            pincodes_to_create = []
            existing_pincodes = set(ShiprocketPincode.objects.values_list('pincode', flat=True))
            
            total_rows = 0
            new_records = 0
            skipped = 0
            
            # Batch size for bulk_create
            BATCH_SIZE = 5000
            
            print("Starting CSV processing...")
            
            for row in reader:
                total_rows += 1
                
                # Flexible column mapping
                # Try various common header names
                pincode = (row.get('pincode') or row.get('Pincode') or row.get('PINCODE') or '').strip()
                
                if not pincode or len(pincode) != 6 or not pincode.isdigit():
                    skipped += 1
                    continue
                
                if pincode in existing_pincodes:
                    skipped += 1
                    continue
                
                # New Pincode Found!
                district = (row.get('district') or row.get('District') or row.get('City') or row.get('city') or 'Unknown').strip()
                state = (row.get('statename') or row.get('StateName') or row.get('State') or row.get('state') or 'Unknown').strip()
                division = (row.get('divisionname') or row.get('DivisionName') or row.get('Division') or row.get('division') or '').strip()
                
                # Determine Zone if possible
                zone = self._get_zone(state)
                
                pincodes_to_create.append(
                    ShiprocketPincode(
                        pincode=pincode,
                        city=district,
                        state=state,
                        division_name=division,
                        zone=zone,
                        is_serviceable=True,
                        is_cod_available=True
                    )
                )
                
                existing_pincodes.add(pincode) # Prevent duplicates within the same file
                new_records += 1
                
                # Process in chunks to save memory
                if len(pincodes_to_create) >= BATCH_SIZE:
                    ShiprocketPincode.objects.bulk_create(pincodes_to_create, ignore_conflicts=True)
                    pincodes_to_create = []
                    print(f"Processed {total_rows} rows...")
            
            # Create remaining
            if pincodes_to_create:
                ShiprocketPincode.objects.bulk_create(pincodes_to_create, ignore_conflicts=True)
            
            return Response({
                'message': f'Processed {total_rows} rows. Imported {new_records} new pincodes. Skipped {skipped} duplicates/invalid.',
                'imported': new_records,
                'skipped': skipped,
                'total_in_db': ShiprocketPincode.objects.count()
            })
            
        except Exception as e:
            print(f"Import Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def paste_csv(self, request):
        """
        Import CSV data from pasted text
        """
        import csv
        import io
        
        csv_data = request.data.get('csv_data', '')
        if not csv_data.strip():
            return Response({'error': 'No CSV data provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Parse CSV from string
            reader = csv.DictReader(io.StringIO(csv_data))
            
            imported = 0
            skipped = 0
            
            # Get existing pincodes
            existing_pincodes = set(ShiprocketPincode.objects.values_list('pincode', flat=True))
            
            for row in reader:
                pincode = str(row.get('pincode', '')).strip()
                
                if not pincode or len(pincode) != 6 or not pincode.isdigit():
                    skipped += 1
                    continue
                
                if pincode in existing_pincodes:
                    skipped += 1
                    continue
                
                district = row.get('district', 'Unknown').strip()
                state = row.get('statename', '').strip() or row.get('state', 'Unknown').strip()
                
                ShiprocketPincode.objects.create(
                    pincode=pincode,
                    city=district if district else 'Unknown',
                    state=state if state else 'Unknown',
                    zone=self._get_zone(state),
                    is_serviceable=True,
                    is_cod_available=True,
                )
                
                imported += 1
                existing_pincodes.add(pincode)
            
            return Response({
                'message': f'Imported {imported} pincodes, skipped {skipped}',
                'imported': imported,
                'skipped': skipped
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """
        Delete multiple pincodes by IDs
        """
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            count, _ = ShiprocketPincode.objects.filter(id__in=ids).delete()
            
            return Response({
                'message': f'Deleted {count} pincodes',
                'deleted': count
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_load(self, request):
        """
        Load new pincodes from data.gov.in (skips existing ones)
        Automatically finds where to start fetching
        """
        limit = request.data.get('limit', 1000)
        
        # Get existing pincodes to skip them
        existing_pincodes = set(ShiprocketPincode.objects.values_list('pincode', flat=True))
        
        new_count = self._bulk_fetch_from_datagovin(limit, existing_pincodes)
        
        return Response({
            'message': f'Loaded {new_count} NEW pincodes from data.gov.in',
            'total_in_db': ShiprocketPincode.objects.count(),
            'previously_existed': len(existing_pincodes)
        })
    
    def _bulk_fetch_from_datagovin(self, limit=1000, existing_pincodes=None):
        """Bulk fetch pincodes from data.gov.in, skipping existing ones"""
        import requests
        
        if existing_pincodes is None:
            existing_pincodes = set()
        
        api_key = '579b464db66ec23bdd000001f17ca38f88df4c4a6449db80d254a78f'
        url = 'https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6'
        
        new_count = 0
        batch_size = 100
        offset = 0
        max_offset = 50000  # Safety limit to prevent infinite loops
        
        try:
            while new_count < limit and offset < max_offset:
                params = {
                    'api-key': api_key,
                    'format': 'json',
                    'offset': offset,
                    'limit': batch_size
                }
                
                response = requests.get(url, params=params, timeout=30)
                records = response.json().get('records', [])
                
                if not records:
                    break  # No more data available
                
                for record in records:
                    pincode = str(int(record.get('pincode', 0)))
                    
                    if len(pincode) != 6:
                        continue  # Invalid pincode
                    
                    if pincode in existing_pincodes:
                        continue  # Already exists, skip
                    
                    if new_count >= limit:
                        break  # Reached our target
                    
                    # Create new pincode
                    obj, created = ShiprocketPincode.objects.get_or_create(
                        pincode=pincode,
                        defaults={
                            'city': record.get('Districtname', 'Unknown'),
                            'state': record.get('statename', 'Unknown'),
                            'zone': self._get_zone(record.get('statename', '')),
                            'is_serviceable': True,
                            'is_cod_available': True,
                        }
                    )
                    
                    if created:
                        new_count += 1
                        existing_pincodes.add(pincode)  # Track for this session
                
                offset += batch_size
                
        except Exception as e:
            print(f"Error bulk fetching: {e}")
        
        return new_count
    
    def _fetch_from_datagovin(self, query):
        """Helper to fetch specific pincodes from data.gov.in (for refresh)"""
        import requests
        
        api_key = '579b464db66ec23bdd000001f17ca38f88df4c4a6449db80d254a78f'
        url = 'https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6'
        
        try:
            # Determine filter type
            if query.isdigit():
                filter_str = f"pincode:{query}"
            else:
                filter_str = f"Districtname:{query}"
            
            params = {
                'api-key': api_key,
                'format': 'json',
                'filters[0][field]': filter_str.split(':')[0],
                'filters[0][value]': filter_str.split(':')[1],
                'limit': 100
            }
            
            response = requests.get(url, params=params, timeout=10)
            records = response.json().get('records', [])
            
            for record in records:
                pincode = str(int(record.get('pincode', 0)))
                if len(pincode) == 6:
                    ShiprocketPincode.objects.update_or_create(
                        pincode=pincode,
                        defaults={
                            'city': record.get('Districtname', 'Unknown'),
                            'state': record.get('statename', 'Unknown'),
                            'zone': self._get_zone(record.get('statename', '')),
                            'is_serviceable': True,
                            'is_cod_available': True,
                        }
                    )
        except Exception as e:
            print(f"Error fetching from data.gov.in: {e}")
    
    def _get_zone(self, state):
        """Map states to zones (case-insensitive)"""
        # Normalize state name to Title Case for matching
        state_normalized = state.strip().title()
        
        zones = {
            'East': ['Andaman And Nicobar Islands', 'Bihar', 'Jharkhand', 'Odisha', 'West Bengal'],
            'South': ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry', 'Lakshadweep'],
            'North': ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu And Kashmir', 'Punjab', 'Rajasthan', 'Uttarakhand', 'Chandigarh'],
            'West': ['Goa', 'Gujarat', 'Maharashtra', 'Dadra And Nagar Haveli', 'Daman And Diu'],
            'Central': ['Chhattisgarh', 'Madhya Pradesh', 'Uttar Pradesh'],
            'Northeast': ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura']
        }
        
        for zone, states in zones.items():
            if state_normalized in states:
                return zone
        return ''
    
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        """
        Refresh pincode data from data.gov.in for specific search
        """
        search_query = request.data.get('search', '').strip()
        if not search_query:
            return Response({'error': 'Search query required'}, status=status.HTTP_400_BAD_REQUEST)
        
        self._fetch_from_datagovin(search_query)
        
        return Response({'message': f'Refreshed data for: {search_query}'})
    
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


class PublicPostcodeDetailsView(APIView):
    """
    Public API to get City/State for a pincode (Proxy to Shiprocket)
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, pincode):
        if not pincode or len(pincode) != 6:
            return Response({'error': 'Invalid Pincode'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .shiprocket_service import ShiprocketService
            service = ShiprocketService()
            # 1. Check Local DB first (Faster)
            local = ShiprocketPincode.objects.filter(pincode=pincode).first()
            if local and local.city and local.state and local.city != 'Unknown':
                 return Response({
                    'postcode': local.pincode,
                    'city': local.city,
                    'state': local.state,
                    'country': "India"
                 })
                 
            # 2. Check Shiprocket API
            details = service.get_postcode_details(pincode)
            
            if details:
                return Response(details)
            else:
                return Response({'error': 'Pincode details not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
             print(f"Postcode Details Error: {e}")
             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
