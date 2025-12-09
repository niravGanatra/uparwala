import requests
from orders.models import ServiceablePincode
from vendors.models import VendorProfile
from products.models import Product, Category
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from products.views import check_product_pincode

User = get_user_model()

def test_pincode_logic():
    print("--- Setting up Test Data ---")
    factory = APIRequestFactory()
    
    # 1. Setup Global Pincodes (Allow 100001, 100002)
    ServiceablePincode.objects.all().delete()
    ServiceablePincode.objects.create(pincode='100001', city='Test City 1', state='Test State')
    ServiceablePincode.objects.create(pincode='100002', city='Test City 1', state='Test State')
    print("Global Pincodes Set: 100001, 100002")
    
    # 2. Setup Vendor (Allow 100001 only)
    try:
        user = User.objects.get(email='vendor@test.com')
        vendor, created = VendorProfile.objects.get_or_create(user=user)
        vendor.serviceable_pincodes = "100001, 100003" # 100003 is NOT in global
        vendor.save()
        print(f"Vendor Pincodes Set: {vendor.serviceable_pincodes}")
    except Exception as e:
        print(f"Vendor Setup Error: {e}")
        return
    
    # 3. Get a product slug
    product = Product.objects.filter(vendor=vendor).first()
    if not product:
        print("Creating dummy product for testing...")
        category = Category.objects.first()
        if not category:
             category = Category.objects.create(name='Test Cat', slug='test-cat')
        product = Product.objects.create(
            vendor=vendor,
            category=category,
            name='Test Product',
            slug='test-product-factory',
            regular_price=100.00,
            price=100.00,
            description='Test'
        )
    print(f"Testing with Product: {product.name} ({product.slug})")

    # 4. Test Cases
    cases = [
        ('100001', True, "In Global + In Vendor"),
        ('100002', False, "In Global + Not In Vendor"),
        ('100003', False, "Not In Global + In Vendor"),
        ('999999', False, "Not In Global + Not In Vendor")
    ]
    
    for code, expected, reason in cases:
        try:
            # Create request
            request = factory.get(f'/api/products/{product.slug}/check-pincode/?pincode={code}')
            response = check_product_pincode(request, slug=product.slug)
            
            data = response.data
            result = data.get('available')
            status = "PASS" if result == expected else "FAIL"
            print(f"[{status}] Code {code}: Expected {expected} ({reason}) -> Got {result} | Msg: {data.get('message')}")
        except Exception as e:
            print(f"Request Error for {code}: {e}")

test_pincode_logic()
