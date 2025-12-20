import requests
import time
from django.core.management.base import BaseCommand, CommandError
from orders.shiprocket_models import ShiprocketPincode

class Command(BaseCommand):
    help = 'Bulk import Indian pincodes from postal API or data.gov.in'

    def add_arguments(self, parser):
        parser.add_argument('--source', type=str, default='postal', help='Source API: "postal" or "datagovin"')
        parser.add_argument('--states', type=str, help='Comma-separated state names to import (e.g., "Maharashtra,Delhi")')
        parser.add_argument('--limit', type=int, default=1000, help='Maximum records to import')
        parser.add_argument('--api-key', type=str, help='data.gov.in API key (required if source=datagovin)')

    def handle(self, *args, **options):
        source = options['source']
        limit = options['limit']
        
        if source == 'postal':
            self.import_from_postal_api(limit, options.get('states'))
        elif source == 'datagovin':
            api_key = options.get('api_key')
            if not api_key:
                raise CommandError('--api-key is required for data.gov.in source')
            self.import_from_datagovin(api_key, limit, options.get('states'))
        else:
            raise CommandError('Invalid source. Use "postal" or "datagovin"')

    def import_from_postal_api(self, limit, states_filter=None):
        """
        Import from https://api.postalpincode.in
        This API is free and doesn't require authentication
        """
        self.stdout.write("Importing from Postal API (postalpincode.in)...")
        
        # Major city pincodes to seed (you can expand this list)
        major_cities = {
            'Mumbai': ['400001', '400002', '400003', '400004', '400005'],
            'Delhi': ['110001', '110002', '110003', '110004', '110005'],
            'Bengaluru': ['560001', '560002', '560003', '560004', '560005'],
            'Chennai': ['600001', '600002', '600003', '600004', '600005'],
            'Kolkata': ['700001', '700002', '700003', '700004', '700005'],
            'Hyderabad': ['500001', '500002', '500003', '500004', '500005'],
            'Pune': ['411001', '411002', '411003', '411004', '411005'],
            'Ahmedabad': ['380001', '380002', '380003', '380004', '380005'],
        }
        
        count = 0
        for city, pincodes in major_cities.items():
            if count >= limit:
                break
                
            for pincode in pincodes:
                if count >= limit:
                    break
                    
                try:
                    url = f"https://api.postalpincode.in/pincode/{pincode}"
                    response = requests.get(url, timeout=10)
                    data = response.json()
                    
                    if data and len(data) > 0 and data[0]['Status'] == 'Success':
                        post_office = data[0]['PostOffice'][0]
                        
                        obj, created = ShiprocketPincode.objects.update_or_create(
                            pincode=pincode,
                            defaults={
                                'city': post_office.get('Block') or post_office.get('District', 'Unknown'),
                                'state': post_office.get('State', 'Unknown'),
                                'zone': self.get_zone(post_office.get('State', '')),
                                'is_serviceable': True,
                                'is_cod_available': True,
                            }
                        )
                        
                        if created:
                            count += 1
                            self.stdout.write(f"✓ {pincode} - {post_office.get('State')}")
                        
                    time.sleep(0.1)  # Rate limiting
                    
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Failed {pincode}: {e}"))
                    continue
        
        self.stdout.write(self.style.SUCCESS(f"Imported {count} pincodes successfully!"))

    def import_from_datagovin(self, api_key, limit, states_filter=None):
        """
        Import from data.gov.in All India Pincode Directory
        """
        self.stdout.write("Importing from data.gov.in...")
        
        offset = 0
        count = 0
        batch_size = 100
        
        while count < limit:
            try:
                url = f"https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6"
                params = {
                    'api-key': api_key,
                    'format': 'json',
                    'offset': offset,
                    'limit': min(batch_size, limit - count)
                }
                
                response = requests.get(url, params=params, timeout=30)
                data = response.json()
                
                records = data.get('records', [])
                if not records:
                    break
                
                for record in records:
                    pincode = str(int(record.get('pincode', 0)))
                    state = record.get('statename', 'Unknown')
                    district = record.get('Districtname', 'Unknown')
                    
                    # Filter by states if specified
                    if states_filter:
                        states_list = [s.strip() for s in states_filter.split(',')]
                        if state not in states_list:
                            continue
                    
                    if len(pincode) == 6:  # Valid Indian pincode
                        obj, created = ShiprocketPincode.objects.update_or_create(
                            pincode=pincode,
                            defaults={
                                'city': district,
                                'state': state,
                                'zone': self.get_zone(state),
                                'is_serviceable': True,
                                'is_cod_available': True,
                            }
                        )
                        
                        if created:
                            count += 1
                            if count % 100 == 0:
                                self.stdout.write(f"Imported {count}...")
                
                offset += batch_size
                time.sleep(0.5)  # Rate limiting for API
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error at offset {offset}: {e}"))
                break
        
        self.stdout.write(self.style.SUCCESS(f"Imported {count} pincodes from data.gov.in!"))

    def get_zone(self, state):
        """Map states to zones"""
        zones = {
            'North': ['Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
                     'Punjab', 'Rajasthan', 'Uttarakhand', 'Chandigarh'],
            'South': ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 
                     'Telangana', 'Puducherry', 'Lakshadweep'],
            'East': ['Bihar', 'Jharkhand', 'Odisha', 'West Bengal', 
                    'Andaman and Nicobar Islands'],
            'West': ['Goa', 'Gujarat', 'Maharashtra', 'Dadra and Nagar Haveli', 
                    'Daman and Diu'],
            'Central': ['Chhattisgarh', 'Madhya Pradesh', 'Uttar Pradesh'],
            'Northeast': ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 
                         'Mizoram', 'Nagaland', 'Sikkim', 'Tripura']
        }
        
        for zone, states in zones.items():
            if state in states:
                return zone
        return ''
