from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates an admin superuser if one does not exist'

    def handle(self, *args, **options):
        username = 'admin'
        email = 'admin@uparwala.in'
        password = 'Admin@Uparwala2024'  # Strong default password
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user "{username}" already exists!')
            )
            # Update password anyway
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated password for "{username}"')
            )
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created admin user "{username}"'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCredentials:')
        )
        self.stdout.write(f'  Username: {username}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write(
            self.style.WARNING('\n⚠️  IMPORTANT: Change this password after first login!')
        )
