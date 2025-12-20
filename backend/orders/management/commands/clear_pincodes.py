"""
Delete all pincodes from the database

Usage:
  python manage.py clear_pincodes
  python manage.py clear_pincodes --confirm
"""

from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode

class Command(BaseCommand):
    help = 'Delete all pincodes from the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        count = ShiprocketPincode.objects.count()
        
        if count == 0:
            self.stdout.write(self.style.WARNING('No pincodes found in database'))
            return
        
        # Ask for confirmation unless --confirm is provided
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(f'\n⚠️  WARNING: This will DELETE ALL {count} pincodes!'))
            response = input('Are you sure? Type "yes" to confirm: ')
            
            if response.lower() != 'yes':
                self.stdout.write(self.style.ERROR('Aborted'))
                return
        
        self.stdout.write(self.style.WARNING(f'\nDeleting {count} pincodes...'))
        ShiprocketPincode.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('✓ All pincodes deleted successfully'))
        self.stdout.write(self.style.SUCCESS(f'Deleted: {count} records\n'))
