from django.core.management.base import BaseCommand
from django.core.management import call_command
from users.models import User
from django.contrib.auth.models import Group

class Command(BaseCommand):
    help = 'Seeds the database with all necessary dummy data for the Uparwala application'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🌱 Starting Master Database Seeding...'))

        # 1. Clear Data (Optional, be careful in prod)
        if kwargs.get('clear', False):
            self.stdout.write('Clearing existing data...')
            call_command('flush', '--no-input')

        # 2. Create Users
        self.stdout.write('Creating Users...')
        self.create_users()

        # 3. Create Products & Categories
        self.stdout.write('Creating Products...')
        call_command('populate_dummy_data')

        # 4. Create Services, Pandits & Bookings
        self.stdout.write('Creating Services data...')
        call_command('seed_services')

        # 5. CMS Pages
        self.stdout.write('Updating CMS Pages...')
        call_command('update_cms_pages')

        self.stdout.write(self.style.SUCCESS('✅ Database Seeding Complete!'))

    def create_users(self):
        # Admin
        try:
            if not User.objects.filter(username='admin').exists() and not User.objects.filter(email='admin@example.com').exists():
                User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
                self.stdout.write('  - Created Admin: admin@example.com / admin123')
            else:
                self.stdout.write('  - Admin already exists')
        except Exception as e:
            self.stdout.write(f'  - Error creating admin: {e}')

        # Manager
        try:
            manager, created = User.objects.get_or_create(
                email='manager@test.com',
                defaults={
                    'username': 'manager_test',
                    'first_name': 'Manager',
                    'last_name': 'Test',
                    'is_manager': True,
                    'is_staff': True
                }
            )
            if created:
                manager.set_password('manager123')
                manager.save()
                self.stdout.write('  - Created Manager: manager@test.com / manager123')
            else:
                # Ensure permissions are correct even if user exists
                if not manager.is_manager:
                    manager.is_manager = True
                    manager.save()
                self.stdout.write('  - Manager already exists')
        except Exception as e: 
            self.stdout.write(f'  - Error creating manager: {e}')

        # Pandit
        try:
            pandit, created = User.objects.get_or_create(
                email='sharma@example.com',
                defaults={
                    'username': 'pandit_sharma',
                    'first_name': 'Ramesh',
                    'last_name': 'Sharma',
                    'is_provider': True
                }
            )
            if created:
                pandit.set_password('pandit123')
                pandit.save()
                self.stdout.write('  - Created Pandit: sharma@example.com / pandit123')
            else:
                if not pandit.is_provider:
                    pandit.is_provider = True
                    pandit.save()
                self.stdout.write('  - Pandit already exists')
        except Exception as e:
            self.stdout.write(f'  - Error creating pandit: {e}')

        # Customer
        try:
            customer, created = User.objects.get_or_create(
                email='customer@example.com',
                defaults={
                    'username': 'customer_test',
                    'first_name': 'Raj',
                    'last_name': 'Malhotra'
                }
            )
            if created:
                customer.set_password('customer123')
                customer.save()
                self.stdout.write('  - Created Customer: customer@example.com / customer123')
            else:
                self.stdout.write('  - Customer already exists')
        except Exception as e:
            self.stdout.write(f'  - Error creating customer: {e}')
