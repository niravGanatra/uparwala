from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, Category, ProductImage
from vendors.models import VendorProfile
from decimal import Decimal
import requests
from io import BytesIO


class Command(BaseCommand):
    help = 'Add 10 sample products with images'

    def handle(self, *args, **kwargs):
        # Get a vendor (use the first one or create a default)
        vendor = VendorProfile.objects.first()
        if not vendor:
            self.stdout.write(self.style.ERROR('No vendors found. Please create a vendor first.'))
            return

        # Get categories
        categories = {
            'Electronics': Category.objects.filter(name__icontains='Electronics').first(),
            'Fashion': Category.objects.filter(name__icontains='Fashion').first(),
            'Home & Kitchen': Category.objects.filter(name__icontains='Home').first(),
            'Books': Category.objects.filter(name__icontains='Books').first(),
            'Sports': Category.objects.filter(name__icontains='Sports').first(),
            'Beauty': Category.objects.filter(name__icontains='Beauty').first(),
        }

        # Sample products data
        products_data = [
            {
                'name': 'Wireless Bluetooth Headphones',
                'category': categories.get('Electronics'),
                'description': 'Premium wireless headphones with noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.',
                'regular_price': Decimal('2999.00'),
                'sale_price': Decimal('2499.00'),
                'stock': 50,
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
            },
            {
                'name': 'Smart Watch Series 5',
                'category': categories.get('Electronics'),
                'description': 'Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 5-day battery life. Water-resistant up to 50m.',
                'regular_price': Decimal('4999.00'),
                'sale_price': Decimal('3999.00'),
                'stock': 35,
                'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'
            },
            {
                'name': 'Leather Crossbody Bag',
                'category': categories.get('Fashion'),
                'description': 'Elegant genuine leather crossbody bag with adjustable strap. Multiple compartments for organized storage. Perfect for daily use.',
                'regular_price': Decimal('1899.00'),
                'sale_price': Decimal('1499.00'),
                'stock': 25,
                'image_url': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop'
            },
            {
                'name': 'Running Shoes - Pro Edition',
                'category': categories.get('Sports'),
                'description': 'Professional running shoes with advanced cushioning technology, breathable mesh upper, and anti-slip sole. Ideal for marathons.',
                'regular_price': Decimal('3499.00'),
                'sale_price': Decimal('2799.00'),
                'stock': 60,
                'image_url': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
            },
            {
                'name': 'Stainless Steel Cookware Set',
                'category': categories.get('Home & Kitchen'),
                'description': '10-piece premium stainless steel cookware set. Includes pots, pans, and lids. Dishwasher safe and compatible with all cooktops.',
                'regular_price': Decimal('5999.00'),
                'sale_price': Decimal('4499.00'),
                'stock': 20,
                'image_url': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop'
            },
            {
                'name': 'Bestseller Fiction Novel Collection',
                'category': categories.get('Books'),
                'description': 'Collection of 5 bestselling fiction novels from award-winning authors. Perfect gift for book lovers. Hardcover edition.',
                'regular_price': Decimal('1999.00'),
                'sale_price': Decimal('1599.00'),
                'stock': 40,
                'image_url': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop'
            },
            {
                'name': 'Organic Skincare Gift Set',
                'category': categories.get('Beauty'),
                'description': 'Luxury organic skincare set with cleanser, toner, serum, and moisturizer. All-natural ingredients, cruelty-free, and suitable for all skin types.',
                'regular_price': Decimal('2499.00'),
                'sale_price': Decimal('1999.00'),
                'stock': 30,
                'image_url': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop'
            },
            {
                'name': 'Portable Bluetooth Speaker',
                'category': categories.get('Electronics'),
                'description': 'Compact waterproof Bluetooth speaker with 360° sound, 12-hour battery, and built-in microphone. Perfect for outdoor adventures.',
                'regular_price': Decimal('1499.00'),
                'sale_price': Decimal('1199.00'),
                'stock': 75,
                'image_url': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'
            },
            {
                'name': 'Yoga Mat with Carrying Strap',
                'category': categories.get('Sports'),
                'description': 'Premium non-slip yoga mat with extra cushioning. Eco-friendly material, easy to clean, includes free carrying strap and bag.',
                'regular_price': Decimal('899.00'),
                'sale_price': Decimal('699.00'),
                'stock': 100,
                'image_url': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'
            },
            {
                'name': 'Coffee Maker - Espresso Machine',
                'category': categories.get('Home & Kitchen'),
                'description': 'Professional espresso machine with milk frother, programmable settings, and 15-bar pressure pump. Makes barista-quality coffee at home.',
                'regular_price': Decimal('6999.00'),
                'sale_price': Decimal('5499.00'),
                'stock': 15,
                'image_url': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop'
            },
        ]

        created_count = 0
        for product_data in products_data:
            # Skip if category doesn't exist
            if not product_data['category']:
                self.stdout.write(self.style.WARNING(f'Skipping {product_data["name"]} - category not found'))
                continue

            # Check if product already exists
            if Product.objects.filter(name=product_data['name']).exists():
                self.stdout.write(self.style.WARNING(f'Product {product_data["name"]} already exists, skipping...'))
                continue

            # Create product
            product = Product.objects.create(
                vendor=vendor,
                category=product_data['category'],
                name=product_data['name'],
                slug=product_data['name'].lower().replace(' ', '-').replace('--', '-'),
                description=product_data['description'],
                regular_price=product_data['regular_price'],
                sale_price=product_data['sale_price'],
                price=product_data['sale_price'],
                stock=product_data['stock'],
                is_active=True,
                featured=created_count < 3  # Make first 3 products featured
            )

            # Download and save image
            try:
                response = requests.get(product_data['image_url'], timeout=10)
                if response.status_code == 200:
                    image_name = f"{product.slug}.jpg"
                    image_content = ContentFile(response.content, name=image_name)
                    
                    product_image = ProductImage.objects.create(
                        product=product,
                        is_primary=True,
                        alt_text=product.name
                    )
                    product_image.image.save(image_name, image_content, save=True)
                    
                    self.stdout.write(self.style.SUCCESS(f'✓ Created product: {product.name} with image'))
                    created_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f'✓ Created product: {product.name} (image download failed)'))
                    created_count += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'✓ Created product: {product.name} (image error: {str(e)})'))
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {created_count} products!'))
