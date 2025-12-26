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
        'vendor_approved': {
            'subject': "🎉 Your Vendor Application Has Been Approved!",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">Congratulations!</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                        <h2 style="color: #16a34a; margin-top: 0;">Welcome to Uparwala Marketplace</h2>
                        
                        <p>Hi <strong>{context.get('vendor_name')}</strong>,</p>
                        
                        <p>Great news! Your vendor application has been approved. You can now start selling on Uparwala.</p>
                        
                        <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #16a34a;">
                            <p style="margin: 0; color: #166534;"><strong>✓ Your account is now active</strong></p>
                            <p style="margin: 10px 0 0 0; color: #166534;">You can log in and start adding products right away!</p>
                        </div>
                        
                        <h3 style="color: #374151;">Next Steps:</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>Log in to your vendor dashboard</li>
                            <li>Complete your store profile</li>
                            <li>Add your first product</li>
                            <li>Set up payment details for payouts</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/vendor/dashboard" 
                               style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                                Go to Dashboard
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            If you need help getting started, check out our <a href="{settings.FRONTEND_URL}/vendor/help" style="color: #16a34a;">Vendor Guide</a> or contact support.
                        </p>
                    </div>
                </div>
            """
        },
        'vendor_rejected': {
            'subject': "Update on Your Vendor Application",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #dc2626; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="color: white; margin: 0;">Application Update</h1>
                    </div>
                    
                    <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                        <p>Hi <strong>{context.get('vendor_name')}</strong>,</p>
                        
                        <p>Thank you for your interest in selling on Uparwala. After careful review, we're unable to approve your vendor application at this time.</p>
                        
                        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
                            <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #991b1b;">{context.get('reason', 'Please review our vendor guidelines and requirements.')}</p>
                        </div>
                        
                        <p>You can reapply after addressing the issues mentioned above. We're here to help if you have any questions.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{settings.FRONTEND_URL}/vendor/register" 
                               style="background-color: #6b7280; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                                Reapply
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                            Need clarification? Contact us at <a href="mailto:support@uparwala.in" style="color: #dc2626;">support@uparwala.in</a>
                        </p>
                    </div>
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
                </div>
            """
        },
        'welcome_email': {
            'subject': "You're all set! Welcome to the Uparwala community",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Welcome to Uparwala!</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>We're thrilled to have you on board! Your account has been successfully created.</p>
                    
                    <p>At Uparwala, we bring you the best products directly from verified vendors.</p>
                    
                    <a href="{settings.FRONTEND_URL}/" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                        Start Shopping
                    </a>
                </div>
            """
        },
        'password_reset': {
            'subject': "Reset your password",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Password Reset Request</h2>
                    <p>Hi {context.get('customer_name', 'there')},</p>
                    <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
                    
                    <a href="{context.get('reset_url')}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
                        Reset Password
                    </a>
                    
                    <p style="font-size: 12px; color: #666;">Or copy and paste this link into your browser:<br>{context.get('reset_url')}</p>
                </div>
            """
        },
        'payment_received': {
            'subject': f"Payment Received: ₹{context.get('amount')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Payment Successful</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>We have received your payment of <strong>₹{context.get('amount')}</strong>.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #{context.get('order_id')}</p>
                        <p><strong>Transaction ID:</strong> {context.get('transaction_id')}</p>
                    </div>
                </div>
            """
        },
        'order_cancellation': {
            'subject': f"Order #{context.get('order_id')} has been cancelled",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Order Cancelled</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>Your Order #{context.get('order_id')} has been cancelled as requested.</p>
                    
                    {f'<p><strong>Refund Status:</strong> A refund of ₹{context.get("refund_amount")} has been initiated and will reflect in 5-7 days.</p>' if context.get('refund_amount') else ''}
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        View Order Status
                    </a>
                </div>
            """
        },
        'rate_and_review': {
            'subject': "How did you like your purchase?",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Rate Your Purchase</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>It's been a few days since you received your order. We'd love to hear your thoughts!</p>
                    
                    <p><strong>{context.get('product_name')}</strong></p>
                    
                    <a href="{settings.FRONTEND_URL}/products/{context.get('product_slug')}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Write a Review
                    </a>
                </div>
            """
        },
        'return_request_received': {
            'subject': f"We received your return request for Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Return Request Received</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>We've received your return request for Order #{context.get('order_id')}.</p>
                    <p>Our team will review it and get back to you shortly.</p>
                    
                    <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                       style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Track Return Status
                    </a>
                </div>
            """
        },
        'refund_processed': {
            'subject': f"Refund of ₹{context.get('amount')} initiated",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Refund Initiated</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>A refund of <strong>₹{context.get('amount')}</strong> for Order #{context.get('order_id')} has been initiated.</p>
                    <p>It should reflect in your original payment method within 5-7 business days.</p>
                </div>
            """
        },
        'abandoned_cart': {
            'subject': "You left something behind...",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Still Interested?</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>We noticed you left some items in your cart. They're selling out fast!</p>
                    
                    <a href="{settings.FRONTEND_URL}/cart" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Complete Checkout
                    </a>
                </div>
            """
        },
        'back_in_stock': {
            'subject': f"Good news! {context.get('product_name')} is back!",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">Back in Stock!</h2>
                    <p>Hi {context.get('customer_name')},</p>
                    <p>The item you were looking for is back in stock:</p>
                    
                    <p><strong>{context.get('product_name')}</strong></p>
                    
                    <a href="{settings.FRONTEND_URL}/products/{context.get('product_slug')}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Buy Now
                    </a>
                </div>
            """
        }
    }
    
    return templates.get(template_name)
