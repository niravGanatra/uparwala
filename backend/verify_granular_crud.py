import os
import sys
import django
# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS += ['testserver']

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from products.models import Category, GlobalAttribute
from orders.models import Order, OrderNote

def verify_granular_crud():
    print("--- Verifying Granular CRUD API ---")
    User = get_user_model()
    
    # 1. Setup Admin
    admin, _ = User.objects.get_or_create(username='crud_admin', email='crud_admin@test.com')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    
    client = APIClient()
    client.force_authenticate(user=admin)
    
    # A. Global Attributes
    print("\n[TEST] Global Attributes")
    payload = {
        "name": "Color",
        "slug": "color",
        "default_sort_order": "name",
        "is_active": True
    }
    resp = client.post('/api/products/manage/attributes/global/', payload, format='json')
    if resp.status_code == 201:
        attr_id = resp.data['id']
        print(f"✔ Created Global Attribute: {resp.data['name']}")
        
        # Add Term
        term_payload = {
            "attribute": attr_id,
            "name": "Red",
            "slug": "red",
            "menu_order": 1
        }
        resp2 = client.post('/api/products/manage/attributes/terms/', term_payload, format='json')
        if resp2.status_code == 201:
             print(f"✔ Created Term: {resp2.data['name']}")
        else:
             print(f"✘ Term Failed: {resp2.data}")
    else:
        print(f"✘ Attribute Failed: {resp.data}")

    # B. Categories with Metadata
    print("\n[TEST] Categories Metadata")
    cat_payload = {
        "name": "Test Cat",
        "slug": "test-cat",
        "description": "Category with metadata",
        "display_type": "products"
    }
    resp = client.post('/api/products/manage/categories/', cat_payload, format='json')
    if resp.status_code == 201:
        print(f"✔ Created Category with Description: {resp.data['description']}")
    else:
        print(f"✘ Category Failed: {resp.data}")
        
    # C. Order Notes
    print("\n[TEST] Order Notes")
    order = Order.objects.create(user=admin, total_amount=100)
    
    note_payload = {
        "order": order.id,
        "content": "This is a private note",
        "is_customer_note": False
    }
    resp = client.post('/api/orders/manage/notes/', note_payload, format='json')
    if resp.status_code == 201:
        print(f"✔ Created Private Note: {resp.data['content']}")
        
        # Verify it appears in Order Detail
        resp_order = client.get(f'/api/orders/orders/{order.id}/')
        notes = resp_order.data.get('notes', [])
        if len(notes) > 0 and notes[0]['content'] == "This is a private note":
            print(f"✔ Note embedded in Order Detail correctly.")
        else:
            print(f"✘ Note missing in Order Detail: {notes}")
    else:
        print(f"✘ Note Failed: {resp.data}")

    # Cleanup
    GlobalAttribute.objects.filter(slug='color').delete()
    Category.objects.filter(slug='test-cat').delete()
    order.delete()

if __name__ == "__main__":
    verify_granular_crud()
