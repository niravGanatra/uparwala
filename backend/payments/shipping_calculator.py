from decimal import Decimal
from payments.models import ShippingZone


class ShippingCalculator:
    """Calculate shipping costs using Delhivery API with fallback to static zones"""
    
    # Default origin pincode (can be overridden per vendor)
    DEFAULT_ORIGIN_PINCODE = '400001'  # Mumbai
    
    def calculate_shipping(self, cart_items, state_code, subtotal=None, destination_pincode=None, payment_mode='Prepaid'):
        """
        Calculate shipping cost using Delhivery API.
        Falls back to static zone-based calculation if API unavailable.
        
        Args:
            cart_items: List of cart items with product and quantity
            state_code: Delivery state code
            subtotal: Cart subtotal (for free shipping threshold)
            destination_pincode: Delivery pincode (required for live rates)
            payment_mode: 'Prepaid' or 'COD'
        
        Returns:
            dict: Shipping cost breakdown
        """
        # Calculate total weight first
        total_weight = Decimal('0')
        for item in cart_items:
            product = item.product
            quantity = item.quantity
            weight = getattr(product, 'weight', 0.5) or 0.5
            total_weight += Decimal(str(weight)) * quantity
        
        # Try live Delhivery rates first
        if destination_pincode:
            live_result = self._calculate_live_shipping(
                cart_items=cart_items,
                destination_pincode=destination_pincode,
                total_weight=float(total_weight),
                subtotal=subtotal,
                payment_mode=payment_mode
            )
            
            if live_result and live_result.get('success'):
                return live_result
        
        # Fallback to static zone-based calculation
        return self._calculate_static_shipping(cart_items, state_code, subtotal, total_weight)
    
    def _calculate_live_shipping(self, cart_items, destination_pincode, total_weight, subtotal=None, payment_mode='Prepaid'):
        """
        Calculate shipping using Delhivery API.
        Groups by vendor and calculates rate for each.
        """
        try:
            from orders.delhivery_service import DelhiveryService
            service = DelhiveryService()
        except (ValueError, ImportError) as e:
            # DELHIVERY_TOKEN not configured - fall back to static
            return None
        
        # Group items by vendor to get origin pincodes
        items_by_vendor = {}
        for item in cart_items:
            vendor = item.product.vendor
            vendor_id = vendor.id if vendor else 0
            if vendor_id not in items_by_vendor:
                items_by_vendor[vendor_id] = {
                    'vendor': vendor,
                    'items': [],
                    'weight': Decimal('0'),
                    'subtotal': Decimal('0')
                }
            items_by_vendor[vendor_id]['items'].append(item)
            weight = getattr(item.product, 'weight', 0.5) or 0.5
            items_by_vendor[vendor_id]['weight'] += Decimal(str(weight)) * item.quantity
            items_by_vendor[vendor_id]['subtotal'] += Decimal(str(item.product.price)) * item.quantity
        
        total_shipping = Decimal('0')
        vendor_breakdown = []
        
        for vendor_id, data in items_by_vendor.items():
            vendor = data['vendor']
            origin_pincode = getattr(vendor, 'zip_code', '') if vendor else ''
            if not origin_pincode:
                origin_pincode = self.DEFAULT_ORIGIN_PINCODE
            
            # Calculate COD amount for this vendor's items
            cod_amount = float(data['subtotal']) if payment_mode == 'COD' else 0
            
            # Call Delhivery API
            result = service.calculate_shipping_rate(
                origin_pincode=origin_pincode,
                destination_pincode=destination_pincode,
                weight=float(data['weight']),
                payment_mode=payment_mode,
                cod_amount=cod_amount
            )
            
            if result.get('success'):
                shipping_cost = Decimal(str(result.get('total_shipping', 0)))
                total_shipping += shipping_cost
                vendor_breakdown.append({
                    'vendor_id': vendor_id,
                    'vendor_name': vendor.store_name if vendor else 'Default',
                    'origin_pincode': origin_pincode,
                    'shipping_cost': float(shipping_cost),
                    'zone': result.get('zone', 'Unknown')
                })
            else:
                # If any vendor fails, return None to trigger fallback
                return None
        
        # Check free shipping threshold from settings (not hardcoded)
        free_shipping = False
        threshold = None
        try:
            from payments.models import ShippingSettings
            settings_obj = ShippingSettings.get_settings()
            threshold = settings_obj.free_shipping_threshold
        except Exception:
            pass  # If settings not available, no free shipping
        
        if threshold and subtotal:
            if Decimal(str(subtotal)) >= threshold:
                total_shipping = Decimal('0')
                free_shipping = True
        
        return {
            'success': True,
            'source': 'delhivery_live',
            'zone': 'Live Rate',
            'base_rate': float(total_shipping),
            'weight_charge': 0.0,
            'total_weight_kg': float(total_weight),
            'total_shipping': float(total_shipping),
            'free_shipping': free_shipping,
            'threshold': float(threshold) if free_shipping and threshold else None,
            'vendor_breakdown': vendor_breakdown
        }
    
    def _calculate_static_shipping(self, cart_items, state_code, subtotal=None, total_weight=None):
        """Fallback static zone-based shipping calculation."""
        try:
            # Calculate weight if not provided
            if total_weight is None:
                total_weight = Decimal('0')
                for item in cart_items:
                    product = item.product
                    quantity = item.quantity
                    weight = getattr(product, 'weight', 0.5) or 0.5
                    total_weight += Decimal(str(weight)) * quantity
            
            # Find shipping zone for the state
            all_zones = ShippingZone.objects.filter(is_active=True)
            zone = None
            
            for z in all_zones:
                if z.states and state_code in z.states:
                    zone = z
                    break
            
            if not zone:
                zone = ShippingZone.objects.filter(
                    name='Default',
                    is_active=True
                ).first()
                
                if not zone:
                    return {
                        'success': True,
                        'source': 'static_fallback',
                        'zone': 'Default',
                        'base_rate': 50.00,
                        'weight_charge': 0.00,
                        'total_shipping': 50.00,
                        'free_shipping': False
                    }
            
            # Check for free shipping threshold
            if zone.free_shipping_threshold and subtotal:
                if Decimal(str(subtotal)) >= zone.free_shipping_threshold:
                    return {
                        'success': True,
                        'source': 'static_zones',
                        'zone': zone.name,
                        'base_rate': Decimal('0.00'),
                        'weight_charge': Decimal('0.00'),
                        'total_shipping': Decimal('0.00'),
                        'free_shipping': True,
                        'threshold': float(zone.free_shipping_threshold)
                    }
            
            # Calculate shipping cost
            base_rate = zone.base_rate
            weight_charge = total_weight * zone.per_kg_rate
            total_shipping = base_rate + weight_charge
            
            # Check for free shipping threshold
            free_shipping_applied = False
            if zone.free_shipping_threshold and subtotal:
                if Decimal(str(subtotal)) >= zone.free_shipping_threshold:
                    total_shipping = Decimal('0.00')
                    base_rate = Decimal('0.00')
                    weight_charge = Decimal('0.00')
                    free_shipping_applied = True
            
            return {
                'success': True,
                'source': 'static_zones',
                'zone': zone.name,
                'base_rate': float(base_rate),
                'weight_charge': float(weight_charge),
                'total_weight_kg': float(total_weight),
                'total_shipping': float(total_shipping),
                'free_shipping': free_shipping_applied,
                'threshold': float(zone.free_shipping_threshold) if free_shipping_applied else None
            }
            
        except Exception as e:
            print(f"Shipping calculation error: {e}")
            return {
                'success': True,
                'source': 'error_fallback',
                'zone': 'Default',
                'base_rate': 50.00,
                'weight_charge': 0.00,
                'total_shipping': 50.00,
                'free_shipping': False,
                'error': str(e)
            }
    
    def get_available_zones(self):
        """Get all active shipping zones"""
        return ShippingZone.objects.filter(is_active=True)
    
    def estimate_delivery_date(self, state_code):
        """
        Estimate delivery date based on zone
        
        Args:
            state_code: Delivery state code
        
        Returns:
            dict: Estimated delivery days
        """
        from datetime import datetime, timedelta
        
        try:
            # Find shipping zone for the state (Python filtering for SQLite compatibility)
            all_zones = ShippingZone.objects.filter(is_active=True)
            zone = None
            
            for z in all_zones:
                if z.states and state_code in z.states:
                    zone = z
                    break
            
            # Default delivery estimates
            if zone and 'Metro' in zone.name:
                min_days = 2
                max_days = 4
            elif zone and 'North' in zone.name or 'South' in zone.name:
                min_days = 3
                max_days = 6
            else:
                min_days = 5
                max_days = 10
            
            today = datetime.now()
            min_date = today + timedelta(days=min_days)
            max_date = today + timedelta(days=max_days)
            
            return {
                'min_days': min_days,
                'max_days': max_days,
                'estimated_min_date': min_date.strftime('%Y-%m-%d'),
                'estimated_max_date': max_date.strftime('%Y-%m-%d')
            }
            
        except Exception as e:
            return {
                'min_days': 5,
                'max_days': 10,
                'error': str(e)
            }
