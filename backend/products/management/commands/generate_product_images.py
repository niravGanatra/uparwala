from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from products.models import Product, ProductImage
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import random


class Command(BaseCommand):
    help = 'Generate placeholder images for products'

    def handle(self, *args, **kwargs):
        # Product names
        product_names = [
            'Wireless Bluetooth Headphones',
            'Smart Watch Series 5',
            'Leather Crossbody Bag',
            'Running Shoes - Pro Edition',
            'Stainless Steel Cookware Set',
            'Bestseller Fiction Novel Collection',
            'Organic Skincare Gift Set',
            'Portable Bluetooth Speaker',
            'Yoga Mat with Carrying Strap',
            'Coffee Maker - Espresso Machine',
        ]

        # Color schemes for different product types
        colors = [
            ('#4A90E2', '#FFFFFF'),  # Blue
            ('#50C878', '#FFFFFF'),  # Green
            ('#FF6B6B', '#FFFFFF'),  # Red
            ('#9B59B6', '#FFFFFF'),  # Purple
            ('#F39C12', '#FFFFFF'),  # Orange
            ('#1ABC9C', '#FFFFFF'),  # Turquoise
            ('#E74C3C', '#FFFFFF'),  # Crimson
            ('#3498DB', '#FFFFFF'),  # Sky Blue
            ('#2ECC71', '#FFFFFF'),  # Emerald
            ('#E67E22', '#FFFFFF'),  # Carrot
        ]

        success_count = 0
        for idx, product_name in enumerate(product_names):
            try:
                product = Product.objects.get(name=product_name)
                
                # Create a placeholder image
                img = Image.new('RGB', (500, 500), color=colors[idx][0])
                draw = ImageDraw.Draw(img)
                
                # Add product name text
                text = product_name[:30]  # Limit text length
                # Use default font
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
                except:
                    font = ImageFont.load_default()
                
                # Calculate text position (centered)
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                position = ((500 - text_width) / 2, (500 - text_height) / 2)
                
                draw.text(position, text, fill=colors[idx][1], font=font)
                
                # Save image to BytesIO
                img_io = BytesIO()
                img.save(img_io, format='JPEG', quality=85)
                img_io.seek(0)
                
                # Create ContentFile
                image_name = f"{product.slug}.jpg"
                image_content = ContentFile(img_io.read(), name=image_name)
                
                # Delete existing images
                ProductImage.objects.filter(product=product).delete()
                
                # Create product image
                product_image = ProductImage.objects.create(
                    product=product,
                    is_primary=True,
                    alt_text=product.name
                )
                product_image.image.save(image_name, image_content, save=True)
                
                self.stdout.write(self.style.SUCCESS(f'✓ Generated image for: {product.name}'))
                success_count += 1
                
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'⚠ Product not found: {product_name}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error for {product_name}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully generated images for {success_count} products!'))
