from django.core.management.base import BaseCommand
from payments.models import ShippingZone, TaxRate


class Command(BaseCommand):
    help = 'Load initial shipping zones and tax rates for India'

    def handle(self, *args, **kwargs):
        self.stdout.write('Loading shipping zones and tax rates...')
        
        # Create shipping zones
        self.create_shipping_zones()
        
        # Create tax rates
        self.create_tax_rates()
        
        self.stdout.write(self.style.SUCCESS('✅ Successfully loaded shipping zones and tax rates!'))
    
    def create_shipping_zones(self):
        """Create shipping zones for India"""
        zones_data = [
            {
                'name': 'Metro Cities',
                'states': ['DL', 'MH', 'KA', 'TN', 'WB'],
                'base_rate': 40.00,
                'per_kg_rate': 10.00,
                'free_shipping_threshold': 500.00
            },
            {
                'name': 'North Zone',
                'states': ['UP', 'PB', 'HR', 'HP', 'JK', 'UK', 'CH'],
                'base_rate': 50.00,
                'per_kg_rate': 15.00,
                'free_shipping_threshold': 750.00
            },
            {
                'name': 'South Zone',
                'states': ['AP', 'TG', 'KL', 'PY'],
                'base_rate': 55.00,
                'per_kg_rate': 15.00,
                'free_shipping_threshold': 750.00
            },
            {
                'name': 'East Zone',
                'states': ['OR', 'JH', 'BR', 'AS', 'SK', 'MN', 'TR', 'ML', 'MZ', 'NL', 'AR'],
                'base_rate': 60.00,
                'per_kg_rate': 20.00,
                'free_shipping_threshold': 1000.00
            },
            {
                'name': 'West Zone',
                'states': ['GJ', 'RJ', 'MP', 'CG', 'GA', 'DD', 'DN'],
                'base_rate': 55.00,
                'per_kg_rate': 15.00,
                'free_shipping_threshold': 750.00
            },
            {
                'name': 'Default',
                'states': [],
                'base_rate': 50.00,
                'per_kg_rate': 15.00,
                'free_shipping_threshold': 500.00
            }
        ]
        
        for zone_data in zones_data:
            zone, created = ShippingZone.objects.get_or_create(
                name=zone_data['name'],
                defaults={
                    'states': zone_data['states'],
                    'base_rate': zone_data['base_rate'],
                    'per_kg_rate': zone_data['per_kg_rate'],
                    'free_shipping_threshold': zone_data['free_shipping_threshold'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created shipping zone: {zone.name}')
    
    def create_tax_rates(self):
        """Create GST tax rates for Indian states"""
        states_data = [
            {'code': 'AN', 'name': 'Andaman and Nicobar Islands'},
            {'code': 'AP', 'name': 'Andhra Pradesh'},
            {'code': 'AR', 'name': 'Arunachal Pradesh'},
            {'code': 'AS', 'name': 'Assam'},
            {'code': 'BR', 'name': 'Bihar'},
            {'code': 'CH', 'name': 'Chandigarh'},
            {'code': 'CG', 'name': 'Chhattisgarh'},
            {'code': 'DN', 'name': 'Dadra and Nagar Haveli'},
            {'code': 'DD', 'name': 'Daman and Diu'},
            {'code': 'DL', 'name': 'Delhi'},
            {'code': 'GA', 'name': 'Goa'},
            {'code': 'GJ', 'name': 'Gujarat'},
            {'code': 'HR', 'name': 'Haryana'},
            {'code': 'HP', 'name': 'Himachal Pradesh'},
            {'code': 'JK', 'name': 'Jammu and Kashmir'},
            {'code': 'JH', 'name': 'Jharkhand'},
            {'code': 'KA', 'name': 'Karnataka'},
            {'code': 'KL', 'name': 'Kerala'},
            {'code': 'LA', 'name': 'Ladakh'},
            {'code': 'LD', 'name': 'Lakshadweep'},
            {'code': 'MP', 'name': 'Madhya Pradesh'},
            {'code': 'MH', 'name': 'Maharashtra'},
            {'code': 'MN', 'name': 'Manipur'},
            {'code': 'ML', 'name': 'Meghalaya'},
            {'code': 'MZ', 'name': 'Mizoram'},
            {'code': 'NL', 'name': 'Nagaland'},
            {'code': 'OR', 'name': 'Odisha'},
            {'code': 'PY', 'name': 'Puducherry'},
            {'code': 'PB', 'name': 'Punjab'},
            {'code': 'RJ', 'name': 'Rajasthan'},
            {'code': 'SK', 'name': 'Sikkim'},
            {'code': 'TN', 'name': 'Tamil Nadu'},
            {'code': 'TG', 'name': 'Telangana'},
            {'code': 'TR', 'name': 'Tripura'},
            {'code': 'UP', 'name': 'Uttar Pradesh'},
            {'code': 'UK', 'name': 'Uttarakhand'},
            {'code': 'WB', 'name': 'West Bengal'},
        ]
        
        for state in states_data:
            tax_rate, created = TaxRate.objects.get_or_create(
                state_code=state['code'],
                defaults={
                    'state_name': state['name'],
                    'cgst_rate': 9.0,  # 9% CGST
                    'sgst_rate': 9.0,  # 9% SGST
                    'igst_rate': 18.0  # 18% IGST
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created tax rate for: {state["name"]}')
