from decimal import Decimal
from payments.models import ShippingZone


class ShippingCalculator:
    """Calculate shipping costs based on zones and weight"""
    
    def calculate_shipping(self, cart_items, state_code, subtotal=None):
        """
        Calculate shipping cost
        
        Args:
            cart_items: List of cart items with product and quantity
            state_code: Delivery state code
            subtotal: Cart subtotal (for free shipping threshold)
        
        Returns:
            dict: Shipping cost breakdown
        """
        try:
            # Find shipping zone for the state
            # Note: SQLite doesn't support JSONField contains lookup, so we filter in Python
            all_zones = ShippingZone.objects.filter(is_active=True)
            zone = None
            
            for z in all_zones:
                if z.states and state_code in z.states:
                    zone = z
                    break
            
            if not zone:
                # Default zone if state not found
                zone = ShippingZone.objects.filter(
                    name='Default',
                    is_active=True
                ).first()
                
                if not zone:
                    # Fallback to flat rate
                    return {
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
                        'zone': zone.name,
                        'base_rate': Decimal('0.00'),
                        'weight_charge': Decimal('0.00'),
                        'total_shipping': Decimal('0.00'),
                        'free_shipping': True,
                        'threshold': float(zone.free_shipping_threshold)
                    }
            
            # Calculate total weight
            total_weight = Decimal('0')
            for item in cart_items:
                product = item.product
                quantity = item.quantity
                
                # Get product weight (default 0.5 kg if not set)
                weight = getattr(product, 'weight', 0.5) or 0.5
                total_weight += Decimal(str(weight)) * quantity
            
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
            # Return default shipping cost on error
            return {
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
