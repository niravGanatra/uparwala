import random
import string
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.core.files.base import ContentFile
from base64 import b64decode
from products.models import Category, Product, ProductImage
from products.models import ProductReview, ReviewHelpful
from vendors.models import VendorProfile, StoreReview, Wallet, Transaction, PayoutRequest
from orders.models import Order, OrderItem
from users.models import User, Address

User = get_user_model()

# A 1x1 white pixel in base64 as placeholder
DUMMY_IMAGE_DATA = b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=")

class Command(BaseCommand):
    help = 'Populate database with comprehensive Hindu religious dummy data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting religious dummy data population...')

        self.users = self.create_users()
        self.vendors = self.create_vendors()
        self.categories = self.create_categories()
        self.products = self.create_products()
        self.orders = self.create_orders()
        self.create_reviews()
        self.create_finances()

        self.stdout.write(self.style.SUCCESS('Successfully populated full app data!'))

    def create_users(self):
        customers = []
        names = [
            ('Ramesh', 'Gupta'), ('Suresh', 'Patel'), ('Priya', 'Sharma'),
            ('Anjali', 'Verma'), ('Amit', 'Singh'), ('Sneha', 'Reddy')
        ]
        
        for first, last in names:
            username = f"{first.lower()}{random.randint(1,99)}"
            email = f"{username}@example.com"
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    first_name=first,
                    last_name=last
                )
                # Create Address
                Address.objects.create(
                    user=user,
                    full_name=f"{first} {last}",
                    phone=f"98765432{random.randint(10,99)}",
                    address_line1=f"{random.randint(1,100)}, Temple Road",
                    city="Varanasi",
                    state="Uttar Pradesh",
                    pincode="221001",
                    is_default=True
                )
                customers.append(user)
                self.stdout.write(f'Created customer: {username}')
            else:
                customers.append(User.objects.get(username=username))
        return customers

    def create_vendors(self):
        vendors = []
        vendor_data = [
            ("Sanskriti Store", "Premium traditional and religious items"),
            ("Varanasi Divine", "Authentic puja samagri from Kashi"),
            ("Vedic Heritage", "Books, scriptures and ayurvedic products")
        ]

        for name, desc in vendor_data:
            username = f"vendor_{slugify(name).replace('-', '')}"
            email = f"contact@{slugify(name)}.com"
            
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='password123',
                    is_vendor=True,
                    vendor_status='approved'
                )
                profile = VendorProfile.objects.create(
                    user=user,
                    store_name=name,
                    store_slug=slugify(name),
                    store_description=desc
                )
                # Create Wallet
                Wallet.objects.get_or_create(vendor=profile)
                vendors.append(profile)
                self.stdout.write(f'Created vendor: {name}')
            else:
                vendors.append(User.objects.get(username=username).vendor_profile)
        return vendors

    def create_categories(self):
        cats = [
            ("Murtis & Idols", "Brass and Clay Idols"),
            ("Puja Essentials", "Diya, Incense, Kumkum"),
            ("Religious Books", "Gita, Ramayana, Vedas"),
            ("Ethnic Wear", "Dhoti, Kurta, Sarees"),
            ("Vastu / Feng Shui", "Yantras and Decor")
        ]
        categories = []
        for name, desc in cats:
            cat, created = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name, 'description': desc}
            )
            categories.append(cat)
        return categories

    def create_products(self):
        if not self.vendors: return []
        
        products = []
        # (Name, Price, CategoryIndex, Description)
        items = [
            ("Brass Ganesh Idol", 1299.00, 0, "Handcrafted brass Ganesh idol for home temple."),
            ("Marble Krishna Statue", 2599.00, 0, "Premium white marble Krishna playing flute."),
            ("Silver Plated Laxmi", 3100.00, 0, "Silver plated Laxmi devi for Diwali puja."),
            
            ("Pure Ghee Diya Wicks", 299.00, 1, "Ready to use pure cow ghee wicks."),
            ("Sandalwood Incense Sticks", 150.00, 1, "Natural mysore sandalwood agarbatti."),
            ("Puja Thali Set", 850.00, 1, "Complete brass puja thali set with 5 essentials."),
            
            ("Srimad Bhagavad Gita", 450.00, 2, "Hardcover edition with Sanskrit text and translation."),
            ("Ramcharitmanas", 600.00, 2, "Goswami Tulsidas Ramcharitmanas (Large Print)."),
            
            ("Men's Silk Kurta", 1200.00, 3, "Traditional yellow silk kurta for puja ceremonies."),
            ("Cotton Dhoti", 599.00, 3, "Pure white cotton dhoti with gold border."),
            
            ("Shree Yantra", 550.00, 4, "Energized copper Shree Yantra for prosperity.")
        ]

        for name, price, cat_idx, desc in items:
            if Product.objects.filter(name=name).exists():
                products.append(Product.objects.get(name=name))
                continue
                
            vendor = random.choice(self.vendors)
            cat = self.categories[cat_idx]
            
            prod = Product.objects.create(
                vendor=vendor,
                category=cat,
                name=name,
                slug=slugify(name),
                description=desc,
                regular_price=price,
                stock=random.randint(10, 50),
                is_active=True
            )
            ProductImage.objects.create(
                product=prod,
                image=ContentFile(DUMMY_IMAGE_DATA, name=f"{prod.slug}.png"),
                is_primary=True,
                alt_text=name
            )
            products.append(prod)
            self.stdout.write(f'Created product: {name}')
        return products

    def create_orders(self):
        orders = []
        statuses = ['DELIVERED', 'PROCESSING', 'SHIPPED', 'PENDING']
        
        for _ in range(15):
            customer = random.choice(self.users)
            status = random.choice(statuses)
            
            # Create Order
            order = Order.objects.create(
                user=customer,
                status=status,
                total_amount=0,
                shipping_address="123 Temple Street, Varanasi",
                payment_method='razorpay',
                payment_status='paid' if status != 'PENDING' else 'pending',
                created_at=timezone.now() - timedelta(days=random.randint(1, 30))
            )
            
            # Add Items
            total = 0
            for _ in range(random.randint(1, 3)):
                prod = random.choice(self.products)
                qty = random.randint(1, 2)
                price = prod.price
                
                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    quantity=qty,
                    price=price,
                    vendor=prod.vendor
                )
                total += float(price) * qty
            
            order.total_amount = total
            order.save()
            orders.append(order)
            
            # If Delivered, credit Vendor Wallet immediately for simplicity in this script
            if status == 'DELIVERED':
                for item in order.items.all():
                    self.credit_vendor_wallet(item.vendor, item.price * item.quantity, order)
                    
        self.stdout.write(f'Created {len(orders)} orders')
        return orders

    def credit_vendor_wallet(self, vendor, amount, order):
        wallet, _ = Wallet.objects.get_or_create(vendor=vendor)
        # 10% Platform fee
        commission = amount * Decimal('0.10') 
        payout_amount = amount - commission
        
        wallet.balance += payout_amount
        wallet.save()
        
        Transaction.objects.create(
            wallet=wallet,
            amount=payout_amount,
            transaction_type='credit',
            description=f"Earnings for Order #{order.id}",
            balance_after=wallet.balance,
            reference_id=f"ORD-{order.id}"
        )

    def create_reviews(self):
        comments = [
            "Excellent quality, very divine.",
            "Good product but delivery was slow.",
            "Highly recommended for puja.",
            "Authentic and pure.",
            "Satisfied with the purchase."
        ]
        
        # Product Reviews
        for _ in range(20):
            prod = random.choice(self.products)
            user = random.choice(self.users)
            
            if not ProductReview.objects.filter(product=prod, user=user).exists():
                ProductReview.objects.create(
                    product=prod,
                    user=user,
                    rating=random.randint(3, 5),
                    title=random.choice(["Great", "Good", "Divine", "Okay"]),
                    comment=random.choice(comments),
                    is_approved=True,
                    is_verified_purchase=True
                )
                
        # Store Reviews
        for vendor in self.vendors:
            user = random.choice(self.users)
            if not StoreReview.objects.filter(vendor=vendor, customer=user).exists():
                StoreReview.objects.create(
                    vendor=vendor,
                    customer=user,
                    rating=random.randint(4, 5),
                    review=f"One of the best shops for reliable religious items."
                )

    def create_finances(self):
        # Create some random payouts
        for vendor in self.vendors:
            wallet = vendor.wallet
            if wallet.balance > 1000:
                amount = 500
                wallet.balance -= amount
                wallet.save()
                
                PayoutRequest.objects.create(
                    vendor=vendor,
                    requested_amount=amount,
                    status='approved',
                    admin_notes="Weekly payout",
                    approved_at=timezone.now()
                )
                
                Transaction.objects.create(
                    wallet=wallet,
                    amount=amount,
                    transaction_type='debit',
                    description="Payout Withdrawal",
                    balance_after=wallet.balance
                )
