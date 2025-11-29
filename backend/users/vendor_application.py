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
        # First create the user account
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
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
            
            user.save()

            return Response({
                'message': 'Vendor application submitted successfully. Please wait for admin approval.',
                'user_id': user.id,
                'username': user.username,
                'vendor_status': user.vendor_status
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
