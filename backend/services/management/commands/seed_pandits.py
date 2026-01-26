import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from services.models import Service, PanditProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with fake Pandit data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding Pandits...')
        
        # 1. Create Services if they don't exist
        service_names = [
            ("Satyanarayan Puja", 2100),
            ("Griha Pravesh", 5100),
            ("Ganesh Puja", 1100),
            ("Laxmi Puja", 1500),
            ("Wedding Ceremony", 21000),
            ("Engagement Puja", 5100),
            ("Navagraha Puja", 3100),
            ("Mundan Sanskar", 2100),
        ]
        
        services = []
        for name, price in service_names:
            service, created = Service.objects.get_or_create(
                name=name,
                defaults={
                    'duration_minutes': 120,
                    'base_price': price,
                    'description': f"Tradtional {name} performed by experienced Vedic Pandits.",
                    'is_active': True
                }
            )
            services.append(service)
            if created:
                self.stdout.write(f"Created Service: {name}")

        # 2. Define Locations (City Center Lat, Lng)
        cities = {
            "Mumbai": (19.0760, 72.8777),
            "Delhi": (28.7041, 77.1025),
            "Bangalore": (12.9716, 77.5946),
            "Ahmedabad": (23.0225, 72.5714),
            "Pune": (18.5204, 73.8567),
        }

        # 3. Names
        first_names = ["Rajesh", "Suresh", "Ramesh", "Mahesh", "Dinesh", "Amit", "Sumit", "Vijay", "Ajay", "Sanjay"]
        last_names = ["Sharma", "Trivedi", "Pandey", "Shukla", "Mishra", "Joshi", "Bhat", "Iyer", "Acharya", "Upadhyay"]

        # 4. Create Pandits
        count = 0
        for city_name, (base_lat, base_lng) in cities.items():
            for _ in range(4): # 4 pandits per city
                first = random.choice(first_names)
                last = random.choice(last_names)
                email = f"{first.lower()}.{last.lower()}.{random.randint(100,999)}@example.com"
                
                # Check if user exists
                if User.objects.filter(email=email).exists():
                    continue

                user = User.objects.create_user(
                    username=email.split('@')[0],
                    email=email,
                    password='password123',
                    first_name=first,
                    last_name=last,
                    is_provider=True
                )
                
                # Random location offset (approx 5-10km radius)
                lat_offset = random.uniform(-0.05, 0.05)
                lng_offset = random.uniform(-0.05, 0.05)
                
                profile = PanditProfile.objects.create(
                    user=user,
                    bio=f"Experienced Vedic Pandit specializing in {random.choice(services).name}. serving in {city_name}.",
                    years_experience=random.randint(5, 30),
                    languages_spoken=["Hindi", "Sanskrit", "English", "Gujarati"][:random.randint(1,4)],
                    verification_status='verified', # Auto verified
                    is_online=True,
                    latitude=Decimal(str(base_lat + lat_offset)[:9]),
                    longitude=Decimal(str(base_lng + lng_offset)[:9]),
                    service_radius_km=random.randint(5, 20),
                    average_rating=Decimal(random.randint(35, 50)) / 10, # 3.5 to 5.0
                    total_reviews=random.randint(1, 50),
                    total_bookings_completed=random.randint(5, 100),
                    serviceable_pincodes=[str(random.randint(100000, 999999)) for _ in range(3)]
                )
                
                # Assign specializations
                profile.specializations.set(random.sample(services, k=random.randint(2, 5)))
                
                count += 1
                self.stdout.write(f"Created Pandit: {first} {last} in {city_name}")

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} Pandits across {len(cities)} cities'))
