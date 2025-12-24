from django.conf import settings

def get_email_template(template_name, context):
    """
    Returns the subject and HTML content for a given template name
    """
    templates = {
        'order_confirmation': {
            'subject': f"Order Confirmation #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Order Confirmed!</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>Thank you for your order. We've received it and will notify you once it ships.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #{context.get('order_id')}</p>
                        <p><strong>Total Amount:</strong> ₹{context.get('total_amount')}</p>
                    </div>
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Order
                    </a>
                </div>
            """
        },
        'order_shipped': {
            'subject': f"Your Order #{context.get('order_id')} has Shipped!",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Order Shipped</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>Great news! Your order has been shipped.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Tracking Number:</strong> {context.get('tracking_number')}</p>
                        <p><strong>Courier:</strong> {context.get('courier_name')}</p>
                    </div>
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Track Order
                    </a>
                </div>
            """
        },
        'order_out_for_delivery': {
            'subject': f"Out for Delivery: Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ea580c;">Out for Delivery</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>Your order is out for delivery and will arrive today!</p>
                    
                    <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
                        <p><strong>Order ID:</strong> #{context.get('order_id')}</p>
                        <p>Please ensure someone is available to receive the package.</p>
                    </div>
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #ea580c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Order
                    </a>
                </div>
            """
        },
        'order_delivered': {
            'subject': f"Delivered: Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Order Delivered</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>Your order has been delivered successfully. We hope you love it!</p>
                    
                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <p><strong>Order ID:</strong> #{context.get('order_id')}</p>
                    </div>
                    
                    <p>If you have any issues, please contact support.</p>
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Rate & Review
                    </a>
                </div>
            """
        },
        'payout_approved': {
            'subject': "Payout Request Approved",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Payout Approved</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Your payout request for <strong>₹{context.get('amount')}</strong> has been approved.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Transaction ID:</strong> {context.get('transaction_id')}</p>
                        <p><strong>Processed Date:</strong> {context.get('date')}</p>
                    </div>
                    
                    <p>The funds should reflect in your account within 2-3 business days.</p>
                </div>
            """
        },
        'product_approved': {
            'subject': "Product Approved",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Product Live!</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Your product <strong>{context.get('product_name')}</strong> has been approved and is now live on the marketplace.</p>
                    
                    <a href="{settings.FRONTEND_URL}/product/{context.get('product_slug')}" 
                       style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Product
                    </a>
                </div>
            """
        },
        'product_rejected': {
            'subject': "Product Review Update",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Product Rejected</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Unfortunately, your product <strong>{context.get('product_name')}</strong> was not approved.</p>
                    
                    <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; color: #991b1b;">
                        <p><strong>Reason:</strong> {context.get('reason')}</p>
                    </div>
                    
                    <p>Please update your product details and submit again.</p>
                </div>
            """
        },
        'welcome_email': {
            'subject': "Welcome to Uparwala!",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Welcome aboard!</h2>
                    <p>Hi {context.get('name')},</p>
                    <p>Thanks for joining Uparwala Marketplace. We're excited to have you.</p>
                    <p>Start exploring thousands of unique products today!</p>
                    
                    <a href="{settings.FRONTEND_URL}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Start Shopping
                    </a>
                </div>
            """
        }
    }
    
    return templates.get(template_name)
