from django.core.management.base import BaseCommand
from unittest.mock import MagicMock, patch
from orders.shiprocket_service import ShiprocketService
from orders.models import Order, OrderItem
from users.models import User
from vendors.models import VendorProfile
from products.models import Product, Category
from orders.shiprocket_models import ShiprocketConfig
import random

class Command(BaseCommand):
    help = 'Test Shiprocket Integration Logic with Mocking'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Testing Shiprocket Integration Logic ---"))

        # 1. Setup Mock Data
        if not ShiprocketConfig.objects.exists():
            ShiprocketConfig.objects.create(email="test@sr.com", password="pass")

        # Mock Requests
        with patch('orders.shiprocket_service.requests.post') as mock_post:
            # Mock Login Response
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {"token": "mock_token_123", "id": 1}

            service = ShiprocketService()
            token = service.get_token()
            self.stdout.write(f"Token obtained: {token}")

            # 2. Test Pickup Sync
            self.stdout.write("\n--- Testing Vendor Pickup Sync ---")
            
            # Use get_or_create to avoid unique constraint errors on re-run
            user, _ = User.objects.get_or_create(username="vendor_sr_cmd_test", defaults={"email":"v_cmd@sr.com", "is_vendor":True})
            vendor, _ = VendorProfile.objects.get_or_create(
                user=user, 
                defaults={
                    "store_name": "SR Cmd Test Store", 
                    "phone": "9999999999",
                    "address": "123 Vendor St",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "zip_code": "400001"
                }
            )
            
            # Mock Add Pickup Response
            mock_post.return_value.json.return_value = {"success": True, "address": {"pickup_code": "Vendor_X"}}
            
            location_name = service.sync_vendor_pickup_location(vendor)
            self.stdout.write(f"Synced Location: {location_name}")
            
            if location_name and "Vendor_" in location_name:
                 self.stdout.write(self.style.SUCCESS("✅ Pickup Location Synced"))
            else:
                 self.stdout.write(self.style.ERROR("❌ Pickup Location Sync Failed"))

            # 3. Test Order Creation (Multi-Vendor)
            self.stdout.write("\n--- Testing Multi-Vendor Order Split ---")
            
            user2, _ = User.objects.get_or_create(username="vendor_sr_cmd_test2", defaults={"email":"v2_cmd@sr.com", "is_vendor":True})
            vendor2, _ = VendorProfile.objects.get_or_create(
                user=user2, 
                defaults={"store_name": "Store 2 Cmd", "phone": "9876543210", "address": "Addr2", "city": "City2", "state": "State2", "zip_code": "400002"}
            )
            # Ensure valid phone if it was already created incomplete
            if not vendor2.phone:
                vendor2.phone = "9876543210"
                vendor2.save()
            
            cat_name = f"Test Cat SR Cmd {random.randint(1,100000)}"
            cat, _ = Category.objects.get_or_create(name=cat_name, defaults={'slug': f"test-cat-sr-cmd-{random.randint(1,100000)}"})
            p1 = Product.objects.create(
                vendor=vendor, category=cat, name=f"P1-{random.randint(1,1000)}", 
                regular_price=100, stock=10, 
                slug=f"p1-{random.randint(1,100000)}"
            )
            p2 = Product.objects.create(
                vendor=vendor2, category=cat, name=f"P2-{random.randint(1,1000)}", 
                regular_price=200, stock=10,
                slug=f"p2-{random.randint(1,100000)}"
            )
            
            customer, _ = User.objects.get_or_create(username="cust_sr_cmd", defaults={"email":"c_cmd@sr.com"})
            order = Order.objects.create(
                user=customer, 
                total_amount=300, 
                shipping_address_data={"address_line1": "Cust Addr", "city": "Delhi", "state": "Delhi", "pincode": "110001", "phone": "8888888888"}
            )
            OrderItem.objects.create(order=order, product=p1, vendor=vendor, quantity=1, price=100)
            OrderItem.objects.create(order=order, product=p2, vendor=vendor2, quantity=1, price=200)
            
            # Mock Create Order Response
            def create_order_side_effect(*args, **kwargs):
                url = args[0]
                if "login" in url:
                     mock = MagicMock()
                     mock.status_code = 200
                     mock.json.return_value = {"token": "mock_token"}
                     return mock
                if "addpickup" in url:
                     # Simulate Shiprocket response
                     mock = MagicMock()
                     mock.status_code = 200
                     mock.json.return_value = {"success": True}
                     return mock
                if "orders/create" in url:
                     mock = MagicMock()
                     mock.status_code = 200
                     oid = random.randint(1000,9999)
                     mock.json.return_value = {"order_id": oid, "shipment_id": oid+1}
                     return mock
                return MagicMock()

            mock_post.side_effect = create_order_side_effect
            
            shipments = service.create_orders(order)
            self.stdout.write(f"Created Shipments: {len(shipments)}")
            
            if len(shipments) == 2:
                self.stdout.write(self.style.SUCCESS("✅ Correctly created 2 shipments for 2 vendors"))
            else:
                self.stdout.write(self.style.ERROR(f"❌ Failed: Expected 2 shipments, got {len(shipments)}"))
            
            for ship in shipments:
                self.stdout.write(f" - Shipment ID: {ship.shiprocket_order_id} (Order #{ship.order.id})")
