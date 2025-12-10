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
from orders.models import Order, OrderNote
from products.models import Product, Category

def qa_verification():
    print("--- Starting QA Verification & Bug Hunt ---")
    User = get_user_model()
    
    # Setup Users
    admin, _ = User.objects.get_or_create(username='qa_admin', email='qa_admin@test.com')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    
    vendor_user, _ = User.objects.get_or_create(username='qa_vendor', email='qa_vendor@test.com')
    vendor_user.is_staff = False
    vendor_user.save()
    
    customer_user, _ = User.objects.get_or_create(username='qa_customer', email='qa_customer@test.com')
    customer_user.is_staff = False
    customer_user.save()
    
    client = APIClient()
    
    # ---------------------------------------------------------
    # TEST 1: Security - Role Based Access Control (RBAC)
    # ---------------------------------------------------------
    print("\n[TEST 1] RBAC - Vendor accessing Admin Categories")
    client.force_authenticate(user=vendor_user)
    payload = {"name": "Hacked Cat", "slug": "hacked", "display_type": "default"}
    resp = client.post('/api/products/manage/categories/', payload)
    
    if resp.status_code == 403:
        print("✔ PASS: Vendor blocked from creating Categories.")
    else:
        print(f"✘ FAIL: Vendor could create Category! Status: {resp.status_code}")

    # ---------------------------------------------------------
    # TEST 2: Security - Order Note IDOR (Vulnerability Check)
    # ---------------------------------------------------------
    print("\n[TEST 2] Security - Order Note IDOR")
    # Admin creates an order
    admin_order = Order.objects.create(user=admin, total_amount=500)
    
    # Customer tries to add a note to Admin's order
    client.force_authenticate(user=customer_user)
    note_payload = {
        "order": admin_order.id,
        "content": "I am hacking your notes",
        "is_customer_note": True
    }
    resp = client.post('/api/orders/manage/notes/', note_payload)
    
    if resp.status_code == 201:
        print("✘ FAIL: IDOR Detected! Customer added note to Admin's ID.")
    elif resp.status_code in [403, 400]:
        print("✔ PASS: Customer blocked from adding notes to others' orders.")
    else:
        print(f"⚠ WARN: Unexpected status {resp.status_code}")

    # ---------------------------------------------------------
    # TEST 3: Metadata Integrity
    # ---------------------------------------------------------
    print("\n[TEST 3] Metadata Integrity - Category Description")
    client.force_authenticate(user=admin)
    cat_payload = {
        "name": "QA Category",
        "slug": "qa-cat", 
        "description": "Validating storage",
        "display_type": "subcategories"
    }
    resp = client.post('/api/products/manage/categories/', cat_payload)
    if resp.status_code == 201 and resp.data['description'] == "Validating storage":
        print("✔ PASS: Category Metadata stored correctly.")
    else:
        print(f"✘ FAIL: Metadata storage issue. {resp.data}")

    # Cleanup
    try:
        Order.objects.get(id=admin_order.id).delete()
        Category.objects.filter(slug='qa-cat').delete()
    except:
        pass

if __name__ == "__main__":
    qa_verification()
