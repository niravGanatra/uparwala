from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import RegisterSerializer

User = get_user_model()

class VendorApplicationView(APIView):
    """
    API endpoint for vendor registration/application
    """
    permission_classes = [AllowAny]

    def post(self, request):
        import traceback
        print("Vendor Application: Starting processing...")
        print(f"Data received: {request.data.keys()}")
        
        try:
            # First create the user account
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                print("Vendor Application: Serializer valid, saving user...")
                try:
                    user = serializer.save()
                    print(f"Vendor Application: User created with ID {user.id}")
                except Exception as e:
                    print(f"Vendor Application: Error creating user: {str(e)}")
                    traceback.print_exc()
                    raise e
                
                # Update user as vendor with pending status
                user.is_vendor = True
                user.vendor_status = 'pending'
                user.vendor_application_date = timezone.now()
                
                # Save business details
                user.business_name = request.data.get('business_name', '')
                user.business_email = request.data.get('business_email', user.email)
                user.business_phone = request.data.get('business_phone', '')
                user.business_address = request.data.get('business_address', '')
                user.store_description = request.data.get('store_description', '')
                user.tax_number = request.data.get('tax_number', '')
                
                print("Vendor Application: Saving additional user details...")
                user.save()
                
                # Create VendorProfile for the new vendor
                from vendors.models import VendorProfile
                from django.utils.text import slugify
                
                # Extract new compliance and bank details
                is_food_vendor = request.data.get('is_food_vendor', False)
                if isinstance(is_food_vendor, str):
                    is_food_vendor = is_food_vendor.lower() == 'true'
                
                # Generate unique store slug
                store_name = user.business_name or f"{user.username}'s Store"
                base_slug = slugify(store_name)
                store_slug = base_slug
                counter = 1
                while VendorProfile.objects.filter(store_slug=store_slug).exists():
                    store_slug = f"{base_slug}-{counter}"
                    counter += 1
                
                print(f"Vendor Application: Generated slug {store_slug}. Creating VendorProfile...")
                
                try:
                    VendorProfile.objects.create(
                        user=user,
                        store_name=store_name,
                        store_slug=store_slug,
                        phone=user.business_phone,
                        address=user.business_address,
                        city=request.data.get('city', ''),
                        state=request.data.get('state', ''),
                        zip_code=request.data.get('zip_code', ''),
                        store_description=user.store_description,
                        verification_status='pending',
                        
                        # Compliance & Food License
                        is_food_vendor=is_food_vendor,
                        food_license_number=request.data.get('food_license_number', ''),
                        food_license_certificate=request.FILES.get('food_license_certificate'),
                        
                        # Bank Details
                        bank_account_holder_name=request.data.get('bank_account_holder_name', ''),
                        bank_name=request.data.get('bank_name', ''),
                        bank_branch=request.data.get('bank_branch', ''),
                        bank_account_number=request.data.get('bank_account_number', ''),
                        bank_ifsc_code=request.data.get('bank_ifsc_code', ''),
                        cancelled_cheque=request.FILES.get('cancelled_cheque')
                    )
                    print("Vendor Application: VendorProfile created successfully.")
                    
                    # Send Registration Received Email
                    try:
                        from notifications.resend_service import send_email_via_resend
                        from notifications.email_templates import get_email_template
                        
                        print(f"Vendor Application: Sending registration email to {user.email}")
                        context = {'vendor_name': store_name}
                        email_data = get_email_template('vendor_registration_received', context)
                        
                        if email_data:
                            send_email_via_resend(
                                to_email=user.email,
                                subject=email_data['subject'],
                                html_content=email_data['content']
                            )
                            print("Vendor Application: Registration email sent.")
                    except Exception as email_err:
                        print(f"Vendor Application: Error sending email: {email_err}")

                except Exception as e:
                    # If VendorProfile creation fails, don't fail the whole registration
                    # The user is already created as a vendor with pending status
                    print(f"VendorProfile creation WARNING: {e}")
                    traceback.print_exc()

                return Response({
                    'message': 'Vendor application submitted successfully. Please wait for admin approval.',
                    'user_id': user.id,
                    'username': user.username,
                    'vendor_status': user.vendor_status
                }, status=status.HTTP_201_CREATED)
            
            print("Vendor Application: Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Vendor Application: CRITICAL ERROR: {str(e)}")
            traceback.print_exc()
            return Response(
                {'error': 'Internal server error processing application', 'detail': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VendorStatusView(APIView):
    """
    Get current vendor status for logged-in user
    """
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not request.user.is_vendor:
            return Response({'error': 'Not a vendor'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response({
            'vendor_status': request.user.vendor_status,
            'application_date': request.user.vendor_application_date,
            'approval_date': request.user.vendor_approval_date,
            'rejection_reason': request.user.vendor_rejection_reason,
            'business_name': request.user.business_name,
        })
