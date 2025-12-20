"""
Comprehensive pincode sync script that fetches ALL pincodes from data.gov.in
Skips existing pincodes and shows progress
Can resume from where it left off

Usage:
  python manage.py sync_all_pincodes
  python manage.py sync_all_pincodes --max 5000  # Limit to 5000 new imports
"""

import requests
import time
from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode

class Command(BaseCommand):
    help = 'Sync ALL pincodes from data.gov.in, skipping existing ones'

    def add_arguments(self, parser):
        parser.add_argument(
            '--max',
            type=int,
            default=None,
            help='Maximum number of NEW pincodes to import (default: unlimited)'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to fetch per API call (default: 100)'
        )

    def handle(self, *args, **options):
        max_new = options['max']
        batch_size = options['batch_size']
        
        api_key = '579b464db66ec23bdd000001f17ca38f88df4c4a6449db80d254a78f'
        url = 'https://api.data.gov.in/resource/6176ee09-3d56-4a3b-8115-21841576b2f6'
        
        # Get existing pincodes to skip them
        self.stdout.write('Loading existing pincodes from database...')
        existing_pincodes = set(
            ShiprocketPincode.objects.values_list('pincode', flat=True)
        )
        self.stdout.write(f'Found {len(existing_pincodes)} existing pincodes\n')
        
        offset = 0
        new_count = 0
        skipped_count = 0
        total_fetched = 0
        
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('COMPREHENSIVE PINCODE SYNC'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        
        while True:
            # Stop if we've reached the max new imports
            if max_new and new_count >= max_new:
                self.stdout.write(self.style.WARNING(f'\nReached maximum of {max_new} new imports'))
                break
            
            try:
                params = {
                    'api-key': api_key,
                    'format': 'json',
                    'offset': offset,
                    'limit': batch_size
                }
                
                self.stdout.write(f'Fetching batch at offset {offset}...', ending=' ')
                response = requests.get(url, params=params, timeout=30)
                data = response.json()
                
                records = data.get('records', [])
                
                if not records:
                    self.stdout.write(self.style.WARNING('No more records'))
                    break
                
                total_fetched += len(records)
                batch_new = 0
                batch_skipped = 0
                
                for record in records:
                    try:
                        pincode = str(int(record.get('pincode', 0)))
                        
                        if len(pincode) != 6:
                            continue  # Invalid pincode
                        
                        if pincode in existing_pincodes:
                            batch_skipped += 1
                            skipped_count += 1
                            continue  # Already exists
                        
                        # Stop if we've hit the max
                        if max_new and new_count >= max_new:
                            break
                        
                        # Create new pincode
                        ShiprocketPincode.objects.create(
                            pincode=pincode,
                            city=record.get('Districtname', 'Unknown'),
                            state=record.get('statename', 'Unknown'),
                            zone=self._get_zone(record.get('statename', '')),
                            is_serviceable=True,
                            is_cod_available=True,
                        )
                        
                        existing_pincodes.add(pincode)  # Track for future batches
                        batch_new += 1
                        new_count += 1
                        
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'\nError processing record: {e}'))
                        continue
                
                self.stdout.write(
                    self.style.SUCCESS(f'✓ {batch_new} new') + ', ' +
                    self.style.WARNING(f'{batch_skipped} skipped')
                )
                
                # Progress summary every 10 batches
                if (offset // batch_size + 1) % 10 == 0:
                    self.stdout.write(self.style.SUCCESS(
                        f'\n[PROGRESS] Total: {total_fetched} fetched | '
                        f'{new_count} new | {skipped_count} skipped\n'
                    ))
                
                offset += batch_size
                
                # Rate limiting - be nice to the API
                time.sleep(0.5)
                
            except requests.RequestException as e:
                self.stdout.write(self.style.ERROR(f'\nAPI Error: {e}'))
                self.stdout.write('Retrying in 5 seconds...')
                time.sleep(5)
                continue
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'\nUnexpected error: {e}'))
                break
        
        # Final summary
        final_total = ShiprocketPincode.objects.count()
        
        self.stdout.write('\n' + self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('SYNC COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(f'Records fetched from API: {total_fetched}')
        self.stdout.write(self.style.SUCCESS(f'New pincodes imported: {new_count}'))
        self.stdout.write(self.style.WARNING(f'Existing pincodes skipped: {skipped_count}'))
        self.stdout.write(self.style.SUCCESS(f'Total in database: {final_total}'))
        self.stdout.write(self.style.SUCCESS('=' * 70))

    def _get_zone(self, state):
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
