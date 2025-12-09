"""
Django management command to create test data for Uparwala marketplace
Creates users, COD pincodes, gift options, and marketing campaigns
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from orders.models import CODPincode, GiftOption
from marketing.models import Campaign
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates test data for Uparwala marketplace'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Creating test data...'))
        
        # 1. Create Admin User
        self.stdout.write('Creating admin user...')
        admin, created = User.objects.get_or_create(
            username='admin',
            email='admin@uparwala.com',
            defaults={
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('✓ Admin user created'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
        
        # 2. Create Vendor User
        self.stdout.write('Creating vendor user...')
        vendor_user, created = User.objects.get_or_create(
            username='testvendor',
            email='vendor@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Vendor',
                'is_staff': False,
            }
        )
        if created:
            vendor_user.set_password('vendor123')
            vendor_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Vendor user created (create vendor profile in admin)'))
        else:
            self.stdout.write(self.style.WARNING('Vendor user already exists'))
        
        # 3. Create Customer User
        self.stdout.write('Creating customer user...')
        try:
            customer, created = User.objects.get_or_create(
                email='customer@test.com',
                defaults={
                    'username': 'testcustomer',
                    'first_name': 'Test',
                    'last_name': 'Customer',
                }
            )
            if created:
                customer.set_password('customer123')
                customer.save()
                self.stdout.write(self.style.SUCCESS('✓ Customer user created'))
            else:
                self.stdout.write(self.style.WARNING('Customer user already exists'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Customer user may already exist: {str(e)}'))
        
        # 4. Create COD Pincodes
        self.stdout.write('Creating COD pincodes...')
        pincodes = [
            {'pincode': '400001', 'city': 'Mumbai', 'state': 'Maharashtra', 'max_order_value': 50000},
            {'pincode': '110001', 'city': 'New Delhi', 'state': 'Delhi', 'max_order_value': 75000},
            {'pincode': '560001', 'city': 'Bangalore', 'state': 'Karnataka', 'max_order_value': 100000},
            {'pincode': '700001', 'city': 'Kolkata', 'state': 'West Bengal', 'max_order_value': 40000},
            {'pincode': '600001', 'city': 'Chennai', 'state': 'Tamil Nadu', 'max_order_value': 60000},
        ]
        
        for pincode_data in pincodes:
            pincode, created = CODPincode.objects.get_or_create(
                pincode=pincode_data['pincode'],
                defaults={
                    'city': pincode_data['city'],
                    'state': pincode_data['state'],
                    'max_order_value': pincode_data['max_order_value'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ COD pincode {pincode_data["pincode"]} ({pincode_data["city"]}) created'))
            else:
                self.stdout.write(self.style.WARNING(f'  COD pincode {pincode_data["pincode"]} already exists'))
        
        # 5. Create Gift Options
        self.stdout.write('Creating gift options...')
        gifts = [
            {
                'name': 'Premium Gift Wrap',
                'description': 'Elegant gold and silver wrapping with ribbon',
                'price': 150.00
            },
            {
                'name': 'Birthday Special',
                'description': 'Colorful birthday-themed wrapping with balloons',
                'price': 200.00
            },
            {
                'name': 'Festival Edition',
                'description': 'Traditional Indian festival wrapping',
                'price': 180.00
            },
            {
                'name': 'Eco-Friendly Wrap',
                'description': 'Sustainable jute and recycled paper wrapping',
                'price': 120.00
            },
        ]
        
        for gift_data in gifts:
            gift, created = GiftOption.objects.get_or_create(
                name=gift_data['name'],
                defaults={
                    'description': gift_data['description'],
                    'price': gift_data['price'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Gift option "{gift_data["name"]}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'  Gift option "{gift_data["name"]}" already exists'))
        
        # 6. Create Marketing Campaigns
        self.stdout.write('Creating marketing campaigns...')
        campaigns = [
            {
                'name': 'Summer Sale 2025',
                'utm_source': 'google',
                'utm_medium': 'cpc',
                'utm_campaign': 'summer_sale_2025',
                'start_date': date(2025, 6, 1),
                'end_date': date(2025, 6, 30),
                'budget': 50000.00,
            },
            {
                'name': 'Facebook Product Launch',
                'utm_source': 'facebook',
                'utm_medium': 'social',
                'utm_campaign': 'product_launch',
                'start_date': date(2025, 1, 1),
                'end_date': date(2025, 12, 31),
                'budget': 100000.00,
            },
            {
                'name': 'Newsletter Subscribers',
                'utm_source': 'newsletter',
                'utm_medium': 'email',
                'utm_campaign': 'weekly_deals',
                'start_date': date(2025, 1, 1),
                'end_date': date(2025, 12, 31),
                'budget': 25000.00,
            },
        ]
        
        for campaign_data in campaigns:
            campaign, created = Campaign.objects.get_or_create(
                name=campaign_data['name'],
                defaults={
                    'utm_source': campaign_data['utm_source'],
                    'utm_medium': campaign_data['utm_medium'],
                    'utm_campaign': campaign_data['utm_campaign'],
                    'start_date': campaign_data['start_date'],
                    'end_date': campaign_data['end_date'],
                    'budget': campaign_data['budget'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Campaign "{campaign_data["name"]}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'  Campaign "{campaign_data["name"]}" already exists'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('✓ Test data creation complete!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\nTest Credentials:')
        self.stdout.write('  Admin:    admin@uparwala.com / admin123')
        self.stdout.write('  Vendor:   vendor@test.com / vendor123')
        self.stdout.write('  Customer: customer@test.com / customer123')
        self.stdout.write('\nAccess URLs:')
        self.stdout.write('  Frontend:      http://localhost:5173/')
        self.stdout.write('  Django Admin:  http://localhost:8000/admin/')
        self.stdout.write('  Vendor Dashboard: http://localhost:5173/vendor/dashboard')
        self.stdout.write('  Admin Dashboard:  http://localhost:5173/admin/dashboard')
        self.stdout.write('\n' + '='*60 + '\n')
