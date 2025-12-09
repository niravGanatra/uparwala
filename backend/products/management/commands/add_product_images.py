from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, ProductImage
import requests


class Command(BaseCommand):
    help = 'Add images to existing products'

    def handle(self, *args, **kwargs):
        # Product name to image URL mapping
        product_images = {
            'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
            'Smart Watch Series 5': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
            'Leather Crossbody Bag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop',
            'Running Shoes - Pro Edition': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
            'Stainless Steel Cookware Set': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
            'Bestseller Fiction Novel Collection': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
            'Organic Skincare Gift Set': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop',
            'Portable Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
            'Yoga Mat with Carrying Strap': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
            'Coffee Maker - Espresso Machine': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop',
        }

        success_count = 0
        for product_name, image_url in product_images.items():
            try:
                product = Product.objects.get(name=product_name)
                
                # Download image
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_name = f"{product.slug}.jpg"
                    image_content = ContentFile(response.content, name=image_name)
                    
                    # Create product image
                    product_image = ProductImage.objects.create(
                        product=product,
                        is_primary=True,
                        alt_text=product.name
                    )
                    product_image.image.save(image_name, image_content, save=True)
                    
                    self.stdout.write(self.style.SUCCESS(f'✓ Added image to: {product.name}'))
                    success_count += 1
                else:
                    self.stdout.write(self.style.ERROR(f'✗ Failed to download image for: {product.name}'))
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'⚠ Product not found: {product_name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error for {product_name}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully added images to {success_count} products!'))
