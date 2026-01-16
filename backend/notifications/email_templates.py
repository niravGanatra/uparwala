from django.conf import settings

def get_email_template(template_name, context):
    """
    Returns the subject and HTML content for a given template name
    """
    templates = {
        'order_confirmation': {
            'subject': f"Invoice: Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333; font-size: 14px; line-height: 1.5;">
                    <!-- Header -->
                    <div style="border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td valign="top">
                                    <h1 style="color: #f97316; margin: 0; font-size: 24px;">Uparwala</h1>
                                    <p style="margin: 5px 0 0; color: #666;">Order Invoice</p>
                                </td>
                                <td valign="top" style="text-align: right;">
                                    <h3 style="margin: 0; color: #333;">Order #{context.get('order_id')}</h3>
                                    <p style="margin: 5px 0 0; color: #666;">Date: {context.get('order_date')}</p>
                                    <p style="margin: 2px 0 0; color: #666;">Status: <span style="font-weight: bold; text-transform: uppercase;">{context.get('status')}</span></p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Addresses -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                            <td width="48%" valign="top" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Billing Address</h4>
                                <p style="margin: 0;"><strong>{context.get('billing_address', {}).get('full_name')}</strong></p>
                                <p style="margin: 2px 0;">{context.get('billing_address', {}).get('address_line1')}</p>
                                <p style="margin: 2px 0;">{context.get('billing_address', {}).get('address_line2', '')}</p>
                                <p style="margin: 2px 0;">{context.get('billing_address', {}).get('city')}, {context.get('billing_address', {}).get('state')} - {context.get('billing_address', {}).get('pincode')}</p>
                                <p style="margin: 5px 0 0;">Ph: {context.get('billing_address', {}).get('phone')}</p>
                            </td>
                            <td width="4%">&nbsp;</td>
                            <td width="48%" valign="top" style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Shipping Address</h4>
                                <p style="margin: 0;"><strong>{context.get('shipping_address', {}).get('full_name')}</strong></p>
                                <p style="margin: 2px 0;">{context.get('shipping_address', {}).get('address_line1')}</p>
                                <p style="margin: 2px 0;">{context.get('shipping_address', {}).get('address_line2', '')}</p>
                                <p style="margin: 2px 0;">{context.get('shipping_address', {}).get('city')}, {context.get('shipping_address', {}).get('state')} - {context.get('shipping_address', {}).get('pincode')}</p>
                                <p style="margin: 5px 0 0;">Ph: {context.get('shipping_address', {}).get('phone')}</p>
                            </td>
                        </tr>
                    </table>

                    <!-- Line Items -->
                    <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background-color: #f3f4f6; text-align: left;">
                                <th style="border-bottom: 2px solid #ddd;">Product</th>
                                <th style="border-bottom: 2px solid #ddd; text-align: center;">Qty</th>
                                <th style="border-bottom: 2px solid #ddd; text-align: right;">Price</th>
                                <th style="border-bottom: 2px solid #ddd; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {''.join([f'''
                            <tr>
                                <td style="border-bottom: 1px solid #eee;">
                                    <strong>{item.product.name}</strong>
                                    <div style="font-size: 12px; color: #666;">Sold by: {item.product.vendor.business_name}</div>
                                </td>
                                <td style="border-bottom: 1px solid #eee; text-align: center;">{item.quantity}</td>
                                <td style="border-bottom: 1px solid #eee; text-align: right;">₹{item.price:.2f}</td>
                                <td style="border-bottom: 1px solid #eee; text-align: right;">₹{(item.price * item.quantity):.2f}</td>
                            </tr>
                            ''' for item in context.get('items', [])])}
                        </tbody>
                    </table>

                    <!-- Summary & Tax Breakdown -->
                    <div style="display: flex; justify-content: flex-end;">
                        <table width="40%" cellpadding="5" cellspacing="0" style="margin-left: auto;">
                            <tr>
                                <td style="text-align: left; color: #666;">Subtotal:</td>
                                <td style="text-align: right;">₹{context.get('subtotal'):.2f}</td>
                            </tr>
                            <tr>
                                <td style="text-align: left; color: #666;">Discount:</td>
                                <td style="text-align: right; color: #16a34a;">-₹{context.get('discount_amount'):.2f}</td>
                            </tr>
                            <tr>
                                <td style="text-align: left; color: #666;">Shipping:</td>
                                <td style="text-align: right;">₹{context.get('shipping_amount'):.2f}</td>
                            </tr>
                            
                            <!-- Tax Section -->
                            <tr>
                                <td colspan="2" style="padding: 10px 0;">
                                    <div style="border-top: 1px dashed #ddd; border-bottom: 1px dashed #ddd; padding: 5px 0;">
                                        <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px; color: #666;">Tax ({'Inter-State' if context.get('tax_breakdown', {}).get('type') == 'inter_state' else 'Intra-State'})</div>
                                        
                                        <table width="100%" style="font-size: 11px; color: #666;">
                                             <tr>
                                                <td>CGST:</td>
                                                <td align="right">₹{context.get('tax_breakdown', {}).get('cgst', 0):.2f}</td>
                                            </tr>
                                            <tr>
                                                <td>SGST:</td>
                                                <td align="right">₹{context.get('tax_breakdown', {}).get('sgst', 0):.2f}</td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>

                            <tr style="font-size: 16px; font-weight: bold;">
                                <td style="border-top: 2px solid #333; padding-top: 10px;">Total:</td>
                                <td style="border-top: 2px solid #333; padding-top: 10px; text-align: right;">₹{context.get('total_amount'):.2f}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                        <p>Thank you for shopping with Uparwala!</p>
                        <p>Need help? Contact support@uparwala.in</p>
                        
                        <a href="{settings.FRONTEND_URL}/orders/{context.get('order_id')}" 
                           style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
                            View Order Details
                        </a>
                    </div>
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
            'subject': "You're all set! Welcome to the Uparwala community",
            'content': f'''
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
            '''
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
        },

        # --- Vendor Notifications ---

        # Phase 1: Onboarding
        'vendor_registration_received': {
            'subject': "We received your application for Uparwala",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Application Received</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Thanks for applying to sell on Uparwala. We've received your documents.</p>
                    <p>We will verify your GST and PAN details within 48 hours.</p>
                </div>
            """
        },
        'vendor_account_approved': {
            'subject': "Congratulations! Your Seller Account is Active",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Welcome Aboard!</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Your documents have been verified and your seller account is now ACTIVE.</p>
                    <p>You can now log in and start uploading products.</p>
                    
                    <a href="{settings.FRONTEND_URL}/vendor/dashboard" 
                       style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Go to Dashboard
                    </a>
                </div>
            """
        },
        'vendor_account_rejected': {
            'subject': "Update on your Seller Application",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Action Required</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>We reviewed your application but found some issues:</p>
                    <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 15px 0;">
                        <p><strong>Reason:</strong> {context.get('reason')}</p>
                    </div>
                    <p>Please update your documents and re-apply.</p>
                </div>
            """
        },

        # Phase 2: Order Management
        'vendor_new_order': {
            'subject': f"New Order #{context.get('order_id')}: Ship by {context.get('ship_by_date')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #f97316;">New Order Received!</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>You have a new order to fulfill.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #{context.get('order_id')}</p>
                        <p><strong>Items:</strong></p>
                        <ul>
                            {context.get('items_html', '')}
                        </ul>
                    </div>

                     <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fed7aa;">
                        <p><strong>Shipping Address:</strong><br>
                        {context.get('shipping_address')}
                        </p>
                    </div>
                    
                    <a href="{settings.FRONTEND_URL}/vendor/orders/{context.get('order_id')}" 
                       style="background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Process Order
                    </a>
                </div>
            """
        },
        'vendor_order_cancelled': {
            'subject': f"CANCELLED: Do not ship Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626;">Order Cancelled</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p><strong>STOP!</strong> Do not pack or ship Order #{context.get('order_id')}.</p>
                    <p>The customer has cancelled this order.</p>
                </div>
            """
        },
        'vendor_sla_warning': {
            'subject': f"Urgent: Order #{context.get('order_id')} is overdue for shipping",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #b45309;">SLA Warning</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Order #{context.get('order_id')} is overdue for shipping.</p>
                    <p>Please ship it immediately to avoid penalties or auto-cancellation.</p>
                    
                     <a href="{settings.FRONTEND_URL}/vendor/orders/{context.get('order_id')}" 
                       style="background-color: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
                        Ship Now
                    </a>
                </div>
            """
        },

        # Phase 3: Product & Inventory
        'vendor_product_status_update': {
            'subject': f"Your product {context.get('product_name')} is now {context.get('status')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: {'#16a34a' if context.get('status') == 'Live' else '#dc2626'};">Product {context.get('status')}</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Your product <strong>{context.get('product_name')}</strong> has been reviewed.</p>
                    
                    {'<p>It is now live on the marketplace.</p>' if context.get('status') == 'Live' else f'<p>It requires changes: {context.get("reason")}</p>'}
                </div>
            """
        },
         'vendor_low_stock': {
            'subject': f"Low Stock Alert: {context.get('product_name')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #b45309;">Low Stock Alert</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>You are running low on stock for <strong>{context.get('product_name')}</strong>.</p>
                    <p>Current Quantity: <strong>{context.get('current_stock')}</strong></p>
                    <p>Please restock soon to avoid missing sales.</p>
                </div>
            """
        },

        # Phase 4: Financials
        'vendor_payout_processed': {
            'subject': f"Payout of ₹{context.get('amount')} has been initiated",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #16a34a;">Payout Initiated</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>A payout of <strong>₹{context.get('amount')}</strong> has been initiated.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p>Total Sales: ₹{context.get('total_sales')}</p>
                        <p>Commission: -₹{context.get('commission')}</p>
                        <hr>
                        <p><strong>Net Payout: ₹{context.get('amount')}</strong></p>
                    </div>
                    <p>Funds should reach your bank in 2-3 business days.</p>
                </div>
            """
        },
        'vendor_commission_invoice': {
            'subject': f"Tax Invoice for Platform Fees - {context.get('month')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Commission Invoice: {context.get('month')}</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>Please find the details of platform fees for {context.get('month')} below.</p>
                     <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Total Commission Charged:</strong> ₹{context.get('total_commission')}</p>
                    </div>
                </div>
            """
        },
        
        # Phase 5: Returns
        'vendor_return_requested': {
            'subject': f"Return Requested for Order #{context.get('order_id')}",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Return Initiated</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>The customer has requested a return for Order #{context.get('order_id')}.</p>
                    <p><strong>Reason:</strong> {context.get('reason')}</p>
                    <p>Please review and approve via your dashboard.</p>
                </div>
            """
        },
        'vendor_rto_delivered': {
            'subject': f"RTO Delivered: Order #{context.get('order_id')} has been returned to you",
            'content': f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4b5563;">RTO Delivered</h2>
                    <p>Hi {context.get('vendor_name')},</p>
                    <p>The package for Order #{context.get('order_id')} was undelivered and has been returned to you.</p>
                    <p>Please update your inventory accordingly.</p>
                </div>
            """
        }
    }
    
    return templates.get(template_name)
