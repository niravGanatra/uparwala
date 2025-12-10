from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Sum, Q

from .models import VendorProfile, Wallet, PayoutRequest
from orders.models import OrderItem

class VendorWalletStatsView(APIView):
    """
    Get detailed wallet stats for the logged-in vendor.
    Includes: Balance, Total Earnings, Pending Payouts, Last Payout.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            vendor = VendorProfile.objects.get(user=request.user)
            
            # 1. Wallet Balance
            wallet, _ = Wallet.objects.get_or_create(vendor=vendor)
            balance = wallet.balance
            
            # 2. Total Earnings (All Delivered Orders)
            # Logic: Sum of (price - commission) for all DELIVERED items
            # Simplified: Just sum price for now, or match Payout logic?
            # Let's match Payout logic: Revenue based.
            
            # For accurate total earnings, we should probably sum approved payouts + current balance?
            # Or sum all OrderItems * (1 - commission_rate/100)?
            # Let's stick to what's in the wallet logic if possible, or OrderItem aggregation
            
            # Total Revenue (Gross Sales)
            total_sales = OrderItem.objects.filter(
                vendor=vendor,
                order__status='DELIVERED'
            ).aggregate(total=Sum('price'))['total'] or 0
            
            # 3. Pending Payouts
            # Use the existing calculation logic logic if possible, or simplified:
            # All delivered items NOT in an approved PayoutRequest?
            # Actually, PayoutRequests are created explicitly.
            # "Pending Payouts" usually means PayoutRequests with status='pending'.
            
            pending_payout_requests = PayoutRequest.objects.filter(
                vendor=vendor,
                status='pending'
            ).aggregate(total=Sum('requested_amount'))['total'] or 0
            
            # 4. Last Payout
            last_payout = PayoutRequest.objects.filter(
                vendor=vendor,
                status='approved'
            ).order_by('-approved_at').first()
            
            last_payout_amount = last_payout.requested_amount if last_payout else 0
            last_payout_date = last_payout.approved_at if last_payout else None
            
            # 5. Transaction History (Recent Payouts)
            recent_payouts = PayoutRequest.objects.filter(
                vendor=vendor
            ).order_by('-requested_at')[:5]
            
            history_data = []
            for p in recent_payouts:
                history_data.append({
                    'id': p.id,
                    'type': 'debit' if p.status == 'approved' else 'pending',
                    'amount': float(p.requested_amount),
                    'description': f'Payout Request ({p.status})',
                    'date': p.requested_at,
                    'status': p.status
                })

            return Response({
                'balance': float(balance),
                'totalEarnings': float(total_sales), # Gross sales for now
                'pendingPayouts': float(pending_payout_requests),
                'lastPayout': float(last_payout_amount),
                'lastPayoutDate': last_payout_date,
                'transactions': history_data
            })

        except VendorProfile.DoesNotExist:
            return Response({'error': 'Vendor profile not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
