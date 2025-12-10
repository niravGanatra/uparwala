from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import VendorProfile, Wallet, Withdrawal
from .serializers import VendorProfileSerializer, WalletSerializer, WithdrawalSerializer
from products.models import Product
from orders.models import OrderItem
from .wallet_views import VendorWalletStatsView

class VendorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return VendorProfile.objects.get(user=self.request.user)

class WalletView(generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Wallet.objects.get(vendor__user=self.request.user)

class WithdrawalListCreateView(generics.ListCreateAPIView):
    serializer_class = WithdrawalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Withdrawal.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        vendor = VendorProfile.objects.get(user=self.request.user)
        serializer.save(vendor=vendor)


class VendorStatsView(APIView):
    """Get vendor dashboard statistics"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            vendor_profile = VendorProfile.objects.get(user=request.user)
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor profile not found'}, status=404)

        # Date ranges
        today = timezone.now()
        last_30_days = today - timedelta(days=30)

        # Revenue metrics
        total_revenue = OrderItem.objects.filter(
            vendor=vendor_profile,
            order__status='DELIVERED'
        ).aggregate(total=Sum('price'))['total'] or Decimal('0.00')

        pending_revenue = OrderItem.objects.filter(
            vendor=vendor_profile,
            order__status__in=['PENDING', 'PROCESSING', 'SHIPPED']
        ).aggregate(total=Sum('price'))['total'] or Decimal('0.00')

        # Order metrics
        total_orders = OrderItem.objects.filter(vendor=vendor_profile).values('order').distinct().count()
        pending_orders = OrderItem.objects.filter(vendor=vendor_profile, order__status='PENDING').values('order').distinct().count()

        # Product metrics
        total_products = Product.objects.filter(vendor=vendor_profile).count()
        active_products = Product.objects.filter(vendor=vendor_profile, is_active=True).count()

        # Customer metrics
        total_customers = OrderItem.objects.filter(vendor=vendor_profile).values('order__user').distinct().count()

        # Wallet
        try:
            wallet = Wallet.objects.get(vendor=vendor_profile)
            wallet_balance = wallet.balance
        except Wallet.DoesNotExist:
            wallet_balance = Decimal('0.00')

        return Response({
            'revenue': {
                'total': float(total_revenue),
                'pending': float(pending_revenue),
            },
            'orders': {
                'total': total_orders,
                'pending': pending_orders,
            },
            'products': {
                'total': total_products,
                'active': active_products,
            },
            'customers': {
                'total': total_customers,
            },
            'wallet': {
                'balance': float(wallet_balance),
            },
        })

class VendorApplicationsView(generics.ListAPIView):
    """
    List all pending vendor applications for admin review
    """
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return VendorProfile.objects.filter(verification_status='PENDING')

class ApproveVendorView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            vendor = VendorProfile.objects.get(pk=pk)
            vendor.verification_status = 'APPROVED'
            vendor.save()
            
            # Create wallet if not exists
            Wallet.objects.get_or_create(vendor=vendor)
            
            # Try to send email if notification system is set up
            try:
                from notifications.tasks import send_notification_email
                send_notification_email.delay(
                    'welcome_email',
                    vendor.user.email,
                    {'name': vendor.user.get_full_name() or vendor.user.username}
                )
            except ImportError:
                pass
            
            return Response({'message': 'Vendor approved successfully'})
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)

class RejectVendorView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            vendor = VendorProfile.objects.get(pk=pk)
            vendor.verification_status = 'REJECTED'
            vendor.save()
            return Response({'message': 'Vendor application rejected'})
        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor not found'}, status=404)

class VendorListView(generics.ListAPIView):
    """
    List all approved vendors for admin dropdowns
    """
    serializer_class = VendorProfileSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return VendorProfile.objects.filter(verification_status='APPROVED')


# Vendor Approval Views (Admin Only)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.core.mail import send_mail
from django.conf import settings


@api_view(['GET'])
@permission_classes([IsAdminUser])
def pending_vendors_list(request):
    """List all pending vendor applications"""
    vendors = VendorProfile.objects.filter(verification_status='pending').select_related('user')
    data = []
    for vendor in vendors:
        data.append({
            'id': vendor.id,
            'store_name': vendor.store_name,
            'user_email': vendor.user.email,
            'user_name': vendor.user.username,
            'phone': vendor.phone,
            'city': vendor.city,
            'state': vendor.state,
            'created_at': vendor.created_at,
            'store_description': vendor.store_description,
        })
    return Response({'vendors': data, 'count': len(data)})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_vendor(request, vendor_id):
    """Approve a pending vendor application"""
    try:
        vendor = VendorProfile.objects.get(id=vendor_id)
        
        if vendor.verification_status == 'verified':
            return Response({'message': 'Vendor is already approved'}, status=400)
        
        # Update vendor status
        vendor.verification_status = 'verified'
        vendor.approved_by = request.user
        vendor.approved_at = timezone.now()
        vendor.verified_badge = True
        vendor.save()
        
        # Send email notification
        try:
            send_mail(
                subject='Your Vendor Application has been Approved!',
                message=f'''Dear {vendor.store_name},

Congratulations! Your vendor application has been approved.

You can now start adding products and managing your store on Uparwala.

Login to your vendor dashboard to get started:
{settings.FRONTEND_URL}/vendor/dashboard

If you have any questions, please contact our support team.

Best regards,
Uparwala Team
''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send approval email: {e}")
        
        return Response({
            'message': 'Vendor approved successfully',
            'vendor': {
                'id': vendor.id,
                'store_name': vendor.store_name,
                'verification_status': vendor.verification_status,
            }
        })
    except VendorProfile.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=404)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_vendor(request, vendor_id):
    """Reject a vendor application with reason"""
    try:
        vendor = VendorProfile.objects.get(id=vendor_id)
        reason = request.data.get('reason', 'Your application did not meet our requirements.')
        
        if vendor.verification_status == 'rejected':
            return Response({'message': 'Vendor is already rejected'}, status=400)
        
        # Update vendor status
        vendor.verification_status = 'rejected'
        vendor.rejection_reason = reason
        vendor.approved_by = request.user
        vendor.approved_at = timezone.now()
        vendor.save()
        
        # Send email notification
        try:
            send_mail(
                subject='Update on Your Vendor Application',
                message=f'''Dear {vendor.store_name},

Thank you for your interest in becoming a vendor on Uparwala.

Unfortunately, we are unable to approve your application at this time.

Reason: {reason}

If you believe this is a mistake or would like to reapply, please contact our support team.

Best regards,
Uparwala Team
''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[vendor.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send rejection email: {e}")
        
        return Response({
            'message': 'Vendor rejected',
            'vendor': {
                'id': vendor.id,
                'store_name': vendor.store_name,
                'verification_status': vendor.verification_status,
                'rejection_reason': vendor.rejection_reason,
            }
        })
    except VendorProfile.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def vendor_stats(request):
    """Get vendor application statistics"""
    pending_count = VendorProfile.objects.filter(verification_status='pending').count()
    approved_count = VendorProfile.objects.filter(verification_status='verified').count()
    rejected_count = VendorProfile.objects.filter(verification_status='rejected').count()
    
    return Response({
        'pending': pending_count,
        'approved': approved_count,
        'rejected': rejected_count,
        'total': pending_count + approved_count + rejected_count,
    })
