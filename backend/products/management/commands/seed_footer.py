from django.core.management.base import BaseCommand
from products.models import FooterSection, FooterLink, FooterSocialMedia, FooterSettings


class Command(BaseCommand):
    help = 'Seeds initial footer data with dummy content. Can be updated later via admin panel.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Seeding footer data...'))

        # Check if data already exists
        if FooterSection.objects.exists():
            self.stdout.write(self.style.WARNING('Footer data already exists. Skipping...'))
            self.stdout.write(self.style.SUCCESS('Use the admin panel at /admin/footer to update existing data.'))
            return

        # Create sections
        self.stdout.write('Creating footer sections...')
        about = FooterSection.objects.create(
            title="About",
            order=1,
            is_active=True
        )
        help_section = FooterSection.objects.create(
            title="Help",
            order=2,
            is_active=True
        )
        policy = FooterSection.objects.create(
            title="Consumer Policy",
            order=3,
            is_active=True
        )

        # About links
        self.stdout.write('Creating About section links...')
        FooterLink.objects.create(
            section=about,
            title="Contact Us",
            url="/pages/contact-us",
            order=1,
            is_active=True
        )
        FooterLink.objects.create(
            section=about,
            title="About Us",
            url="/pages/about-us",
            order=2,
            is_active=True
        )
        FooterLink.objects.create(
            section=about,
            title="Careers",
            url="/pages/careers",
            order=3,
            is_active=True
        )
        FooterLink.objects.create(
            section=about,
            title="Corporate Information",
            url="/pages/corporate-information",
            order=4,
            is_active=True
        )

        # Help links
        self.stdout.write('Creating Help section links...')
        FooterLink.objects.create(
            section=help_section,
            title="Payments",
            url="/pages/payments",
            order=1,
            is_active=True
        )
        FooterLink.objects.create(
            section=help_section,
            title="Shipping",
            url="/pages/shipping",
            order=2,
            is_active=True
        )
        FooterLink.objects.create(
            section=help_section,
            title="Cancellations & Returns",
            url="/pages/cancellations-returns",
            order=3,
            is_active=True
        )
        FooterLink.objects.create(
            section=help_section,
            title="FAQ",
            url="/pages/faq",
            order=4,
            is_active=True
        )

        # Policy links
        self.stdout.write('Creating Consumer Policy section links...')
        FooterLink.objects.create(
            section=policy,
            title="Cancellation & Returns",
            url="/pages/cancellation-returns",
            order=1,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="Terms of Use",
            url="/pages/terms-of-use",
            order=2,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="Security",
            url="/pages/security",
            order=3,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="Privacy",
            url="/pages/privacy",
            order=4,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="Sitemap",
            url="/pages/sitemap",
            order=5,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="Grievance Redressal",
            url="/pages/grievance-redressal",
            order=6,
            is_active=True
        )
        FooterLink.objects.create(
            section=policy,
            title="EPR Compliance",
            url="/pages/epr-compliance",
            order=7,
            is_active=True
        )

        # Social media
        self.stdout.write('Creating social media links...')
        FooterSocialMedia.objects.create(
            name="Facebook",
            url="https://facebook.com",
            icon="facebook",
            order=1,
            is_active=True
        )
        FooterSocialMedia.objects.create(
            name="Twitter",
            url="https://twitter.com",
            icon="twitter",
            order=2,
            is_active=True
        )
        FooterSocialMedia.objects.create(
            name="Instagram",
            url="https://instagram.com",
            icon="instagram",
            order=3,
            is_active=True
        )
        FooterSocialMedia.objects.create(
            name="Youtube",
            url="https://youtube.com",
            icon="youtube",
            order=4,
            is_active=True
        )
        FooterSocialMedia.objects.create(
            name="LinkedIn",
            url="https://linkedin.com",
            icon="linkedin",
            order=5,
            is_active=True
        )

        # Settings
        self.stdout.write('Creating footer settings...')
        FooterSettings.objects.create(
            company_name="Uparwala Internet Pvt Ltd",
            registered_address="""Buildings Alyssa, Begonia & Clove Embassy Tech Village,
Outer Ring Road, Devarabeesanahalli Village,
Bengaluru, 560103, Karnataka, India""",
            cin_number="U51109KA2012PTC066107",
            phone_number="044-8447878",
            copyright_text="© 2025 Uparwala. All rights reserved."
        )

        self.stdout.write(self.style.SUCCESS('\n✅ Footer data seeded successfully!'))
        self.stdout.write(self.style.SUCCESS('\nYou can now:'))
        self.stdout.write(self.style.SUCCESS('1. View the footer on any page of your site'))
        self.stdout.write(self.style.SUCCESS('2. Update all footer content via /admin/footer'))
        self.stdout.write(self.style.SUCCESS('3. Add/remove sections, links, and social media as needed'))
