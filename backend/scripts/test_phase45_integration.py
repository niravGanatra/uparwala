import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from orders.models import Cart, CartItem, Order
from products.models import Product, VendorProfile, StockNotification, Category
from django.core.management import call_command

def run_test():
    print("--- Starting Integration Test ---")
    
    # 1. Setup User and Vendor
    email = "niravganatra09@gmail.com"
    user, created = User.objects.get_or_create(email=email, defaults={'username': 'testuser2', 'first_name': 'Nirav'})
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"Created user: {email}")
    else:
        print(f"Using existing user: {email}")

    vendor_email = 'vendor@test.com'
    try:
        vendor_user = User.objects.get(email=vendor_email)
    except User.DoesNotExist:
        vendor_user = User.objects.create(email=vendor_email, username='vendor_test_unique', first_name='Vendor')
        
    vendor, _ = VendorProfile.objects.get_or_create(user=vendor_user, defaults={'business_name': 'Test Vendor'})
    
    category, _ = Category.objects.get_or_create(name="Test Category", slug="test-cat")

    # 2. Test Abandoned Cart
    print("\n[Testing Abandoned Cart]")
    # Create product for cart
    product1, _ = Product.objects.get_or_create(
        name="Cart Item Product",
        slug="cart-item-product",
        defaults={
            'vendor': vendor,
            'category': category,
            'regular_price': 500,
            'price': 500,
            'stock': 10
        }
    )
    
    # Create Cart
    cart, _ = Cart.objects.get_or_create(user=user)
    CartItem.objects.create(cart=cart, product=product1, quantity=1)
    
    # FORCE update timestamp to 30 hours ago (between 24 and 48)
    cart.updated_at = timezone.now() - timedelta(hours=30)
    cart.save(update_fields=['updated_at']) # Note: verify auto_now doesn't override this again immediately? 
    # Actually auto_now=True forces update on save. We need to use update() on queryset to bypass auto_now.
    Cart.objects.filter(id=cart.id).update(updated_at=timezone.now() - timedelta(hours=30))
    
    print("Created cart and manually aged it to 30 hours ago.")
    
    print("Running send_abandoned_cart command...")
    try:
        call_command('send_abandoned_cart')
    except Exception as e:
        print(f"Error running command: {e}")

    # 3. Test Back in Stock
    print("\n[Testing Back in Stock]")
    # Create Out of Stock Product
    product2, created = Product.objects.get_or_create(
        name="Out of Stock Product",
        slug="oos-product",
        defaults={
            'vendor': vendor,
            'category': category,
            'regular_price': 1000,
            'price': 1000,
            'stock': 0,
            'stock_status': 'outofstock',
            'manage_stock': True
        }
    )
    if not created:
        product2.stock = 0
        product2.stock_status = 'outofstock'
        product2.save()
        
    # Subscribe user
    StockNotification.objects.create(product=product2, email=email, notified=False)
    print(f"Subscribed {email} to {product2.name}")
    
    # Update stock to trigger signal
    print("Updating product stock to 5...")
    product2.stock = 5
    product2.stock_status = 'instock'
    product2.save() # This triggers the signal
    
    # Check if notified flag updated
    # notification = StockNotification.objects.get(product=product2, email=email)
    # print(f"Notification status: {'Sent' if notification.notified else 'Pending'}")

    print("\n--- Test Complete ---")

if __name__ == "__main__":
    run_test()
