import random
import string
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.files.base import ContentFile
from base64 import b64decode
from products.models import Category, Product, ProductImage
from vendors.models import VendorProfile
from orders.models import Order, OrderItem

User = get_user_model()

# A 1x1 white pixel in base64
DUMMY_IMAGE_DATA = b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=")

class Command(BaseCommand):
    help = 'Populate database with dummy data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting dummy data population...')

        # 1. Create Users (Vendors and Customers)
        self.create_users()

        # 2. Create Categories
        categories = self.create_categories()

        # 3. Create Products for Vendors
        self.create_products(categories)

        # 4. Create Orders
        self.create_orders()

        self.stdout.write(self.style.SUCCESS('Dummy data population complete!'))

    def create_users(self):
        # Create Vendors
        vendor_names = ['TechWorld', 'FashionHub', 'HomeStyle']
        for name in vendor_names:
            username = f"vendor_{name.lower()}"
            email = f"{name.lower()}@example.com"
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    is_vendor=True,
                    vendor_status='approved'
                )
                VendorProfile.objects.create(
                    user=user,
                    store_name=name,
                    store_slug=slugify(name),
                    store_description=f"Best place for {name} items."
                )
                self.stdout.write(f'Created vendor: {username}')

        # Create Customers
        for i in range(3):
            username = f"customer_{i+1}"
            email = f"customer_{i+1}@example.com"
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=email,
                    password='password123'
                )
                self.stdout.write(f'Created customer: {username}')

    def create_categories(self):
        category_names = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Toys']
        categories = []
        for name in category_names:
            slug = slugify(name)
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': f'All things {name}'}
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {name}')
        return categories

    def create_products(self, categories):
        vendors = VendorProfile.objects.all()
        if not vendors.exists():
            return

        product_templates = [
            {'name': 'Smartphone X', 'price': 999.99, 'cat_idx': 0},
            {'name': 'Laptop Pro', 'price': 1499.99, 'cat_idx': 0},
            {'name': 'Wireless Headphones', 'price': 199.99, 'cat_idx': 0},
            {'name': 'Cotton T-Shirt', 'price': 29.99, 'cat_idx': 1},
            {'name': 'Denim Jeans', 'price': 59.99, 'cat_idx': 1},
            {'name': 'Sneakers', 'price': 89.99, 'cat_idx': 1},
            {'name': 'Coffee Maker', 'price': 49.99, 'cat_idx': 2},
            {'name': 'Blender', 'price': 39.99, 'cat_idx': 2},
        ]

        for prod_data in product_templates:
            # Check if product exists loosely by name
            if Product.objects.filter(name__icontains=prod_data['name']).exists():
                continue

            vendor = random.choice(vendors)
            category = categories[prod_data['cat_idx']] if prod_data['cat_idx'] < len(categories) else categories[0]
            
            product = Product.objects.create(
                vendor=vendor,
                category=category,
                name=prod_data['name'],
                slug=slugify(f"{prod_data['name']} {random.randint(1000, 9999)}"),
                description=f"This is a high quality {prod_data['name']} from {vendor.store_name}.",
                price=prod_data['price'],
                stock=random.randint(10, 100),
                is_active=True,
                status='published' # Assuming status field exists or default is published/active
            )
            
            # Create a dummy image
            image_name = f"{product.slug}.png"
            ProductImage.objects.create(
                product=product,
                image=ContentFile(DUMMY_IMAGE_DATA, name=image_name),
                is_primary=True,
                alt_text=product.name
            )
            
            self.stdout.write(f'Created product: {product.name} for {vendor.store_name}')

    def create_orders(self):
        customers = User.objects.filter(is_vendor=False, is_superuser=False)
        products = Product.objects.all()

        if not customers.exists() or not products.exists():
            return

        for _ in range(5): # Create 5 dummy orders
            customer = random.choice(customers)
            order = Order.objects.create(
                user=customer,
                status='PROCESSING',
                total_amount=0, # Will update based on items
                shipping_address=f"123 Fake St, Cityville, ST, 12345",
                billing_address=f"123 Fake St, Cityville, ST, 12345",
                payment_method='cod',
                payment_status='pending'
            )
            
            total = 0
            # Add random products
            for _ in range(random.randint(1, 3)):
                product = random.choice(products)
                qty = random.randint(1, 2)
                price = product.price
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=qty,
                    price=price,
                    vendor=product.vendor # Assuming OrderItem tracks vendor
                )
                total += float(price) * qty
            
            order.total_amount = total
            order.save()
            self.stdout.write(f'Created order #{order.id} for {customer.username}')
