import os
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from services.models import Service, PanditProfile, ServiceBooking
from analytics.models import AnalyticsEvent

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds remote database with dummy Pandit booking data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Starting remote data seeding...'))
        
        # 1. Ensure Users Exist
        self.stdout.write('Creating/Verifying Users...')
        
        # Admin
        admin, _ = User.objects.get_or_create(
            email='admin@uparwala.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        if _: admin.set_password('admin123'); admin.save()

        # Manager
        manager, _ = User.objects.get_or_create(
            email='manager@uparwala.com',
            defaults={
                'username': 'manager',
                'first_name': 'Manager',
                'last_name': 'Singh',
                'is_staff': True,
                'is_active': True
            }
        )
        if _: manager.set_password('manager123'); manager.save()

        # Pandit
        pandit_user, _ = User.objects.get_or_create(
            email='pandit@uparwala.com',
            defaults={
                'username': 'pandit_sharma',
                'first_name': 'Pandit',
                'last_name': 'Sharma',
                'is_provider': True,
                'is_active': True
            }
        )
        if _: pandit_user.set_password('pandit123'); pandit_user.save()

        # Customer
        customer, _ = User.objects.get_or_create(
            email='customer@uparwala.com',
            defaults={
                'username': 'rahul_verma',
                'first_name': 'Rahul',
                'last_name': 'Verma',
                'is_active': True
            }
        )
        if _: customer.set_password('customer123'); customer.save()

        # 2. Ensure Services Exist
        self.stdout.write('Creating Services...')
        services_data = [
            {'name': 'Satyanarayan Puja', 'base_price': 2100, 'duration_minutes': 120, 'slug': 'satyanarayan-puja'},
            {'name': 'Ganesh Puja', 'base_price': 1100, 'duration_minutes': 60, 'slug': 'ganesh-puja'},
            {'name': 'Griha Pravesh', 'base_price': 5100, 'duration_minutes': 180, 'slug': 'griha-pravesh-puja'},
            {'name': 'Lakshmi Puja', 'base_price': 3100, 'duration_minutes': 90, 'slug': 'lakshmi-puja'},
        ]
        
        services = []
        for s_data in services_data:
            service, _ = Service.objects.get_or_create(
                slug=s_data['slug'],
                defaults={
                    'name': s_data['name'],
                    'base_price': s_data['base_price'],
                    'duration_minutes': s_data['duration_minutes'],
                    'description': f"Divine {s_data['name']} performed by Vedic pandits.",
                    'is_active': True
                }
            )
            services.append(service)

        # 3. Setup Pandit Profile
        self.stdout.write('Setting up Pandit Profile...')
        pandit_profile, _ = PanditProfile.objects.get_or_create(
            user=pandit_user,
            defaults={
                'verification_status': 'verified',
                'years_experience': 15,
                'languages_spoken': ['Hindi', 'Sanskrit'],
                'is_online': True
            }
        )
        # Verify if not already
        if pandit_profile.verification_status != 'verified':
            pandit_profile.verification_status = 'verified'
            pandit_profile.save()
            
        # Add specializations
        for s in services:
            pandit_profile.specializations.add(s)

        # 4. Create Bookings
        self.stdout.write('Creating Dummy Bookings...')
        
        now = timezone.now()
        
        # Booking 1: Requested (Future)
        ServiceBooking.objects.get_or_create(
            customer=customer,
            service=services[0], # Satyanarayan
            booking_date=(now + timedelta(days=2)).date(),
            defaults={
                'pandit': pandit_profile,
                'booking_time': '10:00:00',
                'status': 'requested',
                'base_amount': 2100,
                'total_amount': 2150,
                'pincode': '400001',
                'address': 'Flat 402, Krishna Heights, Mumbai'
            }
        )

        # Booking 2: Confirmed (Tomorrow)
        ServiceBooking.objects.get_or_create(
            customer=customer,
            service=services[1], # Ganesh Puja
            booking_date=(now + timedelta(days=1)).date(),
            defaults={
                'pandit': pandit_profile,
                'booking_time': '09:00:00',
                'status': 'confirmed',
                'base_amount': 1100,
                'total_amount': 1150,
                'pincode': '400001',
                'address': 'B-12, Sector 4, Mumbai'
            }
        )
        
        # Booking 3: Completed (Past)
        booking_completed, _ = ServiceBooking.objects.get_or_create(
            customer=customer,
            service=services[2], # Griha Pravesh
            booking_date=(now - timedelta(days=5)).date(),
            defaults={
                'pandit': pandit_profile,
                'booking_time': '07:00:00',
                'status': 'completed',
                'base_amount': 5100,
                'total_amount': 5150,
                'pincode': '400001',
                'address': 'Villa 22, Green Valley, Mumbai',
                'completed_at': now - timedelta(days=5)
            }
        )
        
        # Booking 4: In Progress (Today) - For Live Tracking
        booking_live, _ = ServiceBooking.objects.get_or_create(
            customer=customer,
            service=services[3], # Lakshmi Puja
            booking_date=now.date(),
            defaults={
                'pandit': pandit_profile,
                'booking_time': '18:00:00',
                'status': 'in_progress',
                'base_amount': 3100,
                'total_amount': 3150,
                'pincode': '400001',
                'address': 'Shop 5, Main Market, Mumbai',
                'otp_start': '1234',
                'otp_end': '5678',
                'service_started_at': now - timedelta(minutes=30)
            }
        )

        # Update stats
        pandit_profile.total_bookings_completed = ServiceBooking.objects.filter(pandit=pandit_profile, status='completed').count()
        pandit_profile.save()

        self.stdout.write(self.style.SUCCESS('Successfully seeded remote database!'))
