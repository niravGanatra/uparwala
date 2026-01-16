import csv
import os
from django.core.management.base import BaseCommand, CommandError
from orders.models import ServiceablePincode

class Command(BaseCommand):
    help = 'Import serviceable locations from a CSV file (State, City, ZipCode, Area)'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Absolute path to the CSV file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            raise CommandError(f'File "{file_path}" does not exist')
            
        self.stdout.write(f"Importing from {file_path}...")
        
        count = 0
        updated = 0
        skipped = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as csvfile:
                # Use DictReader for flexibility, but handle header variations
                reader = csv.DictReader(csvfile)
                
                # Check headers to map them correctly
                headers = reader.fieldnames
                self.stdout.write(f"Found headers: {headers}")
                
                # Map expected internal names to CSV headers
                map_pincode = next((h for h in headers if 'zip' in h.lower() or 'pin' in h.lower()), None)
                map_city = next((h for h in headers if 'city' in h.lower() or 'district' in h.lower()), None)
                map_state = next((h for h in headers if 'state' in h.lower()), None)
                map_area = next((h for h in headers if 'area' in h.lower() or 'locality' in h.lower()), None)
                
                if not all([map_pincode, map_city, map_state]):
                    raise CommandError("CSV must contain columns for ZipCode, City, and State. Area is optional.")
                
                for row in reader:
                    pincode = row.get(map_pincode, '').strip()
                    city = row.get(map_city, '').strip()
                    state = row.get(map_state, '').strip()
                    area = row.get(map_area, '').strip() if map_area else None
                    
                    if not pincode:
                        skipped += 1
                        continue
                        
                    # Prepare defaults
                    defaults = {
                        'city': city,
                        'state': state,
                        'is_active': True
                    }
                    
                    # If we have area, we include it in the lookup to support multiple areas per pincode
                    if area:
                        obj, created = ServiceablePincode.objects.update_or_create(
                            pincode=pincode,
                            area=area,
                            defaults=defaults
                        )
                    else:
                        # If no area is provided in CSV, checks if we should create a generic pincode entry
                        # or update generic one.
                        # However, because we removed unique logic on pincode, update_or_create on JUST pincode
                        # might fail if multiple records exist with that pincode (with different areas).
                        # So we default local area to NULL/Empty.
                        obj, created = ServiceablePincode.objects.update_or_create(
                            pincode=pincode,
                            area__isnull=True, # Look for entry with NO area
                            defaults=defaults
                        )
                    
                    if created:
                        count += 1
                    else:
                        updated += 1
                        
                    if (count + updated) % 100 == 0:
                        self.stdout.write(f"Processed {count + updated} records...")
                        
        except Exception as e:
            raise CommandError(f"Error importing CSV: {e}")
            
        self.stdout.write(self.style.SUCCESS(f"Done! Created: {count}, Updated: {updated}, Skipped: {skipped}"))
