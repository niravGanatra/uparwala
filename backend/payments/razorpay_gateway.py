import razorpay
from django.conf import settings
import hmac
import hashlib


class RazorpayGateway:
    """Razorpay payment gateway integration"""
    
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    def create_order(self, amount, currency='INR', receipt=None, notes=None):
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in smallest currency unit (paise for INR)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            notes: Additional notes (dict)
        
        Returns:
            dict: Razorpay order details
        """
        data = {
            'amount': int(amount * 100),  # Convert to paise
            'currency': currency,
            'receipt': receipt or f'order_{int(amount)}',
            'notes': notes or {}
        }
        
        try:
            order = self.client.order.create(data=data)
            return {
                'success': True,
                'order_id': order['id'],
                'amount': order['amount'],
                'currency': order['currency'],
                'receipt': order['receipt']
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
        
        Returns:
            bool: True if signature is valid
        """
        try:
            # Generate signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return generated_signature == razorpay_signature
        except Exception as e:
            print(f"Signature verification error: {e}")
            return False
    
    def fetch_payment(self, payment_id):
        """Fetch payment details from Razorpay"""
        try:
            payment = self.client.payment.fetch(payment_id)
            return {
                'success': True,
                'payment': payment
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def refund_payment(self, payment_id, amount=None):
        """
        Refund a payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund (None for full refund)
        
        Returns:
            dict: Refund details
        """
        try:
            data = {}
            if amount:
                data['amount'] = int(amount * 100)  # Convert to paise
            
            refund = self.client.payment.refund(payment_id, data)
            return {
                'success': True,
                'refund': refund
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
