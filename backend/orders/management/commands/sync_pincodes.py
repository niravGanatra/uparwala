import csv
import time
from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode, ShiprocketConfig
from orders.shiprocket_service import ShiprocketService

class Command(BaseCommand):
    help = 'Sync Pincodes from CSV and update Serviceability Status from Shiprocket'

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, help='Path to CSV file (Headers: Pincode, City, State)')
        parser.add_argument('--check', action='store_true', help='Check serviceability with Shiprocket API')
        parser.add_argument('--limit', type=int, default=50, help='Limit number of API checks (default 50)')

    def handle(self, *args, **options):
        csv_file = options['file']
        check_mode = options['check']
        limit = options['limit']

        if csv_file:
            self.import_from_csv(csv_file)

        if check_mode:
            self.check_serviceability(limit)

        if not csv_file and not check_mode:
            self.stdout.write(self.style.WARNING("Please provide --file [path] to import or --check to validate against API."))

    def import_from_csv(self, file_path):
        self.stdout.write(f"Importing from {file_path}...")
        count = 0
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Map CSV headers loosely
                    pincode = row.get('Pincode') or row.get('pincode') or row.get('pin_code')
                    city = row.get('City') or row.get('city') or row.get('District')
                    state = row.get('State') or row.get('state')

                    if pincode and city and state:
                        obj, created = ShiprocketPincode.objects.update_or_create(
                            pincode=pincode,
                            defaults={
                                'city': city,
                                'state': state
                            }
                        )
                        if created:
                            count += 1
                            if count % 100 == 0:
                                self.stdout.write(f"Imported {count} pincodes...")
            
            self.stdout.write(self.style.SUCCESS(f"Successfully imported/updated {count} pincodes."))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Import failed: {e}"))

    def check_serviceability(self, limit):
        self.stdout.write(f"Checking serviceability via Shiprocket API (Limit: {limit})...")
        
        service = ShiprocketService()
        config = ShiprocketConfig.objects.first()
        
        if not config or not config.pickup_pincode:
            self.stdout.write(self.style.ERROR("Shiprocket Configuration invalid or missing Pickup Pincode."))
            return

        # Fetch pincodes that haven't been synced recently (or simplify to just any active ones)
        # For this script, we take first N active pincodes nicely ordered
        queryset = ShiprocketPincode.objects.filter(is_serviceable=True).order_by('last_synced_at')[:limit]
        
        updated_count = 0
        
        for pincode_obj in queryset:
            self.stdout.write(f"Checking {pincode_obj.pincode} ({pincode_obj.city})...", ending='')
            
            # Check serviceability
            # Using 0.5kg as standard weight
            couriers = service.check_serviceability(
                pickup_pincode=config.pickup_pincode,
                delivery_pincode=pincode_obj.pincode,
                weight=0.5,
                cod=1 # Check if COD is supported
            )
            
            # Logic:
            # If couriers list is empty -> Not Serviceable
            # If couriers exist -> Serviceable
            # Check COD support in courier list
            
            is_serviceable = False
            is_cod_available = False
            
            if couriers and len(couriers) > 0:
                is_serviceable = True
                # Check if any courier supports COD
                # Response schema: [{'cod': 1, ...}, {'cod': 0, ...}]
                # Usually checks the 'cod' flag (1=Yes, 0=No)
                for c in couriers:
                    if str(c.get('cod', '0')) == '1':
                        is_cod_available = True
                        break
            
            # Update DB
            pincode_obj.is_serviceable = is_serviceable
            pincode_obj.is_cod_available = is_cod_available
            pincode_obj.save() # Updates last_synced_at automatically
            
            status_emoji = "✅" if is_serviceable else "❌"
            cod_emoji = "💰" if is_cod_available else "no-cod"
            self.stdout.write(f" {status_emoji} {cod_emoji}")
            
            updated_count += 1
            # Rate limit politeness
            time.sleep(0.2)
            
        self.stdout.write(self.style.SUCCESS(f"Updated {updated_count} pincodes."))
