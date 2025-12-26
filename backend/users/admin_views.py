from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from users.serializers import UserSerializer
from products.models import Product
from orders.models import Order

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class AdminUserStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_users = User.objects.count()
        vendors = User.objects.filter(is_vendor=True).count()
        # Customers are users who are not vendors and not staff
        customers = User.objects.filter(is_vendor=False, is_staff=False).count()
        
        return Response({
            'total': total_users,
            'vendors': vendors,
            'customers': customers
        })

class AdminProductStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_active=True).count()
        
        return Response({
            'total': total_products,
            'active': active_products
        })

class AdminOrderStatsView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='PENDING').count()
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        
        return Response({
            'total': total_orders,
            'pending': pending_orders,
            'revenue': float(total_revenue)
        })

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


# Vendor Application Management
class VendorApplicationListView(APIView):
    """
    List all vendor applications with filtering by status
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        status_filter = request.query_params.get('status', 'pending')
        
        vendors = User.objects.filter(
            is_vendor=True,
            vendor_status=status_filter
        ).order_by('-vendor_application_date')
        
        serializer = UserSerializer(vendors, many=True)
        return Response(serializer.data)


class VendorApprovalView(APIView):
    """
    Approve a vendor application
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            from django.utils import timezone
            
            vendor = User.objects.get(pk=pk, is_vendor=True)
            vendor.vendor_status = 'approved'
            vendor.vendor_approval_date = timezone.now()
            vendor.vendor_rejection_reason = ''  # Clear any previous rejection reason
            vendor.save()
            
            # Send approval email
            try:
                from notifications.resend_service import send_email_via_resend
                from notifications.email_templates import get_email_template
                
                print(f"[VENDOR APPROVAL EMAIL] Starting email send for vendor: {vendor.username}")
                print(f"[VENDOR APPROVAL EMAIL] Vendor email: {vendor.email}")
                
                context = {
                    'vendor_name': vendor.business_name or vendor.get_full_name() or vendor.username,
                }
                print(f"[VENDOR APPROVAL EMAIL] Email context: {context}")
                
                email_data = get_email_template('vendor_approved', context)
                
                if email_data:
                    print(f"[VENDOR APPROVAL EMAIL] Email template loaded successfully")
                    print(f"[VENDOR APPROVAL EMAIL] Subject: {email_data['subject']}")
                    
                    result = send_email_via_resend(
                        to_email=vendor.email,
                        subject=email_data['subject'],
                        html_content=email_data['content']
                    )
                    print(f"[VENDOR APPROVAL EMAIL] Email sent successfully! Resend response: {result}")
                else:
                    print(f"[VENDOR APPROVAL EMAIL] ERROR: Email template not found!")
            except Exception as e:
                # Log error but don't fail the approval
                print(f"[VENDOR APPROVAL EMAIL] ERROR: Email sending failed: {str(e)}")
                print(f"[VENDOR APPROVAL EMAIL] ERROR Type: {type(e).__name__}")
                import traceback
                print(f"[VENDOR APPROVAL EMAIL] Traceback: {traceback.format_exc()}")
            
            return Response({
                'message': f'Vendor {vendor.username} approved successfully and email sent',
                'vendor': UserSerializer(vendor).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VendorRejectionView(APIView):
    """
    Reject a vendor application
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            vendor = User.objects.get(pk=pk, is_vendor=True)
            vendor.vendor_status = 'rejected'
            vendor.vendor_rejection_reason = request.data.get('reason', 'Application rejected by admin')
            vendor.save()
            
            # Send rejection email
            try:
                from notifications.resend_service import send_email_via_resend
                from notifications.email_templates import get_email_template
                
                context = {
                    'vendor_name': vendor.business_name or vendor.get_full_name() or vendor.username,
                    'reason': vendor.vendor_rejection_reason,
                }
                email_data = get_email_template('vendor_rejected', context)
                
                if email_data:
                    send_email_via_resend(
                        to_email=vendor.email,
                        subject=email_data['subject'],
                        html_content=email_data['content']
                    )
            except Exception as e:
                # Log error but don't fail the rejection
                print(f"Email sending failed: {e}")
            
            return Response({
                'message': f'Vendor {vendor.username} rejected and email sent',
                'vendor': UserSerializer(vendor).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class VendorDeletionView(APIView):
    """
    Delete a vendor and their associated profile
    """
    permission_classes = [IsAdminUser]
    
    def delete(self, request, pk):
        try:
            vendor = User.objects.get(pk=pk, is_vendor=True)
            username = vendor.username
            
            # Delete the vendor user (will cascade to VendorProfile if exists)
            vendor.delete()
            
            return Response({
                'message': f'Vendor {username} deleted successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
