from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from django.utils import timezone

from .models import PayoutRequest, VendorProfile
from .serializers import PayoutRequestSerializer
from .payout_calculator import calculate_pending_payouts, trigger_payout, get_payout_history


class PayoutRequestListView(generics.ListAPIView):
    """List all payout requests (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = PayoutRequestSerializer
    
    def get_queryset(self):
        queryset = PayoutRequest.objects.select_related('vendor', 'vendor__user').all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by vendor
        vendor_id = self.request.query_params.get('vendor_id')
        if vendor_id:
            queryset = queryset.filter(vendor_id=vendor_id)
        
        # Search by vendor name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(vendor__store_name__icontains=search) |
                Q(vendor__user__username__icontains=search)
            )
        
        # Order by most recent first
        return queryset.order_by('-requested_at')


class PayoutRequestDetailView(generics.RetrieveAPIView):
    """Get payout request details (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = PayoutRequestSerializer
    queryset = PayoutRequest.objects.select_related('vendor', 'vendor__user').all()


class CalculatePendingPayoutsView(APIView):
    """Calculate pending payouts for all vendors based on delivered orders"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            pending_payouts = calculate_pending_payouts()
            
            # Calculate summary stats
            total_pending = sum(p['net_payout'] for p in pending_payouts)
            total_commission = sum(p['total_commission'] for p in pending_payouts)
            total_sales = sum(p['total_sales'] for p in pending_payouts)
            
            return Response({
                'pending_payouts': pending_payouts,
                'summary': {
                    'total_vendors': len(pending_payouts),
                    'total_pending_payout': total_pending,
                    'total_commission': total_commission,
                    'total_sales': total_sales
                }
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TriggerPayoutView(APIView):
    """Trigger payout for a specific vendor"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, vendor_id):
        try:
            transaction_id = request.data.get('transaction_id', '')
            notes = request.data.get('notes', '')
            
            result = trigger_payout(
                vendor_id=vendor_id,
                admin_user=request.user,
                transaction_id=transaction_id,
                notes=notes
            )
            
            return Response({
                'message': 'Payout triggered successfully',
                'payout': result
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PayoutHistoryView(APIView):
    """Get payout history"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        try:
            vendor_id = request.query_params.get('vendor_id')
            limit = int(request.query_params.get('limit', 50))
            
            history = get_payout_history(vendor_id=vendor_id, limit=limit)
            
            return Response({
                'history': history,
                'count': len(history)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ApprovePayoutView(APIView):
    """Approve a payout request (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            payout = PayoutRequest.objects.select_related('vendor').get(pk=pk)
        except PayoutRequest.DoesNotExist:
            return Response(
                {'error': 'Payout request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if payout.status != 'pending':
            return Response(
                {'error': f'Cannot approve payout with status: {payout.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get admin notes
        admin_notes = request.data.get('admin_notes', '')
        transaction_id = request.data.get('transaction_id', '')
        
        # Update payout status
        payout.status = 'approved'
        payout.approved_at = timezone.now()
        payout.approved_by = request.user
        payout.admin_notes = admin_notes
        payout.transaction_id = transaction_id
        payout.save()
        
        # Update vendor balance
        vendor = payout.vendor
        vendor.balance -= payout.requested_amount
        vendor.save()
        
        # TODO: Send email notification to vendor
        
        serializer = PayoutRequestSerializer(payout)
        return Response({
            'message': 'Payout approved successfully',
            'payout': serializer.data
        })


class RejectPayoutView(APIView):
    """Reject a payout request (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            payout = PayoutRequest.objects.get(pk=pk)
        except PayoutRequest.DoesNotExist:
            return Response(
                {'error': 'Payout request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if payout.status != 'pending':
            return Response(
                {'error': f'Cannot reject payout with status: {payout.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rejection reason
        rejection_reason = request.data.get('rejection_reason', '')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update payout status
        payout.status = 'rejected'
        payout.rejected_at = timezone.now()
        payout.rejected_by = request.user
        payout.rejection_reason = rejection_reason
        payout.save()
        
        # TODO: Send email notification to vendor
        
        serializer = PayoutRequestSerializer(payout)
        return Response({
            'message': 'Payout rejected',
            'payout': serializer.data
        })


class VendorPayoutStatsView(APIView):
    """Get payout statistics for admin dashboard"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        from django.db.models import Sum, Count
        
        stats = PayoutRequest.objects.aggregate(
            total_pending=Count('id', filter=Q(status='pending')),
            total_approved=Count('id', filter=Q(status='approved')),
            total_rejected=Count('id', filter=Q(status='rejected')),
            pending_amount=Sum('requested_amount', filter=Q(status='pending')),
            approved_amount=Sum('requested_amount', filter=Q(status='approved')),
        )
        
        return Response({
            'total_pending': stats['total_pending'] or 0,
            'total_approved': stats['total_approved'] or 0,
            'total_rejected': stats['total_rejected'] or 0,
            'pending_amount': float(stats['pending_amount'] or 0),
            'approved_amount': float(stats['approved_amount'] or 0),
        })
