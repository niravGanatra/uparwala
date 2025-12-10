import os
import sys
# Add current directory to path so 'uparwala' module can be found if it is in the root of backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from orders.models import Order
from django.contrib.auth import get_user_model
from decimal import Decimal

def verify_gaps():
    print("--- Verifying WooCommerce Gaps Integration ---")
    
    # 1. Verify Field Existence
    try:
        Order._meta.get_field('customer_note')
        print("[PASS] 'customer_note' field exists in Order model.")
    except Exception as e:
        print(f"[FAIL] 'customer_note' field missing: {e}")
        return

    # 2. Verify Status Choices
    choices = dict(Order.STATUS_CHOICES)
    required_statuses = ['ON_HOLD', 'FAILED', 'REFUNDED']
    missing = [s for s in required_statuses if s not in choices]
    
    if not missing:
        print("[PASS] All required WooCommerce statuses (ON_HOLD, FAILED, REFUNDED) are present.")
    else:
        print(f"[FAIL] Missing statuses: {missing}")

    # 3. Simulate Order Creation with Note (Mock)
    User = get_user_model()
    user = User.objects.first()
    if not user:
        print("[SKIP] No users found to test order creation.")
        return

    print(f"Creating test order for user: {user.username}")
    order = Order.objects.create(
        user=user,
        total_amount=Decimal('100.00'),
        customer_note="Please ring the doorbell twice.",
        shipping_address="Test Address",
        status='ON_HOLD' # Testing new status
    )
    
    # Retrieve and Check
    saved_order = Order.objects.get(id=order.id)
    if saved_order.customer_note == "Please ring the doorbell twice.":
        print(f"[PASS] customer_note saved correctly: '{saved_order.customer_note}'")
    else:
        print(f"[FAIL] customer_note mismatch. Got: '{saved_order.customer_note}'")
        
    if saved_order.status == 'ON_HOLD':
        print(f"[PASS] Status set to 'ON_HOLD' correctly.")
    else:
        print(f"[FAIL] Status mismatch. Got: {saved_order.status}")

    # Cleanup
    saved_order.delete()
    print("Test Complete.")

if __name__ == "__main__":
    verify_gaps()
