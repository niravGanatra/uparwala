"""
One-time script to populate production database with Indian pincodes.
Run this via Railway CLI or Django shell on production.

Usage:
  railway run python manage.py populate_production_pincodes
  
Or via Railway dashboard shell:
  python manage.py populate_production_pincodes
"""

import requests
import time
from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode


class Command(BaseCommand):
    help = 'Populate production database with Indian pincodes from data.gov.in'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=500, help='Number of pincodes to import')

    def handle(self, *args, **options):
        limit = options['limit']
        
        self.stdout.write(self.style.WARNING('=' * 60))
        self.stdout.write(self.style.WARNING('PRODUCTION DATABASE POPULATION'))
        self.stdout.write(self.style.WARNING('=' * 60))
        
        # Data.gov.in API configuration
        api_key = '579b464db66ec23bdd000001f17ca38f88df4c4a6449db80d254a78f'
        url = 'https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6'
        
        count = 0
        total_count = 0
        batch_size = 100
        
        self.stdout.write(f"Fetching pincodes from data.gov.in (limit: {limit})...")
        
        for offset in range(0, limit, batch_size):
            try:
                params = {
                    'api-key': api_key,
                    'format': 'json',
                    'offset': offset,
                    'limit': min(batch_size, limit - offset)
                }
                
                response = requests.get(url, params=params, timeout=30)
                data = response.json()
                records = data.get('records', [])
                
                if not records:
                    self.stdout.write(self.style.WARNING(f"No more records at offset {offset}"))
                    break
                
                for record in records:
                    pincode = str(int(record.get('pincode', 0)))
                    state = record.get('statename', 'Unknown')
                    district = record.get('Districtname', 'Unknown')
                    
                    if len(pincode) == 6:  # Valid Indian pincode
                        obj, created = ShiprocketPincode.objects.get_or_create(
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
                            total_count += 1
                            
                            if count % 50 == 0:
                                self.stdout.write(f"✓ Imported {total_count} pincodes...")
                
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error at offset {offset}: {e}"))
                continue
        
        # Final summary
        final_count = ShiprocketPincode.objects.count()
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS(f'IMPORT COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(f'New pincodes imported: {total_count}'))
        self.stdout.write(self.style.SUCCESS(f'Total in database: {final_count}'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Show sample data
        self.stdout.write('\nSample data:')
        samples = ShiprocketPincode.objects.all()[:5]
        for sample in samples:
            self.stdout.write(f"  {sample.pincode} - {sample.city}, {sample.state}")

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
