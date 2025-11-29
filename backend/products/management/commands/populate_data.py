from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductImage
from vendors.models import VendorProfile, Wallet
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with dummy data for Hindu religious items'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting to populate database...')

        # Create categories
        categories_data = [
            {'name': 'Puja Items', 'slug': 'puja-items'},
            {'name': 'Idols & Statues', 'slug': 'idols-statues'},
            {'name': 'Religious Books', 'slug': 'religious-books'},
            {'name': 'Clothing', 'slug': 'clothing'},
            {'name': 'Jewelry', 'slug': 'jewelry'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create vendor users
        vendors_data = [
            {'username': 'divine_store', 'email': 'divine@example.com', 'store_name': 'Divine Blessings Store'},
            {'username': 'sacred_items', 'email': 'sacred@example.com', 'store_name': 'Sacred Items Emporium'},
            {'username': 'holy_treasures', 'email': 'holy@example.com', 'store_name': 'Holy Treasures'},
        ]

        vendors = {}
        for vendor_data in vendors_data:
            user, created = User.objects.get_or_create(
                username=vendor_data['username'],
                defaults={
                    'email': vendor_data['email'],
                    'is_vendor': True,
                }
            )
            if created:
                user.set_password('vendor123')
                user.save()
                self.stdout.write(f'Created vendor user: {user.username}')

            profile, created = VendorProfile.objects.get_or_create(
                user=user,
                defaults={'store_name': vendor_data['store_name']}
            )
            vendors[vendor_data['username']] = profile

            # Create wallet for vendor
            Wallet.objects.get_or_create(vendor=profile)

        # Create products
        products_data = [
            # Puja Items
            {
                'name': 'Premium Agarbatti Incense Sticks',
                'slug': 'premium-agarbatti-incense',
                'description': 'Hand-rolled premium incense sticks with natural fragrances. Perfect for daily puja and meditation.',
                'price': Decimal('199.00'),
                'stock': 100,
                'category': 'puja-items',
                'vendor': 'divine_store',
            },
            {
                'name': 'Brass Diya Set (Pack of 5)',
                'slug': 'brass-diya-set',
                'description': 'Traditional brass diyas for lighting during puja. Set of 5 beautifully crafted diyas.',
                'price': Decimal('299.00'),
                'stock': 50,
                'category': 'puja-items',
                'vendor': 'sacred_items',
            },
            {
                'name': 'Pure Camphor Tablets',
                'slug': 'pure-camphor-tablets',
                'description': 'Pure camphor tablets for aarti and puja rituals. 100g pack.',
                'price': Decimal('89.00'),
                'stock': 200,
                'category': 'puja-items',
                'vendor': 'divine_store',
            },
            {
                'name': 'Kumkum Sindoor Powder',
                'slug': 'kumkum-sindoor-powder',
                'description': 'Traditional kumkum powder for tilak and religious ceremonies.',
                'price': Decimal('49.00'),
                'stock': 150,
                'category': 'puja-items',
                'vendor': 'holy_treasures',
            },

            # Idols & Statues
            {
                'name': 'Lord Ganesha Brass Idol (6 inch)',
                'slug': 'ganesha-brass-idol-6inch',
                'description': 'Beautiful brass idol of Lord Ganesha, the remover of obstacles. Perfect for home temple.',
                'price': Decimal('1299.00'),
                'stock': 25,
                'category': 'idols-statues',
                'vendor': 'sacred_items',
            },
            {
                'name': 'Goddess Lakshmi Statue',
                'slug': 'lakshmi-statue',
                'description': 'Elegant statue of Goddess Lakshmi, the goddess of wealth and prosperity.',
                'price': Decimal('1599.00'),
                'stock': 20,
                'category': 'idols-statues',
                'vendor': 'divine_store',
            },
            {
                'name': 'Lord Shiva Meditation Idol',
                'slug': 'shiva-meditation-idol',
                'description': 'Serene idol of Lord Shiva in meditation pose. Made of high-quality resin.',
                'price': Decimal('899.00'),
                'stock': 30,
                'category': 'idols-statues',
                'vendor': 'holy_treasures',
            },
            {
                'name': 'Radha Krishna Marble Statue',
                'slug': 'radha-krishna-marble-statue',
                'description': 'Exquisite marble statue of Radha and Krishna. Hand-carved with intricate details.',
                'price': Decimal('2499.00'),
                'stock': 15,
                'category': 'idols-statues',
                'vendor': 'sacred_items',
            },

            # Religious Books
            {
                'name': 'Bhagavad Gita (Hindi & English)',
                'slug': 'bhagavad-gita-hindi-english',
                'description': 'Complete Bhagavad Gita with Hindi and English translations. Hardcover edition.',
                'price': Decimal('399.00'),
                'stock': 75,
                'category': 'religious-books',
                'vendor': 'divine_store',
            },
            {
                'name': 'Ramayana - Complete Edition',
                'slug': 'ramayana-complete-edition',
                'description': 'The complete Ramayana epic with beautiful illustrations.',
                'price': Decimal('599.00'),
                'stock': 50,
                'category': 'religious-books',
                'vendor': 'holy_treasures',
            },
            {
                'name': 'Hanuman Chalisa Book',
                'slug': 'hanuman-chalisa-book',
                'description': 'Hanuman Chalisa with meaning and benefits. Pocket-sized edition.',
                'price': Decimal('99.00'),
                'stock': 100,
                'category': 'religious-books',
                'vendor': 'sacred_items',
            },

            # Clothing
            {
                'name': 'Men\'s Cotton Dhoti',
                'slug': 'mens-cotton-dhoti',
                'description': 'Traditional white cotton dhoti for religious ceremonies and festivals.',
                'price': Decimal('499.00'),
                'stock': 40,
                'category': 'clothing',
                'vendor': 'divine_store',
            },
            {
                'name': 'Silk Puja Saree',
                'slug': 'silk-puja-saree',
                'description': 'Elegant silk saree perfect for temple visits and religious occasions.',
                'price': Decimal('2999.00'),
                'stock': 20,
                'category': 'clothing',
                'vendor': 'sacred_items',
            },
            {
                'name': 'Cotton Kurta for Puja',
                'slug': 'cotton-kurta-puja',
                'description': 'Comfortable cotton kurta ideal for daily puja and meditation.',
                'price': Decimal('799.00'),
                'stock': 35,
                'category': 'clothing',
                'vendor': 'holy_treasures',
            },

            # Jewelry
            {
                'name': 'Rudraksha Mala (108 Beads)',
                'slug': 'rudraksha-mala-108',
                'description': 'Authentic Rudraksha mala with 108 beads for meditation and chanting.',
                'price': Decimal('899.00'),
                'stock': 60,
                'category': 'jewelry',
                'vendor': 'divine_store',
            },
            {
                'name': 'Tulsi Mala Necklace',
                'slug': 'tulsi-mala-necklace',
                'description': 'Sacred Tulsi wood mala necklace. Blessed and energized.',
                'price': Decimal('299.00'),
                'stock': 80,
                'category': 'jewelry',
                'vendor': 'sacred_items',
            },
            {
                'name': 'Silver Om Pendant',
                'slug': 'silver-om-pendant',
                'description': 'Pure silver Om pendant with chain. Perfect spiritual accessory.',
                'price': Decimal('1499.00'),
                'stock': 45,
                'category': 'jewelry',
                'vendor': 'holy_treasures',
            },
        ]

        for product_data in products_data:
            category = categories[product_data.pop('category')]
            vendor = vendors[product_data.pop('vendor')]

            product, created = Product.objects.get_or_create(
                slug=product_data['slug'],
                defaults={
                    **product_data,
                    'category': category,
                    'vendor': vendor,
                }
            )
            if created:
                self.stdout.write(f'Created product: {product.name}')

        # Create a customer user for testing
        customer, created = User.objects.get_or_create(
            username='testcustomer',
            defaults={
                'email': 'customer@example.com',
                'is_customer': True,
            }
        )
        if created:
            customer.set_password('customer123')
            customer.save()
            self.stdout.write('Created test customer user')

        self.stdout.write(self.style.SUCCESS('Successfully populated database with dummy data!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('Vendors: divine_store, sacred_items, holy_treasures (password: vendor123)')
        self.stdout.write('Customer: testcustomer (password: customer123)')
