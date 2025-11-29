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
