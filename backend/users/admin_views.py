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
            
            return Response({
                'message': f'Vendor {vendor.username} approved successfully',
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
            
            return Response({
                'message': f'Vendor {vendor.username} rejected',
                'vendor': UserSerializer(vendor).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'Vendor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
