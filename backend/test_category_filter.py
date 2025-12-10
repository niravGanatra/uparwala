
import os
import django
from django.conf import settings

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Changed from uparwala.settings to backend.settings if necessary, checking folder structure.
# Based on previous file paths like `backend/products/models.py`, the project root seems to be `backend/`.
# Let's check where settings.py is. Usually backend/backend/settings.py or backend/uparwala/settings.py.
# The previous files show `backend/orders/shiprocket_serializers.py`, so `backend` is the root of the django project (User's workspace is /Users/niravganatra/Desktop/uparwala).
# So python path should include backend.

import sys
sys.path.append('/Users/niravganatra/Desktop/uparwala/backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from products.views import ProductListView
from products.models import Product, Category
from vendors.models import VendorProfile
from django.contrib.auth import get_user_model

def test_filtering():
    User = get_user_model()
    
    # 1. Setup Data
    user, _ = User.objects.get_or_create(username='test_vendor_filter', email='vendor_filter@example.com')
    vendor, _ = VendorProfile.objects.get_or_create(user=user, defaults={'business_name': 'Test Vendor'})
    
    cat1, _ = Category.objects.get_or_create(name='Test Cat 1', slug='test-cat-1')
    cat2, _ = Category.objects.get_or_create(name='Test Cat 2', slug='test-cat-2')
    
    Product.objects.filter(slug__startswith='test-prod-').delete()
    
    p1 = Product.objects.create(
        name='Test Prod 1',
        slug='test-prod-1',
        vendor=vendor,
        category=cat1,
        regular_price=100,
        price=100,
        is_active=True
    )
    
    p2 = Product.objects.create(
        name='Test Prod 2',
        slug='test-prod-2',
        vendor=vendor,
        category=cat2,
        regular_price=200,
        price=200,
        is_active=True
    )
    
    print(f"Created products: {p1.category.slug}, {p2.category.slug}")
    
    # 2. Test Request
    factory = APIRequestFactory()
    view = ProductListView.as_view()
    
    # URL: /api/products/?category__slug=test-cat-1
    request = factory.get('/api/products/', {'category__slug': 'test-cat-1'})
    response = view(request)
    
    print(f"Filtering by category__slug='test-cat-1' Status: {response.status_code}")
    print(f"Results Count: {len(response.data.get('results', response.data))}")
    
    for item in response.data.get('results', response.data):
        print(f" - Found: {item['name']} (Cat: {item['category']['slug'] if isinstance(item['category'], dict) else item['category']})")

if __name__ == '__main__':
    try:
        test_filtering()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
