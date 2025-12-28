from django.test import TestCase
from unittest.mock import patch, MagicMock
from django.utils import timezone
from orders.shiprocket_service import ShiprocketService
from orders.models import Order, OrderItem
from products.models import Product
from vendors.models import VendorProfile
from users.models import User

class ShiprocketSplitOrderTest(TestCase):
    def setUp(self):
        # Create a mock user
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        
        # Create two vendors
        self.vendor1 = VendorProfile.objects.create(
            user=User.objects.create_user(username='vendor1', email='v1@example.com', password='password'),
            store_name='Vendor 1 Store',
            phone='9876543210',
            address='Address 1',
            city='City 1',
            state='State 1',
            zip_code='111111'
        )
        self.vendor2 = VendorProfile.objects.create(
            user=User.objects.create_user(username='vendor2', email='v2@example.com', password='password'),
            store_name='Vendor 2 Store',
            phone='9876543212',
            address='Address 2',
            city='City 2',
            state='State 2',
            zip_code='222222'
        )

        # Create Products
        self.product1 = Product.objects.create(
            name='Item A', vendor=self.vendor1, regular_price=400, stock=10, 
            description='Desc', category=None, slug='item-a'
        )
        self.product2 = Product.objects.create(
            name='Item B', vendor=self.vendor2, regular_price=600, stock=10,
            description='Desc', category=None, slug='item-b'
        )

        # Create Order
        self.order = Order.objects.create(
            user=self.user,
            total_amount=1000,
            payment_method='cod',
            shipping_address_data={
                'full_name': 'Test Customer',
                'address_line1': '123 Test St',
                'city': 'Test City',
                'state': 'Test State',
                'pincode': '400001',
                'phone': '9999999999'
            }
        )

        # Create Order Items
        OrderItem.objects.create(order=self.order, product=self.product1, vendor=self.vendor1, quantity=1, price=400)
        OrderItem.objects.create(order=self.order, product=self.product2, vendor=self.vendor2, quantity=1, price=600)

    @patch('orders.shiprocket_service.requests.post')
    @patch('orders.shiprocket_service.ShiprocketService.get_token')
    def test_split_order_creation(self, mock_get_token, mock_post):
        # Setup Mocks
        mock_get_token.return_value = "dummy_token"
        
        # Mock Response for create order using side_effect for unique IDs
        def side_effect(url, headers, json):
            # We can inspect json here if we want, but returning different IDs is key
            # Simple counter approach or based on payload content
            return MagicMock(
                status_code=200,
                json=lambda: {
                    'order_id': f"SR_123_{json['sub_total']}", # Unique ID based on amount
                    'shipment_id': f"SH_123_{json['sub_total']}",
                    'status': 'NEW'
                }
            )
        mock_post.side_effect = side_effect

        # Initialize Service
        # We need to mock config if it tries to load from DB in __init__ or ensure DB has one
        # The service auto-creates from settings if missing, or we can just create one here
        from orders.shiprocket_models import ShiprocketConfig
        ShiprocketConfig.objects.create(email='test@test.com', password='pass', is_active=True)

        service = ShiprocketService()
        
        # Execute
        service.create_orders(self.order)

        # Assertions
        # 1. Check called twice (once for each vendor)
        # Note: requests.post might be called more than twice if it syncs pickup locations
        # We need to filter calls to the 'orders/create/adhoc' endpoint
        
        create_calls = [
            call for call in mock_post.call_args_list 
            if '/orders/create/adhoc' in call[0][0]
        ]
        
        self.assertEqual(len(create_calls), 2, "Should create 2 separate Shiprocket orders")

        # 2. Check amounts
        amounts_sent = []
        for call in create_calls:
            payload = call.kwargs['json']
            amounts_sent.append(payload['sub_total'])
            
        # Verify both 400.0 and 600.0 were sent
        self.assertIn(400.0, amounts_sent)
        self.assertIn(600.0, amounts_sent)
        
        print(f"Verified Shiprocket Order Split: Amounts {amounts_sent} correctly matched Vendor Item constants.")
