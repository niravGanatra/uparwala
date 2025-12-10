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
from payments.models import ShippingZone

def verify_shipping_crud():
    print("--- Verifying Shipping CRUD API ---")
    User = get_user_model()
    
    # 1. Setup Admin User
    admin, _ = User.objects.get_or_create(username='test_admin', email='admin@test.com')
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    
    client = APIClient()
    client.force_authenticate(user=admin)
    
    # 2. Test Create
    payload = {
        "name": "Test Zone",
        "states": ["DL", "MH"],
        "base_rate": "50.00",
        "per_kg_rate": "10.00",
        "free_shipping_threshold": "500.00",
        "is_active": True
    }
    
    response = client.post('/api/payments/shipping-zones/', payload, format='json')
    if response.status_code == 201:
        print("[PASS] Created Shipping Zone.")
        zone_id = response.data['id']
    else:
        print(f"[FAIL] Create failed: {response.status_code} - {response.data}")
        return

    # 3. Test Read
    response = client.get(f'/api/payments/shipping-zones/{zone_id}/')
    if response.status_code == 200:
        print("[PASS] Read Shipping Zone.")
    else:
        print(f"[FAIL] Read failed: {response.status_code}")

    # 4. Test Update
    update_payload = {"name": "Updated Zone Name"}
    response = client.patch(f'/api/payments/shipping-zones/{zone_id}/', update_payload, format='json')
    if response.status_code == 200 and response.data['name'] == "Updated Zone Name":
         print("[PASS] Updated Shipping Zone.")
    else:
         print(f"[FAIL] Update failed: {response.status_code}")

    # 5. Test Delete
    response = client.delete(f'/api/payments/shipping-zones/{zone_id}/')
    if response.status_code == 204:
        print("[PASS] Deleted Shipping Zone.")
    else:
        print(f"[FAIL] Delete failed: {response.status_code}")
        
    # Cleanup
    try:
        ShippingZone.objects.get(id=zone_id).delete()
    except:
        pass
        
    print("Verification Complete.")

if __name__ == "__main__":
    verify_shipping_crud()
