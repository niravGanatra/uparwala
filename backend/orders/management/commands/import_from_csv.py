"""
Import pincodes from CSV file
Much faster than API import!

CSV Format: circlename,regionname,divisionname,officename,pincode,officetype,delivery,district,statename,latitude,longitude

Usage:
  python manage.py import_from_csv /path/to/pincode_data.csv
  python manage.py import_from_csv /path/to/pincode_data.csv --skip-existing
"""

import csv
from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode

class Command(BaseCommand):
    help = 'Import pincodes from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip pincodes that already exist in database'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing pincodes before import (DESTRUCTIVE!)'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=1000,
            help='Number of records to commit per batch (default: 1000)'
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        skip_existing = options['skip_existing']
        clear_data = options['clear']
        batch_size = options['batch_size']
        
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('CSV PINCODE IMPORT'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(f'File: {csv_file}')
        self.stdout.write(f'Skip existing: {skip_existing}')
        self.stdout.write(f'Batch size: {batch_size}')
        
        # Clear existing data if requested
        if clear_data:
            self.stdout.write(self.style.WARNING('\n⚠️  CLEARING ALL EXISTING PINCODES...'))
            count = ShiprocketPincode.objects.count()
            ShiprocketPincode.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'✓ Deleted {count} existing pincodes\n'))
        
        # Load existing pincodes if needed
        existing_pincodes = set()
        if skip_existing:
            self.stdout.write('Loading existing pincodes...')
            existing_pincodes = set(
                ShiprocketPincode.objects.values_list('pincode', flat=True)
            )
            self.stdout.write(f'Found {len(existing_pincodes)} existing pincodes\n')
        
        imported = 0
        skipped = 0
        errors = 0
        batch = []
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                # Detect delimiter (comma or tab)
                sample = f.read(1024)
                f.seek(0)
                
                if '\t' in sample:
                    reader = csv.DictReader(f, delimiter='\t')
                else:
                    reader = csv.DictReader(f)
                
                for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is 1)
                    try:
                        # Extract pincode
                        pincode = str(row.get('pincode', '')).strip()
                        
                        if not pincode or len(pincode) != 6 or not pincode.isdigit():
                            errors += 1
                            continue
                        
                        # Skip if exists
                        if skip_existing and pincode in existing_pincodes:
                            skipped += 1
                            continue
                        
                        # Extract other fields
                        district = row.get('district', 'Unknown').strip()
                        state = row.get('statename', 'Unknown').strip()
                        
                        # Add to batch
                        batch.append(ShiprocketPincode(
                            pincode=pincode,
                            city=district if district else 'Unknown',
                            state=state if state else 'Unknown',
                            zone=self._get_zone(state),
                            is_serviceable=True,
                            is_cod_available=True,
                        ))
                        
                        existing_pincodes.add(pincode)
                        
                        # Commit batch when it reaches batch_size
                        if len(batch) >= batch_size:
                            ShiprocketPincode.objects.bulk_create(batch, ignore_conflicts=True)
                            imported += len(batch)
                            batch = []
                            self.stdout.write(f'✓ Imported {imported} pincodes...')
                        
                    except Exception as e:
                        errors += 1
                        if errors <= 5:  # Show first 5 errors
                            self.stdout.write(self.style.ERROR(
                                f'Row {row_num} error: {e}'
                            ))
                
                # Commit remaining batch
                if batch:
                    ShiprocketPincode.objects.bulk_create(batch, ignore_conflicts=True)
                    imported += len(batch)
                    self.stdout.write(f'✓ Imported {imported} pincodes...')
        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {csv_file}'))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading CSV: {e}'))
            return
        
        # Final summary
        total_in_db = ShiprocketPincode.objects.count()
        
        self.stdout.write('\n' + self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS('IMPORT COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 70))
        self.stdout.write(self.style.SUCCESS(f'New pincodes imported: {imported}'))
        self.stdout.write(self.style.WARNING(f'Skipped (existing/invalid): {skipped}'))
        if errors > 0:
            self.stdout.write(self.style.ERROR(f'Errors: {errors}'))
        self.stdout.write(self.style.SUCCESS(f'Total in database: {total_in_db}'))
        self.stdout.write(self.style.SUCCESS('=' * 70))

    def _get_zone(self, state):
        """Map states to zones (case-insensitive)"""
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
