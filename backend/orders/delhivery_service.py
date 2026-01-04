"""
Delhivery One API Integration Service

Provides functions for:
- Registering vendor warehouses
- Creating shipments (with COD/Prepaid handling)
- Retrieving shipping labels
"""
import requests
import json
import re
import logging
from django.conf import settings
from vendors.models import VendorProfile

logger = logging.getLogger(__name__)


class DelhiveryService:
    """
    Service class for Delhivery One API integration.
    Replaces Shiprocket for shipping operations.
    """
    BASE_URL = "https://track.delhivery.com"
    
    def __init__(self):
        self.token = getattr(settings, 'DELHIVERY_TOKEN', '')
        if not self.token:
            raise ValueError(
                "DELHIVERY_TOKEN not configured. "
                "Please set it in environment variables or settings."
            )
    
    def get_headers(self):
        """Get headers for authenticated API requests."""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Token {self.token}"
        }
    
    def sanitize_phone(self, phone):
        """Sanitize phone number to 10 digits for Delhivery."""
        if not phone:
            return '9999999999'
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', str(phone))
        # If starts with 91 and is 12 digits, remove country code
        if len(digits) == 12 and digits.startswith('91'):
            digits = digits[2:]
        # If starts with 0 and is 11 digits, remove leading 0
        if len(digits) == 11 and digits.startswith('0'):
            digits = digits[1:]
        # Return last 10 digits if still too long
        if len(digits) > 10:
            digits = digits[-10:]
        # If less than 10, pad with 9s
        if len(digits) < 10:
            return '9999999999'
        return digits

    # -------------------------------------------------------------------------
    # Function A: Register Vendor Warehouse
    # -------------------------------------------------------------------------
    def register_vendor_warehouse(self, vendor_profile: VendorProfile) -> bool:
        """
        Register a vendor's address as a Delhivery Warehouse/Pickup Location.
        
        Args:
            vendor_profile: VendorProfile instance with address details
            
        Returns:
            True on success, False on failure
            
        Notes:
            - Warehouse name format: VENDOR_{vendor_id}
            - Saves warehouse name to vendor.delhivery_warehouse_name
        """
        # Validate required address fields
        if not all([
            vendor_profile.phone,
            vendor_profile.address,
            vendor_profile.city,
            vendor_profile.state,
            vendor_profile.zip_code
        ]):
            logger.warning(
                f"Skipping Delhivery warehouse registration for vendor {vendor_profile.id}: "
                "Missing required address fields"
            )
            return False
        
        # Generate unique warehouse name
        warehouse_name = f"VENDOR_{vendor_profile.id}"
        
        # Build payload per Delhivery API spec
        payload = {
            "name": warehouse_name,
            "phone": self.sanitize_phone(vendor_profile.phone),
            "address": vendor_profile.address,
            "city": vendor_profile.city,
            "state": vendor_profile.state,
            "country": "India",
            "pin": vendor_profile.zip_code,
            "return_address": vendor_profile.address,
            "return_city": vendor_profile.city,
            "return_state": vendor_profile.state,
            "return_country": "India",
            "return_pin": vendor_profile.zip_code,
        }
        
        url = f"{self.BASE_URL}/api/backend/clientwarehouse/create/"
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=30
            )
            
            data = response.json() if response.content else {}
            
            if response.status_code in [200, 201]:
                # Success - save warehouse name to vendor
                VendorProfile.objects.filter(pk=vendor_profile.pk).update(
                    delhivery_warehouse_name=warehouse_name
                )
                vendor_profile.refresh_from_db()
                logger.info(f"Registered Delhivery warehouse: {warehouse_name}")
                return True
            
            elif response.status_code == 400:
                # Check if warehouse already exists (common case)
                error_msg = str(data)
                if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                    # Warehouse exists, just update our record
                    VendorProfile.objects.filter(pk=vendor_profile.pk).update(
                        delhivery_warehouse_name=warehouse_name
                    )
                    vendor_profile.refresh_from_db()
                    logger.info(f"Warehouse {warehouse_name} already exists, updated vendor record")
                    return True
                else:
                    logger.error(f"Delhivery warehouse creation failed: {data}")
                    return False
            else:
                logger.error(
                    f"Delhivery API error {response.status_code}: {response.text}"
                )
                return False
                
        except requests.RequestException as e:
            logger.error(f"Delhivery API request failed: {e}")
            raise

    # -------------------------------------------------------------------------
    # Function B: Create Shipment
    # -------------------------------------------------------------------------
    def create_shipment(self, order, vendor_profile: VendorProfile, items: list) -> dict:
        """
        Create a shipment in Delhivery for a specific vendor's items from an order.
        
        This replaces Shiprocket's "Create Order" + "Assign AWB" flow.
        Delhivery assigns AWB automatically upon shipment creation.
        
        Args:
            order: Order model instance
            vendor_profile: VendorProfile for pickup location
            items: List of OrderItem objects for this vendor
            
        Returns:
            dict with 'success', 'awb', 'waybill', and other response data
            
        Notes:
            - COD orders: payment_mode='COD', cod_amount set
            - Prepaid orders: payment_mode='Prepaid', cod_amount=0
        """
        # Get warehouse/pickup location
        pickup_location = getattr(vendor_profile, 'delhivery_warehouse_name', '')
        if not pickup_location:
            # Try to register warehouse first
            if not self.register_vendor_warehouse(vendor_profile):
                raise ValueError(
                    f"Cannot create shipment: Vendor {vendor_profile.id} "
                    "has no registered Delhivery warehouse"
                )
            vendor_profile.refresh_from_db()
            pickup_location = vendor_profile.delhivery_warehouse_name
        
        # Calculate order totals for this vendor's items
        subtotal = sum(item.price * item.quantity for item in items)
        total_weight = 0.5  # Default weight in kg
        
        # Determine payment mode and COD amount
        is_cod = order.payment_method == 'cod'
        cod_amount = float(subtotal) if is_cod else 0
        payment_mode = 'COD' if is_cod else 'Prepaid'
        
        # Extract shipping address
        addr = order.shipping_address_data or {}
        full_name = addr.get('full_name', '')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Build product description
        product_desc = ', '.join([
            f"{item.product.name} x{item.quantity}" for item in items
        ])[:200]  # Limit length
        
        # Delhivery Create Shipment payload
        # Uses the CMU (Create Multiple) endpoint format
        shipment_data = {
            "shipments": [{
                "name": full_name,
                "add": addr.get('address_line1', ''),
                "add2": addr.get('address_line2', ''),
                "city": addr.get('city', ''),
                "state": addr.get('state', ''),
                "country": "India",
                "pin": addr.get('pincode', ''),
                "phone": self.sanitize_phone(addr.get('phone')),
                
                "order": f"{order.id}-{vendor_profile.id}",  # Unique order ID
                "payment_mode": payment_mode,
                "cod_amount": cod_amount,
                "total_amount": float(subtotal),
                
                "seller_name": vendor_profile.store_name,
                "seller_add": vendor_profile.address,
                "seller_inv": str(order.id),  # Invoice number
                
                "quantity": sum(item.quantity for item in items),
                "weight": total_weight,
                "waybill": "",  # Delhivery auto-generates
                
                "client": pickup_location,  # Pickup warehouse
                "commodity_value": float(subtotal),
                "product_desc": product_desc,
                "category_of_goods": "Home Decor",
                
                "consignee_gst_tin": "",
                "seller_gst_tin": "",
                
                "return_name": vendor_profile.store_name,
                "return_add": vendor_profile.address,
                "return_city": vendor_profile.city,
                "return_state": vendor_profile.state,
                "return_country": "India",
                "return_pin": vendor_profile.zip_code,
                "return_phone": self.sanitize_phone(vendor_profile.phone),
            }],
            "pickup_location": {
                "name": pickup_location
            }
        }
        
        url = f"{self.BASE_URL}/api/cmu/create.json"
        
        try:
            # Delhivery expects form-encoded data with JSON in 'data' field
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Token {self.token}",
                "Accept": "application/json"
            }
            
            response = requests.post(
                url,
                data={"format": "json", "data": json.dumps(shipment_data)},
                headers={"Authorization": f"Token {self.token}"},
                timeout=30
            )
            
            data = response.json() if response.content else {}
            
            if response.status_code == 200:
                # Parse response - Delhivery returns packages array
                packages = data.get('packages', [])
                if packages:
                    package = packages[0]
                    waybill = package.get('waybill', '')
                    
                    if waybill:
                        logger.info(
                            f"Created Delhivery shipment: AWB {waybill} "
                            f"for Order {order.id}, Vendor {vendor_profile.store_name}"
                        )
                        return {
                            'success': True,
                            'awb': waybill,
                            'waybill': waybill,
                            'order_id': f"{order.id}-{vendor_profile.id}",
                            'status': package.get('status', ''),
                            'remarks': package.get('remarks', ''),
                            'raw_response': data
                        }
                
                # Check for errors in response
                if not data.get('success', True):
                    error_msg = data.get('error', data.get('rmk', 'Unknown error'))
                    logger.error(f"Delhivery shipment creation failed: {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg,
                        'raw_response': data
                    }
            
            logger.error(f"Delhivery API error {response.status_code}: {response.text}")
            return {
                'success': False,
                'error': f"API error: {response.status_code}",
                'raw_response': data
            }
            
        except requests.RequestException as e:
            logger.error(f"Delhivery API request failed: {e}")
            raise

    def create_shipments_for_order(self, order) -> list:
        """
        Create Delhivery shipments for an order, split by vendor.
        
        This is a convenience method that mirrors Shiprocket's create_orders()
        behavior - splitting items by vendor and creating separate shipments.
        
        Args:
            order: Order model instance with items
            
        Returns:
            List of shipment results (one per vendor)
        """
        from .models import OrderItem  # Avoid circular import
        
        order_items = order.items.select_related('product', 'vendor').all()
        
        # Group items by vendor
        items_by_vendor = {}
        for item in order_items:
            vendor_id = item.vendor.id
            if vendor_id not in items_by_vendor:
                items_by_vendor[vendor_id] = []
            items_by_vendor[vendor_id].append(item)
        
        results = []
        
        for vendor_id, items in items_by_vendor.items():
            vendor = items[0].vendor
            
            try:
                result = self.create_shipment(order, vendor, items)
                results.append({
                    'vendor_id': vendor_id,
                    'vendor_name': vendor.store_name,
                    **result
                })
            except Exception as e:
                logger.error(
                    f"Failed to create shipment for vendor {vendor_id}: {e}"
                )
                results.append({
                    'vendor_id': vendor_id,
                    'vendor_name': vendor.store_name,
                    'success': False,
                    'error': str(e)
                })
        
        return results

    # -------------------------------------------------------------------------
    # Function C: Get Label URL
    # -------------------------------------------------------------------------
    def get_label_url(self, awb_number: str) -> str:
        """
        Get the shipping label PDF URL for a given AWB number.
        
        Args:
            awb_number: The Air Waybill number (waybill)
            
        Returns:
            Direct URL to PDF label download
            
        Raises:
            ValueError: If label cannot be retrieved
        """
        url = f"{self.BASE_URL}/api/p/packing_slip"
        params = {
            "wbns": awb_number,
            "pdf": "true"
        }
        
        try:
            response = requests.get(
                url,
                params=params,
                headers=self.get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('Content-Type', '')
                
                if 'application/pdf' in content_type:
                    # Direct PDF response - return the URL
                    return f"{url}?wbns={awb_number}&pdf=true"
                
                elif 'application/json' in content_type:
                    data = response.json()
                    # Parse JSON for PDF link
                    pdf_url = data.get('pdf_link') or data.get('label_url') or data.get('packages', [{}])[0].get('pdf_download_link', '')
                    if pdf_url:
                        return pdf_url
                    else:
                        raise ValueError(f"No PDF link in response: {data}")
                else:
                    # Assume it's a redirect or direct download URL
                    return f"{url}?wbns={awb_number}&pdf=true"
            else:
                raise ValueError(
                    f"Failed to get label: HTTP {response.status_code} - {response.text}"
                )
                
        except requests.RequestException as e:
            logger.error(f"Failed to get label URL: {e}")
            raise ValueError(f"API request failed: {e}")

    # -------------------------------------------------------------------------
    # Additional Utility Methods
    # -------------------------------------------------------------------------
    def track_shipment(self, awb_number: str) -> dict:
        """
        Track a shipment by AWB number.
        
        Args:
            awb_number: The Air Waybill number
            
        Returns:
            Tracking information dict
        """
        url = f"{self.BASE_URL}/api/v1/packages/json/"
        params = {"waybill": awb_number}
        
        try:
            response = requests.get(
                url,
                params=params,
                headers=self.get_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Tracking API error: {response.status_code}")
                return {"error": f"HTTP {response.status_code}"}
                
        except requests.RequestException as e:
            logger.error(f"Tracking request failed: {e}")
            return {"error": str(e)}

    def cancel_shipment(self, awb_number: str) -> dict:
        """
        Cancel a shipment by AWB number.
        
        Args:
            awb_number: The Air Waybill number
            
        Returns:
            Cancellation result dict
        """
        url = f"{self.BASE_URL}/api/p/edit"
        payload = {
            "waybill": awb_number,
            "cancellation": "true"
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=30
            )
            
            data = response.json() if response.content else {}
            
            if response.status_code == 200:
                logger.info(f"Cancelled shipment: {awb_number}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Cancel API error: {response.text}")
                return {"success": False, "error": response.text}
                
        except requests.RequestException as e:
            logger.error(f"Cancel request failed: {e}")
            return {"success": False, "error": str(e)}

    # -------------------------------------------------------------------------
    # Shipping Rate Calculation
    # -------------------------------------------------------------------------
    def calculate_shipping_rate(
        self, 
        origin_pincode: str, 
        destination_pincode: str, 
        weight: float = 0.5,
        payment_mode: str = 'Prepaid',
        cod_amount: float = 0
    ) -> dict:
        """
        Calculate shipping rate from Delhivery API.
        
        Args:
            origin_pincode: Pickup/origin pincode
            destination_pincode: Delivery pincode
            weight: Package weight in kg (default 0.5)
            payment_mode: 'Prepaid' or 'COD'
            cod_amount: COD amount if payment_mode is 'COD'
            
        Returns:
            dict with shipping cost breakdown
        """
        url = f"{self.BASE_URL}/api/kinko/v1/invoice/charges/.json"
        
        params = {
            "md": "S",  # Surface mode (ground transport)
            "ss": "Delivered",  # Shipment status
            "d_pin": destination_pincode,
            "o_pin": origin_pincode,
            "cgm": int(weight * 1000),  # Weight in grams
            "pt": "Pre-paid" if payment_mode == 'Prepaid' else "COD",
            "cod": cod_amount if payment_mode == 'COD' else 0,
        }
        
        try:
            response = requests.get(
                url,
                params=params,
                headers=self.get_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Parse Delhivery response
                # The response contains an array with charge breakdown
                if isinstance(data, list) and len(data) > 0:
                    charges = data[0]
                    
                    # Extract charge components
                    freight_charge = float(charges.get('total_amount', 0))
                    cod_charge = float(charges.get('cod_charges', 0)) if payment_mode == 'COD' else 0
                    
                    return {
                        'success': True,
                        'total_shipping': freight_charge + cod_charge,
                        'freight_charge': freight_charge,
                        'cod_charge': cod_charge,
                        'zone': charges.get('zone', 'Unknown'),
                        'charged_weight_grams': charges.get('charged_weight', weight * 1000),
                        'origin_pincode': origin_pincode,
                        'destination_pincode': destination_pincode,
                        'payment_mode': payment_mode,
                        'raw_response': charges
                    }
                else:
                    # Fallback if response format unexpected
                    logger.warning(f"Unexpected Delhivery rate response: {data}")
                    return {
                        'success': False,
                        'error': 'Unexpected API response format',
                        'raw_response': data
                    }
            else:
                logger.error(f"Delhivery rate API error: {response.status_code} - {response.text}")
                return {
                    'success': False,
                    'error': f'API error: {response.status_code}'
                }
                
        except requests.RequestException as e:
            logger.error(f"Delhivery rate calculation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def check_pincode_serviceability(self, pincode: str) -> dict:
        """
        Check if a pincode is serviceable by Delhivery.
        
        Args:
            pincode: Pincode to check
            
        Returns:
            dict with serviceability info
        """
        url = f"{self.BASE_URL}/c/api/pin-codes/json/"
        params = {"filter_codes": pincode}
        
        try:
            response = requests.get(
                url,
                params=params,
                headers=self.get_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                delivery_codes = data.get('delivery_codes', [])
                
                if delivery_codes:
                    postal = delivery_codes[0].get('postal_code', {})
                    return {
                        'serviceable': True,
                        'pincode': pincode,
                        'city': postal.get('city', ''),
                        'state': postal.get('state_name', ''),
                        'district': postal.get('district', ''),
                        'cod_available': postal.get('cod', 'N') == 'Y',
                        'prepaid_available': postal.get('pre_paid', 'N') == 'Y',
                        'pickup_available': postal.get('pickup', 'N') == 'Y',
                        'max_weight': postal.get('max_weight', 10),
                        'max_amount': postal.get('max_amount', 50000),
                    }
                else:
                    return {
                        'serviceable': False,
                        'pincode': pincode,
                        'error': 'Pincode not serviceable'
                    }
            else:
                return {
                    'serviceable': False,
                    'pincode': pincode,
                    'error': f'API error: {response.status_code}'
                }
                
        except requests.RequestException as e:
            logger.error(f"Pincode check failed: {e}")
            return {
                'serviceable': False,
                'pincode': pincode,
                'error': str(e)
            }
