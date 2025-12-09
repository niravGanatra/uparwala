import requests
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from .shiprocket_models import ShiprocketConfig, ShipmentTracking, OrderTrackingStatus

logger = logging.getLogger(__name__)


class ShiprocketService:
    """Service class for Shiprocket API integration"""
    
    BASE_URL = "https://apiv2.shiprocket.in/v1/external"
    
    def __init__(self):
        self.config = ShiprocketConfig.objects.filter(is_active=True).first()
        if not self.config:
            raise Exception("Shiprocket configuration not found. Please configure in admin.")
        self.token = self.get_valid_token()
    
    def get_valid_token(self):
        """Get valid API token, refresh if expired"""
        if self.config.api_token and self.config.token_expiry:
            if timezone.now() < self.config.token_expiry:
                logger.info("Using existing Shiprocket token")
                return self.config.api_token
        
        # Token expired or doesn't exist, get new one
        logger.info("Refreshing Shiprocket token")
        return self.authenticate()
    
    def authenticate(self):
        """Authenticate and get API token"""
        url = f"{self.BASE_URL}/auth/login"
        payload = {
            "email": self.config.email,
            "password": self.config.password
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            token = data['token']
            
            # Save token with 10-day expiry
            self.config.api_token = token
            self.config.token_expiry = timezone.now() + timedelta(days=10)
            self.config.save()
            
            logger.info("Successfully authenticated with Shiprocket")
            return token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Shiprocket authentication failed: {str(e)}")
            raise Exception(f"Failed to authenticate with Shiprocket: {str(e)}")
    
    def create_order(self, order):
        """Create order in Shiprocket"""
        url = f"{self.BASE_URL}/orders/create/adhoc"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        # Prepare order items
        order_items = []
        for item in order.items.all():
            order_items.append({
                "name": item.product.name[:50],  # Shiprocket has length limits
                "sku": item.product.sku or f"PROD-{item.product.id}",
                "units": item.quantity,
                "selling_price": str(item.price),
                "discount": "0",
                "tax": "0",
                "hsn": ""
            })
        
        # Get shipping address from JSON
        address_data = order.shipping_address_data
        
        payload = {
            "order_id": str(order.id),
            "order_date": order.created_at.strftime("%Y-%m-%d %H:%M"),
            "pickup_location": self.config.pickup_location,
            "billing_customer_name": address_data.get('full_name', ''),
            "billing_last_name": "",
            "billing_address": address_data.get('address_line1', ''),
            "billing_address_2": address_data.get('address_line2', ''),
            "billing_city": address_data.get('city', ''),
            "billing_pincode": address_data.get('pincode', ''),
            "billing_state": address_data.get('state', ''),
            "billing_country": "India",
            "billing_email": order.user.email,
            "billing_phone": address_data.get('phone', ''),
            "shipping_is_billing": True,
            "order_items": order_items,
            "payment_method": "Prepaid" if order.payment_method == "razorpay" else "COD",
            "sub_total": str(order.subtotal),
            "length": 10,  # Default dimensions (can be customized)
            "breadth": 10,
            "height": 10,
            "weight": 0.5
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Create shipment tracking
            shipment = ShipmentTracking.objects.create(
                order=order,
                shiprocket_order_id=str(data['order_id']),
                shiprocket_shipment_id=str(data.get('shipment_id', ''))
            )
            
            # Update order
            order.shiprocket_order_id = str(data['order_id'])
            order.save()
            
            logger.info(f"Successfully created Shiprocket order {data['order_id']} for Order #{order.id}")
            return shipment
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to create Shiprocket order: {str(e)}")
            raise Exception(f"Failed to create shipment: {str(e)}")
    
    def generate_awb(self, shipment, courier_id=None):
        """Generate AWB (Air Waybill) for shipment"""
        url = f"{self.BASE_URL}/courier/assign/awb"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        # If no courier specified, use recommended courier
        if not courier_id:
            courier_id = self.get_recommended_courier(shipment)
        
        payload = {
            "shipment_id": int(shipment.shiprocket_shipment_id),
            "courier_id": courier_id
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            response_data = data.get('response', {}).get('data', {})
            
            # Update shipment
            shipment.awb_code = response_data.get('awb_code', '')
            shipment.courier_name = response_data.get('courier_name', '')
            shipment.courier_id = courier_id
            shipment.save()
            
            # Update order
            shipment.order.awb_code = shipment.awb_code
            shipment.order.courier_name = shipment.courier_name
            shipment.order.save()
            
            logger.info(f"Generated AWB {shipment.awb_code} for shipment {shipment.id}")
            return shipment
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to generate AWB: {str(e)}")
            raise Exception(f"Failed to generate AWB: {str(e)}")
    
    def get_recommended_courier(self, shipment):
        """Get recommended courier for shipment"""
        url = f"{self.BASE_URL}/courier/serviceability/"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        address_data = shipment.order.shipping_address_data
        
        payload = {
            "pickup_postcode": self.config.pickup_pincode,
            "delivery_postcode": address_data.get('pincode', ''),
            "cod": 1 if shipment.order.payment_method == "cod" else 0,
            "weight": 0.5,
            "declared_value": float(shipment.order.total_amount)
        }
        
        try:
            response = requests.get(url, params=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            available_couriers = data.get('data', {}).get('available_courier_companies', [])
            
            if available_couriers:
                # Return first recommended courier
                return available_couriers[0]['courier_company_id']
            else:
                raise Exception("No courier available for this route")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get recommended courier: {str(e)}")
            raise Exception(f"Failed to get courier recommendations: {str(e)}")
    
    def generate_label(self, shipment):
        """Generate shipping label PDF"""
        url = f"{self.BASE_URL}/courier/generate/label"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "shipment_id": [int(shipment.shiprocket_shipment_id)]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Update shipment
            shipment.label_url = data.get('label_url', '')
            shipment.save()
            
            logger.info(f"Generated label for shipment {shipment.id}")
            return data.get('label_url', '')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to generate label: {str(e)}")
            raise Exception(f"Failed to generate shipping label: {str(e)}")
    
    def track_shipment(self, shipment):
        """Get tracking information"""
        url = f"{self.BASE_URL}/courier/track/shipment/{shipment.shiprocket_shipment_id}"
        headers = {
            "Authorization": f"Bearer {self.token}"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            tracking_data = data.get('tracking_data', {})
            
            if tracking_data:
                # Update shipment status
                shipment_track = tracking_data.get('shipment_track', [])
                if shipment_track:
                    latest = shipment_track[0]
                    shipment.current_status = latest.get('current_status', '')
                    shipment.tracking_url = tracking_data.get('track_url', '')
                    shipment.save()
                    
                    # Create tracking status entry
                    OrderTrackingStatus.objects.create(
                        order=shipment.order,
                        shipment=shipment,
                        status=latest.get('current_status', ''),
                        location=latest.get('location', ''),
                        description=latest.get('status_detail', ''),
                        shiprocket_status=latest.get('sr_status', ''),
                        courier_status=latest.get('courier_status', ''),
                        timestamp=timezone.now()
                    )
            
            logger.info(f"Tracked shipment {shipment.id}")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to track shipment: {str(e)}")
            raise Exception(f"Failed to track shipment: {str(e)}")
    
    def schedule_pickup(self, shipment):
        """Schedule pickup for shipment"""
        url = f"{self.BASE_URL}/courier/generate/pickup"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "shipment_id": [int(shipment.shiprocket_shipment_id)]
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            # Update shipment
            shipment.pickup_scheduled = True
            shipment.pickup_token_number = data.get('pickup_token_number', '')
            shipment.save()
            
            logger.info(f"Scheduled pickup for shipment {shipment.id}")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to schedule pickup: {str(e)}")
            raise Exception(f"Failed to schedule pickup: {str(e)}")
