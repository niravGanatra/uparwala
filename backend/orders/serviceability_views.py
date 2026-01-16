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
        from .models import ServiceablePincode

        # Check ServiceablePincode (Whitelist)
        queryset = ServiceablePincode.objects.filter(pincode=pincode, is_active=True)
        
        # Optional Area/Locality Check
        area = request.query_params.get('area')
        if area:
            # Case-insensitive partial match or exact? User said "validates if we serve that location".
            # Using iexact for stricter matching on locality if provided. 
            # Or use icontains if fuzzy? iexact is safer for "Reference Data".
            queryset = queryset.filter(area__iexact=area)
        
        if queryset.exists():
            # Get details from the first match
            obj = queryset.first()
            return Response({
                'serviceable': True,
                'pincode': obj.pincode,
                'area': obj.area,
                'city': obj.city,
                'state': obj.state,
                'message': 'Delivery available.'
            })
            
        # If not found in whitelist
        error_msg = 'We currently do not serve this location.'
        if area:
             error_msg = f'We do not serve the area "{area}" in pincode {pincode}.'
             
        return Response({
            'serviceable': False,
            'message': error_msg
        })


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


# ========== ServiceablePincode Admin (Whitelist Management) ==========

from .models import ServiceablePincode

class ServiceablePincodeSerializer(serializers.ModelSerializer):
    """Serializer for our own Serviceable Pincode whitelist"""
    class Meta:
        model = ServiceablePincode
        fields = ['id', 'pincode', 'city', 'state', 'area', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ServiceablePincodeAdminViewSet(viewsets.ModelViewSet):
    """
    Admin API to manage Serviceable Pincodes (Whitelist).
    This is the master list of locations where we accept orders.
    """
    queryset = ServiceablePincode.objects.all().order_by('state', 'city', 'pincode')
    serializer_class = ServiceablePincodeSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = ServiceabilityPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['state', 'city', 'is_active']
    search_fields = ['pincode', 'city', 'state', 'area']
    
    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        """
        Upload and import CSV file with serviceable locations.
        Expected columns: State, City, ZipCode/Pincode, Area (optional)
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
            file_data = csv_file.read().decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(file_data))
            
            headers = reader.fieldnames
            
            # Flexible column mapping
            map_pincode = next((h for h in headers if 'zip' in h.lower() or 'pin' in h.lower()), None)
            map_city = next((h for h in headers if 'city' in h.lower() or 'district' in h.lower()), None)
            map_state = next((h for h in headers if 'state' in h.lower()), None)
            map_area = next((h for h in headers if 'area' in h.lower() or 'locality' in h.lower()), None)
            
            if not map_pincode:
                return Response({'error': 'CSV must contain a ZipCode or Pincode column'}, status=status.HTTP_400_BAD_REQUEST)
            
            total_rows = 0
            new_records = 0
            updated_records = 0
            skipped = 0
            
            for row in reader:
                total_rows += 1
                
                pincode = row.get(map_pincode, '').strip()
                city = row.get(map_city, '').strip() if map_city else ''
                state = row.get(map_state, '').strip() if map_state else ''
                area = row.get(map_area, '').strip() if map_area else None
                
                if not pincode:
                    skipped += 1
                    continue
                
                # Create or update
                defaults = {
                    'city': city or 'Unknown',
                    'state': state or 'Unknown',
                    'is_active': True
                }
                
                # Lookup by pincode + area (if area provided)
                if area:
                    obj, created = ServiceablePincode.objects.update_or_create(
                        pincode=pincode,
                        area=area,
                        defaults=defaults
                    )
                else:
                    obj, created = ServiceablePincode.objects.update_or_create(
                        pincode=pincode,
                        area__isnull=True,
                        defaults=defaults
                    )
                
                if created:
                    new_records += 1
                else:
                    updated_records += 1
            
            return Response({
                'message': f'Processed {total_rows} rows. Created {new_records}, Updated {updated_records}, Skipped {skipped}.',
                'created': new_records,
                'updated': updated_records,
                'skipped': skipped,
                'total_in_db': ServiceablePincode.objects.count()
            })
            
        except Exception as e:
            print(f"CSV Import Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def bulk_toggle(self, request):
        """
        Bulk enable/disable serviceability for selected IDs.
        Payload: { "ids": [1, 2, 3], "is_active": true }
        """
        ids = request.data.get('ids', [])
        is_active = request.data.get('is_active')
        
        if not ids or is_active is None:
            return Response({'error': 'ids and is_active are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        count = ServiceablePincode.objects.filter(id__in=ids).update(is_active=is_active)
        
        action_text = "enabled" if is_active else "disabled"
        return Response({'message': f'{action_text.capitalize()} {count} locations'})
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """
        Delete multiple serviceable locations by IDs.
        """
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        count, _ = ServiceablePincode.objects.filter(id__in=ids).delete()
        
        return Response({'message': f'Deleted {count} locations', 'deleted': count})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about serviceable locations.
        """
        from django.db.models import Count
        
        total = ServiceablePincode.objects.count()
        active = ServiceablePincode.objects.filter(is_active=True).count()
        inactive = total - active
        
        # Group by state
        by_state = ServiceablePincode.objects.values('state').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'total': total,
            'active': active,
            'inactive': inactive,
            'by_state': list(by_state)
        })
