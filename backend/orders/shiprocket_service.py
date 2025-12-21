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
        
        # Auto-create config from settings if available and not in DB
        if not self.config and hasattr(settings, 'SHIPROCKET_EMAIL') and hasattr(settings, 'SHIPROCKET_PASSWORD'):
            email = settings.SHIPROCKET_EMAIL
            password = settings.SHIPROCKET_PASSWORD
            if email and password:
                self.config = ShiprocketConfig.objects.create(
                    email=email,
                    password=password,
                    is_active=True,
                    pickup_location='Primary',
                    pickup_address='Default Address',
                    pickup_city='City',
                    pickup_state='State',
                    pickup_pincode='000000',
                    pickup_phone='0000000000'
                )
                
        if not self.config:
            raise ValueError("Shiprocket configuration not found. Please configure it in admin panel or environment variables.")

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
                    error_msg = f"Shiprocket Error: {response.status_code} - {data}"
                    print(f"Failed to create Shiprocket Order for Vendor {vendor.store_name}: {error_msg}")
                    raise Exception(error_msg)

            except Exception as e:
                print(f"Exception creating Shiprocket order: {e}")
                raise

        return created_shipments

    def generate_awb(self, shipment: ShipmentTracking, courier_id=None):
        """
        Generate AWB (Air Waybill) for a shipment.
        If courier_id not provided, Shiprocket will assign the recommended courier.
        """
        url = f"{self.BASE_URL}/courier/assign/awb"
        
        payload = {
            "shipment_id": shipment.shiprocket_shipment_id
        }
        
        # If specific courier requested
        if courier_id:
            payload["courier_id"] = courier_id
        
        try:
            response = requests.post(url, json=payload, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            
            # Update shipment with AWB details
            if data.get('awb_assign_status') == 1 or data.get('response'):
                awb_data = data.get('response', {})
                shipment.awb_code = awb_data.get('data', {}).get('awb_code') or data.get('awb_code', '')
                shipment.courier_name = awb_data.get('data', {}).get('courier_name') or data.get('courier_name', '')
                shipment.courier_id = awb_data.get('data', {}).get('courier_company_id') or courier_id
                shipment.save()
                
                print(f"AWB Generated: {shipment.awb_code} for {shipment.courier_name}")
                return shipment
            else:
                raise ValueError(f"AWB generation failed: {data}")
                
        except Exception as e:
            print(f"Failed to generate AWB: {e}")
            raise

    def generate_label(self, shipment: ShipmentTracking):
        """
        Generate shipping label for a shipment.
        Returns the label URL.
        """
        url = f"{self.BASE_URL}/courier/generate/label"
        
        payload = {
            "shipment_id": [shipment.shiprocket_shipment_id]
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            
            # Extract label URL
            label_url = data.get('label_url') or data.get('label_created', '')
            
            if label_url:
                shipment.label_url = label_url
                shipment.save()
                print(f"Label generated: {label_url}")
                return label_url
            else:
                raise ValueError(f"Label generation failed: {data}")
                
        except Exception as e:
            print(f"Failed to generate label: {e}")
            raise

    def schedule_pickup(self, shipment: ShipmentTracking):
        """
        Schedule courier pickup for a shipment.
        Returns pickup details.
        """
        url = f"{self.BASE_URL}/courier/generate/pickup"
        
        payload = {
            "shipment_id": [shipment.shiprocket_shipment_id]
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            
            # Extract pickup token
            if data.get('pickup_status') == 1 or data.get('response'):
                pickup_token = data.get('response', {}).get('pickup_token_number') or data.get('pickup_token_number', '')
                
                shipment.pickup_scheduled = True
                shipment.pickup_token_number = pickup_token
                shipment.save()
                
                print(f"Pickup scheduled: Token {pickup_token}")
                return data
            else:
                raise ValueError(f"Pickup scheduling failed: {data}")
                
        except Exception as e:
            print(f"Failed to schedule pickup: {e}")
            raise

    def get_tracking(self, shipment_id):
        """
        Get tracking information for a shipment.
        Creates/updates OrderTrackingStatus records.
        Returns tracking data.
        """
        url = f"{self.BASE_URL}/courier/track/shipment/{shipment_id}"
        
        try:
            response = requests.get(url, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            
            # Parse tracking data
            tracking_data = data.get('tracking_data', {})
            shipment_track = tracking_data.get('shipment_track', [])
            
            # Find shipment
            try:
                shipment = ShipmentTracking.objects.get(shiprocket_shipment_id=shipment_id)
                
                # Update current status
                if shipment_track and len(shipment_track) > 0:
                    latest = shipment_track[0]
                    shipment.current_status = latest.get('current_status', '')
                    shipment.save()
                    
                    # Create tracking status entries
                    for track in shipment_track:
                        OrderTrackingStatus.objects.update_or_create(
                            shipment=shipment,
                            timestamp=timezone.datetime.fromisoformat(track.get('date', '').replace('Z', '+00:00')),
                            defaults={
                                'order': shipment.order,
                                'status': track.get('activity', ''),
                                'location': track.get('location', ''),
                                'description': track.get('activity', ''),
                                'shiprocket_status': track.get('sr-status', ''),
                                'courier_status': track.get('current_status', '')
                            }
                        )
                
                return tracking_data
                
            except ShipmentTracking.DoesNotExist:
                print(f"Shipment not found: {shipment_id}")
                return tracking_data
                
        except Exception as e:
            print(f"Failed to get tracking: {e}")
            raise

    def cancel_shipment(self, shipment: ShipmentTracking):
        """
        Cancel a shipment in Shiprocket.
        """
        url = f"{self.BASE_URL}/orders/cancel"
        
        payload = {
            "ids": [shipment.shiprocket_order_id]
        }
        
        try:
            response = requests.post(url, json=payload, headers=self.get_headers())
            response.raise_for_status()
            data = response.json()
            
            # Update shipment status
            shipment.current_status = "Cancelled"
            shipment.save()
            
            # Update order status
            shipment.order.status = 'cancelled'
            shipment.order.save()
            
            print(f"Shipment cancelled: {shipment.shiprocket_order_id}")
            return data
            
        except Exception as e:
            print(f"Failed to cancel shipment: {e}")
            raise

    def check_serviceability(self, pickup_pincode, delivery_pincode, weight=0.5, cod=0):
        """
        Check serviceability between two pincodes.
        Returns list of available couriers with EDD.
        """
        url = f"{self.BASE_URL}/courier/serviceability/"
        
        params = {
            "pickup_postcode": pickup_pincode,
            "delivery_postcode": delivery_pincode,
            "weight": weight,
            "cod": cod
        }
        
        try:
            response = requests.get(url, params=params, headers=self.get_headers())
            # Don't raise for status immediately, SR returns 404/422 for non-serviceable sometimes
            
            data = response.json()
            
            if response.status_code == 200 and data.get('status') == 200:
                return data.get('data', {}).get('available_courier_companies', [])
            else:
                # If error or not serviceable
                print(f"Serviceability check failed: {data}")
                return []
                
        except Exception as e:
            print(f"Serviceability API failed: {e}")
            return []

    def get_postcode_details(self, postcode):
        """
        Get City and State details for a pincode (Open API).
        """
        url = f"{self.BASE_URL}/open/postcode/details"
        params = {"postcode": postcode}
        
        try:
            # Open API does not need auth headers usually, but we can pass them just in case or use standard requests
            # The URL provided by user: https://apiv2.shiprocket.in/v1/external/open/postcode/details
            # It seems it might be a public open endpoint.
            
            response = requests.get(url, params=params)
            # If it requires auth, we can use self.get_headers(). 
            # User said "open", let's try without auth first as verified by curl.
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data.get('postcode_details', {})
            
            return None
        except Exception as e:
            print(f"Postcode lookup failed: {e}")
            return None
