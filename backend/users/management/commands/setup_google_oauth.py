from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

class Command(BaseCommand):
    help = 'Configure Google OAuth credentials'

    def handle(self, *args, **options):
        # Update or create the site
        site, created = Site.objects.get_or_create(
            id=1,
            defaults={
                'domain': 'localhost:8000',
                'name': 'Uparwala'
            }
        )
        if not created:
            site.domain = 'localhost:8000'
            site.name = 'Uparwala'
            site.save()
            self.stdout.write(self.style.SUCCESS(f'Updated site: {site.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Created site: {site.name}'))

        # Create or update Google OAuth app
        google_app, created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google OAuth',
                'client_id': '426786217416-aab179pulvrt601ij9gvim0tc97c0eh2.apps.googleusercontent.com',
                'secret': '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',
            }
        )
        
        if not created:
            google_app.client_id = '426786217416-aab179pulvrt601ij9gvim0tc97c0eh2.apps.googleusercontent.com'
            google_app.secret = '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'
            google_app.save()
            self.stdout.write(self.style.SUCCESS('Updated Google OAuth app'))
        else:
            self.stdout.write(self.style.SUCCESS('Created Google OAuth app'))

        # Add site to the app
        if site not in google_app.sites.all():
            google_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f'Added {site.name} to Google OAuth app'))

        self.stdout.write(self.style.SUCCESS('\n✅ Google OAuth configuration complete!'))
        self.stdout.write(self.style.SUCCESS('You can now use Google Sign-In on your application.'))
