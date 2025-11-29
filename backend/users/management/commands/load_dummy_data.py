from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from products.models import Category, Product, ProductImage
from vendors.models import VendorProfile
from orders.models import Order, OrderItem
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Load dummy data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to load dummy data...'))

        # Create categories
        self.stdout.write('Creating categories...')
        categories_data = [
            'Electronics',
            'Fashion',
            'Home & Kitchen',
            'Books',
            'Sports',
            'Toys',
            'Beauty',
            'Automotive',
        ]
        
        categories = {}
        for cat_name in categories_data:
            slug = slugify(cat_name)
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': cat_name}
            )
            categories[cat_name] = category
            if created:
                self.stdout.write(f'  ✓ Created category: {category.name}')

        # Create approved vendors
        self.stdout.write('\nCreating approved vendors...')
        vendors_data = [
            {
                'username': 'techstore',
                'email': 'tech@store.com',
                'business_name': 'Tech Paradise',
                'business_email': 'business@techparadise.com',
                'business_phone': '+91 9876543210',
                'business_address': '123 Tech Street, Mumbai, Maharashtra 400001',
                'store_description': 'Your one-stop shop for all electronics and gadgets',
            },
            {
                'username': 'fashionhub',
                'email': 'fashion@hub.com',
                'business_name': 'Fashion Hub',
                'business_email': 'business@fashionhub.com',
                'business_phone': '+91 9876543211',
                'business_address': '456 Fashion Avenue, Delhi, Delhi 110001',
                'store_description': 'Trendy fashion for everyone',
            },
            {
                'username': 'homeessentials',
                'email': 'home@essentials.com',
                'business_name': 'Home Essentials',
                'business_email': 'business@homeessentials.com',
                'business_phone': '+91 9876543212',
                'business_address': '789 Home Lane, Bangalore, Karnataka 560001',
                'store_description': 'Everything you need for your home',
            },
        ]

        vendor_users = []
        for vendor_data in vendors_data:
            user, created = User.objects.get_or_create(
                username=vendor_data['username'],
                defaults={
                    'email': vendor_data['email'],
                    'is_vendor': True,
                    'vendor_status': 'approved',
                    'vendor_approval_date': timezone.now(),
                    'business_name': vendor_data['business_name'],
                    'business_email': vendor_data['business_email'],
                    'business_phone': vendor_data['business_phone'],
                    'business_address': vendor_data['business_address'],
                    'store_description': vendor_data['store_description'],
                }
            )
            if created:
                user.set_password('vendor123')
                user.save()
                self.stdout.write(f'  ✓ Created vendor: {user.username}')
            
            # Create vendor profile
            profile, _ = VendorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'store_name': vendor_data['business_name'],
                    'store_description': vendor_data['store_description'],
                }
            )
            vendor_users.append(user)

        # Create products
        self.stdout.write('\nCreating products...')
        products_data = [
            # Electronics
            {'name': 'Wireless Headphones', 'category': 'Electronics', 'price': 2999, 'stock': 50, 'description': 'Premium wireless headphones with noise cancellation'},
            {'name': 'Smart Watch', 'category': 'Electronics', 'price': 4999, 'stock': 30, 'description': 'Fitness tracking smart watch with heart rate monitor'},
            {'name': 'Bluetooth Speaker', 'category': 'Electronics', 'price': 1999, 'stock': 40, 'description': 'Portable bluetooth speaker with 12-hour battery'},
            {'name': 'Power Bank 20000mAh', 'category': 'Electronics', 'price': 1499, 'stock': 60, 'description': 'High capacity power bank with fast charging'},
            {'name': 'Wireless Mouse', 'category': 'Electronics', 'price': 599, 'stock': 100, 'description': 'Ergonomic wireless mouse with silent clicks'},
            
            # Fashion
            {'name': 'Cotton T-Shirt', 'category': 'Fashion', 'price': 499, 'stock': 200, 'description': 'Comfortable cotton t-shirt in various colors'},
            {'name': 'Denim Jeans', 'category': 'Fashion', 'price': 1299, 'stock': 150, 'description': 'Classic fit denim jeans'},
            {'name': 'Leather Wallet', 'category': 'Fashion', 'price': 799, 'stock': 80, 'description': 'Genuine leather wallet with multiple card slots'},
            {'name': 'Sports Shoes', 'category': 'Fashion', 'price': 2499, 'stock': 60, 'description': 'Comfortable sports shoes for running and gym'},
            {'name': 'Sunglasses', 'category': 'Fashion', 'price': 899, 'stock': 90, 'description': 'UV protection sunglasses with polarized lenses'},
            
            # Home & Kitchen
            {'name': 'Non-Stick Cookware Set', 'category': 'Home & Kitchen', 'price': 3499, 'stock': 40, 'description': '5-piece non-stick cookware set'},
            {'name': 'Electric Kettle', 'category': 'Home & Kitchen', 'price': 1199, 'stock': 70, 'description': '1.8L electric kettle with auto shut-off'},
            {'name': 'Mixer Grinder', 'category': 'Home & Kitchen', 'price': 2999, 'stock': 35, 'description': '750W mixer grinder with 3 jars'},
            {'name': 'Bed Sheet Set', 'category': 'Home & Kitchen', 'price': 1499, 'stock': 100, 'description': 'Premium cotton bed sheet set with pillow covers'},
            {'name': 'Storage Containers', 'category': 'Home & Kitchen', 'price': 699, 'stock': 120, 'description': 'Set of 10 airtight storage containers'},
            
            # Books
            {'name': 'Python Programming Book', 'category': 'Books', 'price': 599, 'stock': 50, 'description': 'Complete guide to Python programming'},
            {'name': 'Business Strategy Book', 'category': 'Books', 'price': 799, 'stock': 40, 'description': 'Modern business strategy and management'},
            {'name': 'Fiction Novel Set', 'category': 'Books', 'price': 1299, 'stock': 60, 'description': 'Set of 3 bestselling fiction novels'},
            
            # Sports
            {'name': 'Yoga Mat', 'category': 'Sports', 'price': 799, 'stock': 80, 'description': 'Non-slip yoga mat with carrying strap'},
            {'name': 'Dumbbells Set', 'category': 'Sports', 'price': 1999, 'stock': 45, 'description': 'Adjustable dumbbells set 2-10kg'},
            {'name': 'Cricket Bat', 'category': 'Sports', 'price': 2499, 'stock': 30, 'description': 'Professional cricket bat with cover'},
            
            # Toys
            {'name': 'Building Blocks Set', 'category': 'Toys', 'price': 899, 'stock': 70, 'description': '500-piece building blocks set'},
            {'name': 'Remote Control Car', 'category': 'Toys', 'price': 1499, 'stock': 50, 'description': 'High-speed remote control racing car'},
            
            # Beauty
            {'name': 'Skincare Kit', 'category': 'Beauty', 'price': 1999, 'stock': 60, 'description': 'Complete skincare routine kit'},
            {'name': 'Hair Dryer', 'category': 'Beauty', 'price': 1299, 'stock': 40, 'description': 'Professional hair dryer with multiple settings'},
        ]

        products = []
        for i, prod_data in enumerate(products_data):
            vendor = vendor_users[i % len(vendor_users)]
            vendor_profile = VendorProfile.objects.get(user=vendor)
            
            price_decimal = Decimal(str(prod_data['price']))
            slug = slugify(prod_data['name'])
            
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': prod_data['name'],
                    'vendor': vendor_profile,
                    'description': prod_data['description'],
                    'regular_price': price_decimal,
                    'price': price_decimal,
                    'stock': prod_data['stock'],
                    'category': categories[prod_data['category']],
                    'is_active': True,
                }
            )
            if created:
                products.append(product)
                self.stdout.write(f'  ✓ Created product: {product.name}')

        # Create customers
        self.stdout.write('\nCreating customers...')
        customers_data = [
            {'username': 'customer1', 'email': 'customer1@example.com', 'first_name': 'Rahul', 'last_name': 'Sharma'},
            {'username': 'customer2', 'email': 'customer2@example.com', 'first_name': 'Priya', 'last_name': 'Patel'},
            {'username': 'customer3', 'email': 'customer3@example.com', 'first_name': 'Amit', 'last_name': 'Kumar'},
            {'username': 'customer4', 'email': 'customer4@example.com', 'first_name': 'Sneha', 'last_name': 'Singh'},
            {'username': 'customer5', 'email': 'customer5@example.com', 'first_name': 'Vikram', 'last_name': 'Reddy'},
        ]

        customers = []
        for cust_data in customers_data:
            user, created = User.objects.get_or_create(
                username=cust_data['username'],
                defaults={
                    'email': cust_data['email'],
                    'first_name': cust_data['first_name'],
                    'last_name': cust_data['last_name'],
                }
            )
            if created:
                user.set_password('customer123')
                user.save()
                customers.append(user)
                self.stdout.write(f'  ✓ Created customer: {user.username}')

        # Create orders
        self.stdout.write('\nCreating orders...')
        order_statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
        
        for i in range(20):
            if not customers or not products:
                break
                
            customer = random.choice(customers)
            num_items = random.randint(1, 4)
            order_products = random.sample(products, min(num_items, len(products)))
            
            total_amount = sum(p.price * random.randint(1, 3) for p in order_products)
            
            order = Order.objects.create(
                user=customer,
                total_amount=total_amount,
                status=random.choice(order_statuses),
                shipping_address=f'{random.randint(1, 999)} Street, City, State {random.randint(100000, 999999)}',
            )
            
            for product in order_products:
                quantity = random.randint(1, 3)
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    vendor=product.vendor,
                    quantity=quantity,
                    price=product.price
                )
            
            if i % 5 == 0:
                self.stdout.write(f'  ✓ Created {i+1} orders...')

        self.stdout.write(self.style.SUCCESS('\n✅ Dummy data loaded successfully!'))
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  - Categories: {Category.objects.count()}')
        self.stdout.write(f'  - Vendors: {User.objects.filter(is_vendor=True, vendor_status="approved").count()}')
        self.stdout.write(f'  - Products: {Product.objects.count()}')
        self.stdout.write(f'  - Customers: {len(customers)}')
        self.stdout.write(f'  - Orders: {Order.objects.count()}')
        self.stdout.write(self.style.SUCCESS('\n🎉 All done!'))
