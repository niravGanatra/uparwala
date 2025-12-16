from decimal import Decimal
from payments.models import TaxRate


class TaxCalculator:
    """Calculate GST (Goods and Services Tax) for India"""
    
    def __init__(self, business_state='DL'):  # Default: Delhi
        """
        Initialize tax calculator
        
        Args:
            business_state: State code where business is registered
        """
        self.business_state = business_state
    
    def calculate_gst(self, amount, customer_state):
        """
        Calculate GST based on customer location
        
        Args:
            amount: Taxable amount
            customer_state: Customer's state code
        
        Returns:
            dict: Tax breakdown
        """
        try:
            tax_rate = TaxRate.objects.get(state_code=customer_state)
        except TaxRate.DoesNotExist:
            # Default to 18% GST if state not found
            tax_rate = TaxRate(cgst_rate=9.0, sgst_rate=9.0, igst_rate=18.0)
        
        amount = Decimal(str(amount))
        
        # Same state: CGST + SGST
        if customer_state == self.business_state:
            cgst = (amount * Decimal(str(tax_rate.cgst_rate))) / Decimal('100')
            sgst = (amount * Decimal(str(tax_rate.sgst_rate))) / Decimal('100')
            
            return {
                'type': 'intra_state',
                'cgst': float(round(cgst, 2)),
                'sgst': float(round(sgst, 2)),
                'igst': 0.0,
                'total_tax': float(round(cgst + sgst, 2)),
                'tax_rate': float(tax_rate.cgst_rate + tax_rate.sgst_rate)
            }
        
        # Different state: IGST
        else:
            igst = (amount * Decimal(str(tax_rate.igst_rate))) / Decimal('100')
            
            return {
                'type': 'inter_state',
                'cgst': 0.0,
                'sgst': 0.0,
                'igst': float(round(igst, 2)),
                'total_tax': float(round(igst, 2)),
                'tax_rate': float(tax_rate.igst_rate)
            }
    
    def calculate_tax_inclusive(self, total_amount, customer_state):
        """
        Calculate tax when price is tax-inclusive
        
        Args:
            total_amount: Total amount including tax
            customer_state: Customer's state code
        
        Returns:
            dict: Tax breakdown with base amount
        """
        try:
            tax_rate = TaxRate.objects.get(state_code=customer_state)
        except TaxRate.DoesNotExist:
            tax_rate = TaxRate(cgst_rate=9.0, sgst_rate=9.0, igst_rate=18.0)
        
        total_amount = Decimal(str(total_amount))
        
        if customer_state == self.business_state:
            total_rate = tax_rate.cgst_rate + tax_rate.sgst_rate
        else:
            total_rate = tax_rate.igst_rate
        
        # Calculate base amount: total / (1 + tax_rate/100)
        base_amount = total_amount / (Decimal('1') + Decimal(str(total_rate)) / Decimal('100'))
        tax_amount = total_amount - base_amount
        
        return {
            'base_amount': float(round(base_amount, 2)),
            'tax_amount': float(round(tax_amount, 2)),
            'total_amount': float(round(total_amount, 2)),
            'tax_rate': float(total_rate)
        }
    
    def calculate_gst_with_slabs(self, cart_items, customer_state):
        """
        Calculate GST for cart items using product-specific tax slabs
        
        Args:
            cart_items: QuerySet of CartItem objects
            customer_state: Customer's state code
        
        Returns:
            dict: Detailed tax breakdown per item and total
        """
        from products.models import TaxSlab
        
        total_cgst = Decimal('0')
        total_sgst = Decimal('0')
        total_igst = Decimal('0')
        items_breakdown = []
        
        is_intra_state = (customer_state == self.business_state)
        
        for item in cart_items:
            product = item.product
            quantity = Decimal(str(item.quantity))
            
            # Get price (handle deals if exists)
            if hasattr(product, 'active_deal') and product.active_deal:
                price = Decimal(str(product.active_deal.discounted_price))
            else:
                price = Decimal(str(product.price))
            
            item_subtotal = price * quantity
            
            # Get tax slab for this product
            tax_slab = product.tax_slab
            if not tax_slab:
                # Default to 18% if no tax slab assigned
                tax_slab = TaxSlab.objects.filter(rate=Decimal('18.00'), is_active=True).first()
                if not tax_slab:
                    # Create a temporary object for calculation
                    tax_slab = TaxSlab(rate=Decimal('18.00'))
                    tax_slab.cgst_rate = Decimal('9.00')
                    tax_slab.sgst_rate = Decimal('9.00')
                    tax_slab.igst_rate = Decimal('18.00')
            
            # Calculate tax for this item
            if is_intra_state:
                # CGST + SGST
                item_cgst = (item_subtotal * tax_slab.cgst_rate) / Decimal('100')
                item_sgst = (item_subtotal * tax_slab.sgst_rate) / Decimal('100')
                item_igst = Decimal('0')
                item_tax = item_cgst + item_sgst
            else:
                # IGST
                item_cgst = Decimal('0')
                item_sgst = Decimal('0')
                item_igst = (item_subtotal * tax_slab.igst_rate) / Decimal('100')
                item_tax = item_igst
            
            # Add to totals
            total_cgst += item_cgst
            total_sgst += item_sgst
            total_igst += item_igst
            
            # Store item breakdown
            items_breakdown.append({
                'product_id': product.id,
                'product_name': product.name,
                'quantity': int(quantity),
                'price': float(price),
                'subtotal': float(item_subtotal),
                'tax_rate': float(tax_slab.rate),
                'cgst_rate': float(tax_slab.cgst_rate) if is_intra_state else 0.0,
                'sgst_rate': float(tax_slab.sgst_rate) if is_intra_state else 0.0,
                'igst_rate': float(tax_slab.igst_rate) if not is_intra_state else 0.0,
                'cgst_amount': float(round(item_cgst, 2)),
                'sgst_amount': float(round(item_sgst, 2)),
                'igst_amount': float(round(item_igst, 2)),
                'tax_amount': float(round(item_tax, 2)),
            })
        
        total_tax = total_cgst + total_sgst + total_igst
        
        return {
            'type': 'intra_state' if is_intra_state else 'inter_state',
            'cgst': float(round(total_cgst, 2)),
            'sgst': float(round(total_sgst, 2)),
            'igst': float(round(total_igst, 2)),
            'total_tax': float(round(total_tax, 2)),
            'items': items_breakdown
        }

