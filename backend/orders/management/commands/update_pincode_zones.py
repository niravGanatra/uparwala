"""
Update zones for all existing pincode records
Run this once to fix the zone field for records that have empty zones

Usage:
  python manage.py update_pincode_zones
"""

from django.core.management.base import BaseCommand
from orders.shiprocket_models import ShiprocketPincode

class Command(BaseCommand):
    help = 'Update zone information for all pincodes based on their state'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('UPDATING PINCODE ZONES'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        # Get all pincodes
        pincodes = ShiprocketPincode.objects.all()
        total = pincodes.count()
        updated = 0
        
        self.stdout.write(f'Found {total} pincodes to process\n')
        
        for pincode_obj in pincodes:
            zone = self._get_zone(pincode_obj.state)
            if zone != pincode_obj.zone:
                pincode_obj.zone = zone
                pincode_obj.save(update_fields=['zone'])
                updated += 1
                
                if updated % 100 == 0:
                    self.stdout.write(f'Updated {updated} zones...')
        
        self.stdout.write('\n' + self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(f'COMPLETE: Updated {updated} out of {total} records'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

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
