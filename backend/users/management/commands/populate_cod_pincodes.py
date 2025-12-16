from django.core.management.base import BaseCommand
from orders.models import CODPincode


class Command(BaseCommand):
    help = 'Populate COD serviceable pincodes for testing'

    def handle(self, *args, **kwargs):
        # Major city pincodes that should support COD
        test_pincodes = [
            # Delhi
            {'pincode': '110001', 'city': 'New Delhi', 'state': 'Delhi', 'is_cod_available': True},
            {'pincode': '110002', 'city': 'New Delhi', 'state': 'Delhi', 'is_cod_available': True},
            {'pincode': '110005', 'city': 'New Delhi', 'state': 'Delhi', 'is_cod_available': True},
            {'pincode': '110016', 'city': 'New Delhi', 'state': 'Delhi', 'is_cod_available': True},
            
            # Mumbai
            {'pincode': '400001', 'city': 'Mumbai', 'state': 'Maharashtra', 'is_cod_available': True},
            {'pincode': '400050', 'city': 'Mumbai', 'state': 'Maharashtra', 'is_cod_available': True},
            {'pincode': '400051', 'city': 'Mumbai', 'state': 'Maharashtra', 'is_cod_available': True},
            {'pincode': '400070', 'city': 'Mumbai', 'state': 'Maharashtra', 'is_cod_available': True},
            
            # Bangalore
            {'pincode': '560001', 'city': 'Bangalore', 'state': 'Karnataka', 'is_cod_available': True},
            {'pincode': '560002', 'city': 'Bangalore', 'state': 'Karnataka', 'is_cod_available': True},
            {'pincode': '560025', 'city': 'Bangalore', 'state': 'Karnataka', 'is_cod_available': True},
            {'pincode': '560100', 'city': 'Bangalore', 'state': 'Karnataka', 'is_cod_available': True},
            
            # Ahmedabad (Gujarat)
            {'pincode': '380001', 'city': 'Ahmedabad', 'state': 'Gujarat', 'is_cod_available': True},
            {'pincode': '380009', 'city': 'Ahmedabad', 'state': 'Gujarat', 'is_cod_available': True},
            {'pincode': '380015', 'city': 'Ahmedabad', 'state': 'Gujarat', 'is_cod_available': True},
            
            # Pune
            {'pincode': '411001', 'city': 'Pune', 'state': 'Maharashtra', 'is_cod_available': True},
            {'pincode': '411005', 'city': 'Pune', 'state': 'Maharashtra', 'is_cod_available': True},
            
            # Hyderabad
            {'pincode': '500001', 'city': 'Hyderabad', 'state': 'Telangana', 'is_cod_available': True},
            {'pincode': '500016', 'city': 'Hyderabad', 'state': 'Telangana', 'is_cod_available': True},
            
            # Chennai
            {'pincode': '600001', 'city': 'Chennai', 'state': 'Tamil Nadu', 'is_cod_available': True},
            {'pincode': '600020', 'city': 'Chennai', 'state': 'Tamil Nadu', 'is_cod_available': True},
        ]

        created_count = 0
        updated_count = 0
        
        for pincode_data in test_pincodes:
            obj, created = CODPincode.objects.update_or_create(
                pincode=pincode_data['pincode'],
                defaults={
                    'city': pincode_data['city'],
                    'state': pincode_data['state'],
                    'is_active': True,
                    'max_order_value': 50000.00  # Set max COD order value to 50k
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully added/updated COD pincodes:\n'
                f'  Created: {created_count}\n'
                f'  Updated: {updated_count}\n'
                f'  Total: {len(test_pincodes)}'
            )
        )
