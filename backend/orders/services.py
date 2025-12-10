from django.utils import timezone
from homepage.models import DealOfTheDay
from products.models import Product

class PriceCalculatorService:
    @staticmethod
    def calculate_price(product):
        """
        Calculates the effective price for a product, checking for active deals.
        Returns detailed price breakdown.
        """
        today = timezone.now().date()
        deal = product.daily_deals.filter(
            is_active=True, 
            start_date__lte=today, 
            end_date__gte=today
        ).first()

        original_price = product.price
        
        if deal:
            discount_amount = (original_price * deal.discount_percentage) / 100
            final_price = original_price - discount_amount
            return {
                'price': final_price,
                'original_price': original_price,
                'discount_amount': discount_amount,
                'is_deal': True,
                'deal_id': deal.id
            }
        
        return {
            'price': original_price,
            'original_price': original_price,
            'discount_amount': 0,
            'is_deal': False,
            'deal_id': None
        }

    @staticmethod
    def calculate_cart_total(cart):
        """
        Calculates total for a cart instance.
        """
        total = 0
        discount_total = 0
        subtotal = 0
        
        for item in cart.items.all():
            price_info = PriceCalculatorService.calculate_price(item.product)
            quantity = item.quantity
            
            line_total = price_info['price'] * quantity
            line_discount = price_info['discount_amount'] * quantity
            line_subtotal = price_info['original_price'] * quantity
            
            total += line_total
            discount_total += line_discount
            subtotal += line_subtotal
            
        return {
            'total_amount': total,
            'discount_amount': discount_total,
            'subtotal': subtotal
        }
