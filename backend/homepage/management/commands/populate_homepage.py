from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from homepage.models import (
    HeroBanner, PromotionalBanner, FeaturedCategory,
    DealOfTheDay, HostingEssential, PremiumSection, CategoryPromotion
)
from products.models import Product


class Command(BaseCommand):
    help = 'Populate homepage with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating homepage data...')

        # Create Hero Banner
        HeroBanner.objects.all().delete()
        hero = HeroBanner.objects.create(
            title='HO HO HOME SALE',
            subtitle='Festive Discounts on Home Essentials',
            background_color='linear-gradient(to right, #facc15, #eab308, #f59e0b)',
            is_active=True,
            priority=1
        )
        self.stdout.write(self.style.SUCCESS(f'✓ Created hero banner: {hero.title}'))

        # Create Promotional Banners
        PromotionalBanner.objects.all().delete()
        banners = [
            {
                'title': 'Lights & Lamps',
                'discount_text': 'UPTO 65% OFF',
                'background_color': '#065f46',
                'link_url': '/products?category=lamps',
                'position': 'large_left',
                'priority': 3
            },
            {
                'title': 'Wall Decor',
                'discount_text': 'UPTO 55% OFF',
                'background_color': '#047857',
                'link_url': '/products?category=wall-decor',
                'position': 'side',
                'priority': 2
            },
            {
                'title': 'Winter-Ready Decors',
                'discount_text': 'UPTO 40% OFF',
                'background_color': 'linear-gradient(to right, #fef3c7, #fed7aa)',
                'link_url': '/products?category=winter',
                'position': 'full_width',
                'priority': 1
            },
        ]
        for banner_data in banners:
            banner = PromotionalBanner.objects.create(**banner_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created promotional banner: {banner.title}'))

        # Create Featured Categories
        FeaturedCategory.objects.all().delete()
        categories = [
            {'name': 'Wall Hangings', 'icon': 'frame', 'link_url': '/products?category=wall-hangings', 'priority': 1},
            {'name': 'Pots & Planters', 'icon': 'package', 'link_url': '/products?category=pots', 'priority': 2},
            {'name': 'Showpieces', 'icon': 'sparkles', 'link_url': '/products?category=showpieces', 'priority': 3},
            {'name': 'Vases & Pots', 'icon': 'package', 'link_url': '/products?category=vases', 'priority': 4},
            {'name': 'Rugs & Carpets', 'icon': 'sofa', 'link_url': '/products?category=rugs', 'priority': 5},
            {'name': 'Bedroom', 'icon': 'home', 'link_url': '/products?category=bedroom', 'priority': 6},
            {'name': 'Wall Decor', 'icon': 'frame', 'link_url': '/products?category=wall-decor', 'priority': 7},
            {'name': 'Curtains', 'icon': 'home', 'link_url': '/products?category=curtains', 'priority': 8},
        ]
        for cat_data in categories:
            cat = FeaturedCategory.objects.create(**cat_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created featured category: {cat.name}'))

        # Create Deals of the Day (if products exist)
        DealOfTheDay.objects.all().delete()
        products = Product.objects.filter(is_active=True)[:4]
        if products.exists():
            today = timezone.now().date()
            for i, product in enumerate(products):
                deal = DealOfTheDay.objects.create(
                    product=product,
                    discount_percentage=25.00,
                    start_date=today,
                    end_date=today + timedelta(days=7),
                    is_active=True,
                    priority=i + 1
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Created deal: {deal.product.name}'))
        else:
            self.stdout.write(self.style.WARNING('⚠ No products found for deals'))

        # Create Hosting Essentials
        HostingEssential.objects.all().delete()
        hosting = [
            {'name': 'Table Linens', 'emoji': '🍽️', 'link_url': '/products?category=table-linens', 'priority': 1},
            {'name': 'Dinner Sets', 'emoji': '🍽️', 'link_url': '/products?category=dinner-sets', 'priority': 2},
            {'name': 'Trays & Platters', 'emoji': '🍽️', 'link_url': '/products?category=trays', 'priority': 3},
            {'name': 'Barware', 'emoji': '🍷', 'link_url': '/products?category=barware', 'priority': 4},
            {'name': 'Tea Sets', 'emoji': '☕', 'link_url': '/products?category=tea-sets', 'priority': 5},
        ]
        for host_data in hosting:
            host = HostingEssential.objects.create(**host_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created hosting essential: {host.name}'))

        # Create Premium Sections
        PremiumSection.objects.all().delete()
        premium = [
            {
                'title': 'Premium',
                'subtitle': 'museum quality',
                'background_color': 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)',
                'icon': 'frame',
                'link_url': '/products?category=premium',
                'position': 'left',
                'priority': 2
            },
            {
                'title': 'Premium',
                'subtitle': 'decorative lamps',
                'background_color': 'linear-gradient(to bottom right, #d97706, #ca8a04)',
                'icon': 'lamp',
                'link_url': '/products?category=lamps',
                'position': 'right',
                'priority': 1
            },
        ]
        for prem_data in premium:
            prem = PremiumSection.objects.create(**prem_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created premium section: {prem.title} - {prem.subtitle}'))

        # Create Category Promotions
        CategoryPromotion.objects.all().delete()
        promotions = [
            {'name': 'Mirrors', 'discount_text': 'UPTO 60% OFF', 'background_color': '#475569', 'link_url': '/products?category=mirrors', 'priority': 1},
            {'name': 'Showpieces', 'discount_text': 'UPTO 65% OFF', 'background_color': '#047857', 'link_url': '/products?category=showpieces', 'priority': 2},
            {'name': 'Curtains', 'discount_text': 'UPTO 55% OFF', 'background_color': '#52525b', 'link_url': '/products?category=curtains', 'priority': 3},
            {'name': 'Comforters & Quilts', 'discount_text': 'UPTO 60% OFF', 'background_color': '#475569', 'link_url': '/products?category=comforters', 'priority': 4},
            {'name': 'Rugs & Carpets', 'discount_text': 'UPTO 70% OFF', 'background_color': '#047857', 'link_url': '/products?category=rugs', 'priority': 5},
            {'name': 'Showpieces', 'discount_text': 'UPTO 65% OFF', 'background_color': '#d97706', 'link_url': '/products?category=showpieces', 'priority': 6},
        ]
        for promo_data in promotions:
            promo = CategoryPromotion.objects.create(**promo_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'✓ Created category promotion: {promo.name}'))

        self.stdout.write(self.style.SUCCESS('\n✅ Homepage data populated successfully!'))
        self.stdout.write(self.style.SUCCESS('You can now access the admin panel to manage this content.'))
