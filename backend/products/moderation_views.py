from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count
from django.utils import timezone

from .models import ProductModeration, Product
from .admin_serializers import ProductModerationSerializer


class ProductModerationListView(generics.ListAPIView):
    """List all products pending moderation (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ProductModerationSerializer
    
    def get_queryset(self):
        queryset = ProductModeration.objects.select_related(
            'product', 'product__vendor', 'product__category', 'reviewed_by'
        ).all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search by product name or vendor
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(product__name__icontains=search) |
                Q(product__vendor__store_name__icontains=search)
            )
        
        # Filter by category
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(product__category_id=category_id)
        
        return queryset.order_by('-created_at')


class ProductModerationDetailView(generics.RetrieveAPIView):
    """Get product moderation details (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = ProductModerationSerializer
    queryset = ProductModeration.objects.select_related(
        'product', 'product__vendor', 'product__category', 'reviewed_by'
    ).all()


class ApproveProductView(APIView):
    """Approve a product (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            moderation = ProductModeration.objects.select_related('product').get(pk=pk)
        except ProductModeration.DoesNotExist:
            return Response(
                {'error': 'Moderation record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if moderation.status != 'pending':
            return Response(
                {'error': f'Cannot approve product with status: {moderation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get admin notes
        notes = request.data.get('notes', '')
        
        # Update moderation status
        moderation.status = 'approved'
        moderation.reviewed_at = timezone.now()
        moderation.reviewed_by = request.user
        moderation.notes = notes
        moderation.save()
        
        # Update product status
        product = moderation.product
        product.is_active = True
        product.save()
        
        # TODO: Send email notification to vendor
        
        serializer = ProductModerationSerializer(moderation)
        return Response({
            'message': 'Product approved successfully',
            'moderation': serializer.data
        })


class RejectProductView(APIView):
    """Reject a product (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            moderation = ProductModeration.objects.select_related('product').get(pk=pk)
        except ProductModeration.DoesNotExist:
            return Response(
                {'error': 'Moderation record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if moderation.status != 'pending':
            return Response(
                {'error': f'Cannot reject product with status: {moderation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get rejection reason
        rejection_reason = request.data.get('rejection_reason', '')
        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update moderation status
        moderation.status = 'rejected'
        moderation.reviewed_at = timezone.now()
        moderation.reviewed_by = request.user
        moderation.rejection_reason = rejection_reason
        moderation.save()
        
        # Update product status
        product = moderation.product
        product.is_active = False
        product.save()
        
        # TODO: Send email notification to vendor
        
        serializer = ProductModerationSerializer(moderation)
        return Response({
            'message': 'Product rejected',
            'moderation': serializer.data
        })


class RequestChangesView(APIView):
    """Request changes to a product (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            moderation = ProductModeration.objects.select_related('product').get(pk=pk)
        except ProductModeration.DoesNotExist:
            return Response(
                {'error': 'Moderation record not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if moderation.status != 'pending':
            return Response(
                {'error': f'Cannot request changes for product with status: {moderation.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get change request notes
        notes = request.data.get('notes', '')
        if not notes:
            return Response(
                {'error': 'Change request notes are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update moderation status
        moderation.status = 'changes_requested'
        moderation.reviewed_at = timezone.now()
        moderation.reviewed_by = request.user
        moderation.notes = notes
        moderation.save()
        
        # Keep product inactive
        product = moderation.product
        product.is_active = False
        product.save()
        
        # TODO: Send email notification to vendor
        
        serializer = ProductModerationSerializer(moderation)
        return Response({
            'message': 'Changes requested',
            'moderation': serializer.data
        })


class ModerationStatsView(APIView):
    """Get moderation statistics (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        stats = ProductModeration.objects.aggregate(
            total_pending=Count('id', filter=Q(status='pending')),
            total_approved=Count('id', filter=Q(status='approved')),
            total_rejected=Count('id', filter=Q(status='rejected')),
            total_changes_requested=Count('id', filter=Q(status='changes_requested')),
        )
        
        return Response({
            'total_pending': stats['total_pending'] or 0,
            'total_approved': stats['total_approved'] or 0,
            'total_rejected': stats['total_rejected'] or 0,
            'total_changes_requested': stats['total_changes_requested'] or 0,
        })
