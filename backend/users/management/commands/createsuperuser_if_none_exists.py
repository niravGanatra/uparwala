import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser if none exists using environment variables'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not all([username, email, password]):
            self.stdout.write(self.style.WARNING('Skipping superuser creation: Missing DJANGO_SUPERUSER_ environment variables'))
            return

        # Check if superuser already exists
        if not User.objects.filter(username=username).exists():
            try:
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password
                )
                self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {username}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating superuser: {str(e)}'))
        else:
            self.stdout.write(self.style.SUCCESS('Superuser already exists. Skipping creation.'))
