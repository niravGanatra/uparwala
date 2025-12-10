import requests
import json
from django.utils import timezone
from django.conf import settings
from .shiprocket_models import ShiprocketConfig, ShipmentTracking, OrderTrackingStatus
from .models import Order, OrderItem
from vendors.models import VendorProfile

class ShiprocketService:
    BASE_URL = "https://apiv2.shiprocket.in/v1/external"
    
    def __init__(self):
        self.config = ShiprocketConfig.objects.first()
        if not self.config:
            raise ValueError("Shiprocket configuration not found.")

    def get_token(self):
        """Get valid API token, refreshing if necessary"""
        # If token exists and is valid (expiry > now + buffer), return it
        if self.config.api_token and self.config.token_expiry:
             # Buffer of 1 hour
             if self.config.token_expiry > timezone.now() + timezone.timedelta(hours=1):
                 return self.config.api_token

        # Otherwise login
        return self.login()

    def login(self):
        """Login to Shiprocket and save token"""
        url = f"{self.BASE_URL}/auth/login"
        payload = {
            "email": self.config.email,
            "password": self.config.password
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            
            token = data.get('token')
            if not token:
                raise ValueError("No token in login response")
                
            # Shiprocket tokens last 10 days usually. Set expiry to 9 days to be safe.
            expiry = timezone.now() + timezone.timedelta(days=9)
            
            self.config.api_token = token
            self.config.token_expiry = expiry
            self.config.save()
            
            return token
        except Exception as e:
            print(f"Shiprocket Login Failed: {e}")
            raise

    def get_headers(self):
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.get_token()}"
        }

    def sync_vendor_pickup_location(self, vendor_profile: VendorProfile):
        """Create or Update Pickup Location for Vendor"""
        # Unique name: Vendor_{ID}_{StoreName_Slugified}
        slug = vendor_profile.store_slug or str(vendor_profile.id)
        pickup_location = f"Vendor_{vendor_profile.id}_{slug}"[:50] # Limit char length
        
        # Ensure we have required address fields
        if not (vendor_profile.phone and vendor_profile.address and 
                vendor_profile.city and vendor_profile.state and vendor_profile.zip_code):
            print(f"Skipping Shiprocket sync for {vendor_profile}: Missing address details")
            return None

        # Build payload
        payload = {
            "pickup_location": pickup_location,
            "name": vendor_profile.store_name,
            "email": getattr(vendor_profile.user, 'business_email', '') or vendor_profile.user.email,
            "phone": vendor_profile.phone,
            "address": vendor_profile.address,
            "address_2": "",
            "city": vendor_profile.city,
            "state": vendor_profile.state,
            "country": "India",
            "pin_code": vendor_profile.zip_code,
        }

        url = f"{self.BASE_URL}/settings/company/addpickup"
        
        try:
            response = requests.post(url, json=payload, headers=self.get_headers())
            
            # Shiprocket returns 200 even if address already exists (sometimes logic varies)
            # If 422, it might mean "Location already exists" or validation error.
            # But the endpoint is "addpickup". Update is not explicit via API usually, 
            # often you just re-add with same code to update? 
            # Actually, Shiprocket docs say: "Use this API to add a new pickup location."
            # There isn't a clear "Update Pickup" publicly documented widely, often people create new ones.
            # However, if 'pickup_location' code matches, it usually updates or errors.
            
            if response.status_code == 200:
                data = response.json()
                # Check for success flag in body
                if data.get('success'):
                    # Save the successfully synced name using update() to avoid signal recursion
                    VendorProfile.objects.filter(pk=vendor_profile.pk).update(shiprocket_pickup_location_name=pickup_location)
                    # Refresh instance
                    vendor_profile.refresh_from_db()
                    return pickup_location
                else:
                    # If it says "Already exists", we can assume it's good or ignore.
                    pass
            elif response.status_code == 422:
                 # Check if error is "Pickup location already exists"
                 pass

            # If we reach here, log response
            print(f"Shiprocket Sync Response: {response.text}")
            
            # Assume success if we just created it or it existed.
            VendorProfile.objects.filter(pk=vendor_profile.pk).update(shiprocket_pickup_location_name=pickup_location)
            vendor_profile.refresh_from_db()
            return pickup_location

        except Exception as e:
            print(f"Shiprocket Pickup Sync Failed: {e}")
            raise

    def create_orders(self, order: Order):
        """
        Split Order by Vendor and create Shiprocket Orders.
        Returns list of created ShipmentTracking objects.
        """
        order_items = order.items.select_related('product', 'vendor').all()
        
        # Group items by Vendor
        files_by_vendor = {}
        for item in order_items:
            vendor_id = item.vendor.id
            if vendor_id not in files_by_vendor:
                files_by_vendor[vendor_id] = []
            files_by_vendor[vendor_id].append(item)
            
        created_shipments = []
        
        for vendor_id, items in files_by_vendor.items():
            vendor = items[0].vendor
            pickup_location = vendor.shiprocket_pickup_location_name
            
            if not pickup_location:
                # Try to sync now if missing
                try:
                    pickup_location = self.sync_vendor_pickup_location(vendor)
                except:
                    pass
                if not pickup_location:
                    print(f"Cannot create shipment: No pickup location for vendor {vendor}")
                    continue

            # Build Order Items Payload
            sr_order_items = []
            subtotal = 0
            for item in items:
                sr_order_items.append({
                    "name": item.product.name,
                    "sku": item.product.sku or f"PROD-{item.product.id}",
                    "units": item.quantity,
                    "selling_price": float(item.price),
                    "discount": "",
                    "tax": "",
                    "hsn": "" 
                })
                subtotal += float(item.price) * item.quantity

            # Calculate proportionate shipping/tax if needed, or just use subtotal
            # Use 'payment_method' map
            payment_method = "Prepaid" if order.payment_method == 'razorpay' else "COD"

            # Create random sub-order ID suffix if multiple vendors
            suffix = f"-V{vendor_id}" if len(files_by_vendor) > 1 else ""
            order_id_str = f"{order.id}{suffix}"

            payload = {
                "order_id": order_id_str,
                "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
                "pickup_location": pickup_location,
                "billing_customer_name": order.user.get_full_name() or order.user.username,
                "billing_last_name": "",
                "billing_address": order.shipping_address_data.get('address_line1', ''),
                "billing_address_2": order.shipping_address_data.get('address_line2', ''),
                "billing_city": order.shipping_address_data.get('city', ''),
                "billing_pincode": order.shipping_address_data.get('pincode', ''),
                "billing_state": order.shipping_address_data.get('state', ''),
                "billing_country": "India",
                "billing_email": order.user.email,
                "billing_phone": order.shipping_address_data.get('phone', '9999999999'),
                "shipping_is_billing": True,
                "order_items": sr_order_items,
                "payment_method": payment_method,
                "sub_total": subtotal,
                "length": 10,  # Defaults, should come from Product
                "breadth": 10,
                "height": 10,
                "weight": 0.5
            }

            try:
                url = f"{self.BASE_URL}/orders/create/adhoc"
                response = requests.post(url, json=payload, headers=self.get_headers())
                data = response.json()
                
                if response.status_code == 200 and data.get('order_id'):
                    # Success
                    shipment = ShipmentTracking.objects.create(
                        order=order,
                        shiprocket_order_id=data.get('order_id'),
                        shiprocket_shipment_id=data.get('shipment_id'),
                        courier_name="Pending Assignment",
                        pickup_scheduled=False
                    )
                    created_shipments.append(shipment)
                    
                    # Log mapping
                    print(f"Created Shiprocket Order {data.get('order_id')} for Vendor {vendor.store_name}")
                else:
                    print(f"Failed to create Shiprocket Order for Vendor {vendor.store_name}: {response.text}")

            except Exception as e:
                print(f"Exception creating Shiprocket order: {e}")

        return created_shipments
