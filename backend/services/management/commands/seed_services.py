"""
Management command to seed dummy data for the Pandit Booking module.
Usage: python manage.py seed_services
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds dummy data for the Pandit Booking (services) module'

    def handle(self, *args, **options):
        from services.models import Service, PanditProfile, KYCDocument, ServiceBooking
        
        self.stdout.write('Seeding Pandit Booking module data...')
        
        # Create Services
        services_data = [
            {
                'name': 'Satyanarayan Puja',
                'description': 'Traditional Satyanarayan Katha and Puja for prosperity and well-being.',
                'duration_minutes': 120,
                'base_price': Decimal('2100.00'),
                'required_samagri_list': [
                    {'item': 'Haldi', 'qty': '50g'},
                    {'item': 'Kumkum', 'qty': '25g'},
                    {'item': 'Rice', 'qty': '500g'},
                    {'item': 'Coconut', 'qty': '2'},
                    {'item': 'Flowers', 'qty': '1 bunch'},
                ],
            },
            {
                'name': 'Griha Pravesh Puja',
                'description': 'House warming ceremony to invoke blessings for your new home.',
                'duration_minutes': 180,
                'base_price': Decimal('5100.00'),
                'required_samagri_list': [
                    {'item': 'Haldi', 'qty': '100g'},
                    {'item': 'Ghee', 'qty': '250ml'},
                    {'item': 'Camphor', 'qty': '50g'},
                    {'item': 'Mango leaves', 'qty': '20'},
                    {'item': 'Kalash', 'qty': '1'},
                ],
            },
            {
                'name': 'Ganesh Puja',
                'description': 'Worship of Lord Ganesha for removing obstacles and new beginnings.',
                'duration_minutes': 60,
                'base_price': Decimal('1100.00'),
                'required_samagri_list': [
                    {'item': 'Modak', 'qty': '5'},
                    {'item': 'Durva grass', 'qty': '21 blades'},
                    {'item': 'Red flowers', 'qty': '1 bunch'},
                ],
            },
            {
                'name': 'Navgraha Shanti Puja',
                'description': 'Planetary worship to pacify negative planetary influences.',
                'duration_minutes': 150,
                'base_price': Decimal('3500.00'),
                'required_samagri_list': [
                    {'item': 'Navgraha Yantra', 'qty': '1'},
                    {'item': 'Nine different grains', 'qty': '100g each'},
                    {'item': 'Ghee', 'qty': '500ml'},
                ],
            },
            {
                'name': 'Lakshmi Puja',
                'description': 'Worship of Goddess Lakshmi for wealth and prosperity.',
                'duration_minutes': 90,
                'base_price': Decimal('1500.00'),
                'required_samagri_list': [
                    {'item': 'Lotus flowers', 'qty': '11'},
                    {'item': 'Coins', 'qty': '11'},
                    {'item': 'Sweets', 'qty': '500g'},
                ],
            },
            {
                'name': 'Rudrabhishek',
                'description': 'Sacred abhishek of Lord Shiva with various holy items.',
                'duration_minutes': 180,
                'base_price': Decimal('4500.00'),
                'required_samagri_list': [
                    {'item': 'Milk', 'qty': '2L'},
                    {'item': 'Honey', 'qty': '250ml'},
                    {'item': 'Curd', 'qty': '500g'},
                    {'item': 'Bilva leaves', 'qty': '108'},
                ],
            },
        ]
        
        services = []
        for data in services_data:
            service, created = Service.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            services.append(service)
            if created:
                self.stdout.write(f'  Created service: {service.name}')
        
        # Create Pandit users and profiles
        pandits_data = [
            {
                'username': 'pandit_sharma',
                'email': 'sharma@example.com',
                'first_name': 'Ramesh',
                'last_name': 'Sharma',
                'phone': '9876543210',
                'bio': 'Experienced Vedic scholar with 15 years of practice. Specializing in all types of homam and puja.',
                'years_experience': 15,
                'languages_spoken': ['Hindi', 'Sanskrit', 'English'],
                'serviceable_pincodes': ['400001', '400002', '400003', '400004', '400005'],
                'verification_status': 'verified',
            },
            {
                'username': 'pandit_mishra',
                'email': 'mishra@example.com',
                'first_name': 'Suresh',
                'last_name': 'Mishra',
                'phone': '9876543211',
                'bio': 'Traditional Brahmin from Varanasi. Expert in Satyanarayan Katha and Griha Pravesh ceremonies.',
                'years_experience': 20,
                'languages_spoken': ['Hindi', 'Sanskrit', 'Bhojpuri'],
                'serviceable_pincodes': ['400001', '400006', '400007', '400008'],
                'verification_status': 'verified',
            },
            {
                'username': 'pandit_trivedi',
                'email': 'trivedi@example.com',
                'first_name': 'Anand',
                'last_name': 'Trivedi',
                'phone': '9876543212',
                'bio': 'Young and dynamic priest. Combines traditional rituals with modern convenience.',
                'years_experience': 8,
                'languages_spoken': ['Hindi', 'English', 'Gujarati'],
                'serviceable_pincodes': ['400002', '400003', '400009', '400010'],
                'verification_status': 'verified',
            },
            {
                'username': 'pandit_joshi',
                'email': 'joshi@example.com',
                'first_name': 'Prakash',
                'last_name': 'Joshi',
                'phone': '9876543213',
                'bio': 'Pending verification - recently joined the platform.',
                'years_experience': 5,
                'languages_spoken': ['Hindi', 'Marathi'],
                'serviceable_pincodes': ['400011', '400012'],
                'verification_status': 'pending',
            },
        ]
        
        pandit_profiles = []
        for data in pandits_data:
            user, created = User.objects.get_or_create(
                username=data['username'],
                defaults={
                    'email': data['email'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'phone': data['phone'],
                    'is_provider': True,
                }
            )
            if created:
                user.set_password('pandit123')
                user.save()
                self.stdout.write(f'  Created user: {user.username}')
            
            profile, created = PanditProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': data['bio'],
                    'years_experience': data['years_experience'],
                    'languages_spoken': data['languages_spoken'],
                    'serviceable_pincodes': data['serviceable_pincodes'],
                    'verification_status': data['verification_status'],
                    'is_online': data['verification_status'] == 'verified',
                    'latitude': Decimal('19.0760') + Decimal(str(random.uniform(-0.05, 0.05))),
                    'longitude': Decimal('72.8777') + Decimal(str(random.uniform(-0.05, 0.05))),
                    'verified_at': timezone.now() if data['verification_status'] == 'verified' else None,
                }
            )
            
            # Add specializations
            if created:
                profile.specializations.set(random.sample(services, k=min(3, len(services))))
                self.stdout.write(f'  Created Pandit profile: {profile}')
            
            pandit_profiles.append(profile)
        
        # Create a customer user for bookings
        customer, created = User.objects.get_or_create(
            username='test_customer',
            defaults={
                'email': 'customer@example.com',
                'first_name': 'Test',
                'last_name': 'Customer',
                'phone': '9999999999',
            }
        )
        if created:
            customer.set_password('customer123')
            customer.save()
            self.stdout.write(f'  Created customer: {customer.username}')
        
        # Create sample bookings
        verified_pandits = [p for p in pandit_profiles if p.verification_status == 'verified']
        
        booking_statuses = ['requested', 'accepted', 'on_the_way', 'in_progress', 'completed']
        
        for i, status in enumerate(booking_statuses):
            pandit = verified_pandits[i % len(verified_pandits)]
            service = random.choice(services)
            
            booking, created = ServiceBooking.objects.get_or_create(
                customer=customer,
                pandit=pandit,
                service=service,
                booking_date=timezone.now().date(),
                booking_time=timezone.now().time(),
                defaults={
                    'address': f'{100 + i} Sample Street, Mumbai',
                    'pincode': '400001',
                    'status': status,
                    'base_amount': service.base_price,
                    'convenience_fee': service.base_price * Decimal('0.05'),
                    'total_amount': service.base_price * Decimal('1.05'),
                    'payment_status': 'paid' if status in ['accepted', 'on_the_way', 'in_progress', 'completed'] else 'pending',
                }
            )
            if created:
                self.stdout.write(f'  Created booking #{booking.id}: {status}')
        
        self.stdout.write(self.style.SUCCESS('\n✅ Successfully seeded Pandit Booking module data!'))
        self.stdout.write('\nTest credentials:')
        self.stdout.write('  Pandit: pandit_sharma / pandit123')
        self.stdout.write('  Customer: test_customer / customer123')
        self.stdout.write('\nAccess Pandit Dashboard at: /pandit/dashboard')
