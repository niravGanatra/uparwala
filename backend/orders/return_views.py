from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Order, OrderItem, OrderReturn, OrderStatusHistory
from .serializers import OrderSerializer
from rest_framework import serializers


class OrderReturnSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.id', read_only=True)
    product_name = serializers.CharField(source='order_item.product.name', read_only=True)
    
    class Meta:
        model = OrderReturn
        fields = [
            'id', 'order', 'order_number', 'order_item', 'product_name', 'user',
            'reason', 'description', 'quantity', 'status', 'refund_amount',
            'refund_method', 'refunded_at', 'admin_notes', 'rejection_reason',
            'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'refund_amount', 'refunded_at', 'admin_notes', 'rejection_reason', 'approved_at']


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'order', 'status', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']


class OrderReturnListCreateView(generics.ListCreateAPIView):
    """List returns or create a new return request"""
    serializer_class = OrderReturnSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return OrderReturn.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrderReturnDetailView(generics.RetrieveAPIView):
    """Retrieve return details"""
    serializer_class = OrderReturnSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return OrderReturn.objects.filter(user=self.request.user)


class OrderDetailWithTrackingView(generics.RetrieveAPIView):
    """Get order details with status history"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add status history
        status_history = OrderStatusHistory.objects.filter(order=instance)
        data['status_history'] = OrderStatusHistorySerializer(status_history, many=True).data
        
        return Response(data)


class OrderListWithFiltersView(generics.ListAPIView):
    """List orders with filters"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Order.objects.filter(user=self.request.user)
        
        # Filter by status
        order_status = self.request.query_params.get('status')
        if order_status:
            queryset = queryset.filter(status=order_status)
        
        # Filter by payment status
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')
