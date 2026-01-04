"""
Management command to sync all existing vendors as Delhivery warehouses.

Run this once during migration from Shiprocket to Delhivery to register
all vendor pickup locations.

Usage:
    python manage.py sync_delhivery_warehouses
    python manage.py sync_delhivery_warehouses --dry-run
    python manage.py sync_delhivery_warehouses --vendor-id=123
"""
from django.core.management.base import BaseCommand
from vendors.models import VendorProfile


class Command(BaseCommand):
    help = 'Register all vendor addresses as Delhivery warehouses'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview which vendors would be synced without making API calls',
        )
        parser.add_argument(
            '--vendor-id',
            type=int,
            help='Sync only a specific vendor by ID',
        )
        parser.add_argument(
            '--skip-existing',
            action='store_true',
            help='Skip vendors that already have a Delhivery warehouse name',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        vendor_id = options['vendor_id']
        skip_existing = options['skip_existing']

        # Get vendors to sync
        queryset = VendorProfile.objects.filter(
            verification_status='verified'  # Only sync approved vendors
        )
        
        if vendor_id:
            queryset = queryset.filter(id=vendor_id)
        
        if skip_existing:
            queryset = queryset.filter(delhivery_warehouse_name='')
        
        # Filter vendors with complete address info
        vendors_to_sync = []
        vendors_skipped = []
        
        for vendor in queryset:
            if all([
                vendor.phone,
                vendor.address,
                vendor.city,
                vendor.state,
                vendor.zip_code
            ]):
                vendors_to_sync.append(vendor)
            else:
                vendors_skipped.append(vendor)

        self.stdout.write(
            f"\nFound {len(vendors_to_sync)} vendors with complete addresses"
        )
        if vendors_skipped:
            self.stdout.write(
                self.style.WARNING(
                    f"Skipping {len(vendors_skipped)} vendors with incomplete addresses"
                )
            )

        if dry_run:
            self.stdout.write(self.style.NOTICE("\n=== DRY RUN MODE ===\n"))
            for vendor in vendors_to_sync:
                self.stdout.write(
                    f"  Would sync: {vendor.store_name} (ID: {vendor.id}) "
                    f"-> VENDOR_{vendor.id}"
                )
            self.stdout.write(self.style.NOTICE("\nNo API calls made."))
            return

        # Import service only when needed (avoids import errors if token not set)
        try:
            from orders.delhivery_service import DelhiveryService
            service = DelhiveryService()
        except ValueError as e:
            self.stdout.write(
                self.style.ERROR(f"\nConfiguration Error: {e}")
            )
            self.stdout.write(
                "Please set DELHIVERY_TOKEN in your environment variables."
            )
            return

        # Sync each vendor
        success_count = 0
        failure_count = 0

        self.stdout.write("\nSyncing vendors to Delhivery...\n")

        for vendor in vendors_to_sync:
            warehouse_name = f"VENDOR_{vendor.id}"
            
            try:
                result = service.register_vendor_warehouse(vendor)
                
                if result:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  ✓ {vendor.store_name} -> {warehouse_name}"
                        )
                    )
                    success_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"  ✗ {vendor.store_name} - Registration failed"
                        )
                    )
                    failure_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f"  ✗ {vendor.store_name} - Error: {str(e)}"
                    )
                )
                failure_count += 1

        # Summary
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(
            self.style.SUCCESS(f"Successfully registered: {success_count}")
        )
        if failure_count:
            self.stdout.write(
                self.style.ERROR(f"Failed: {failure_count}")
            )
        if vendors_skipped:
            self.stdout.write(
                self.style.WARNING(
                    f"Skipped (incomplete address): {len(vendors_skipped)}"
                )
            )
        self.stdout.write("=" * 50 + "\n")
