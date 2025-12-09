from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q

from products.models import Category
from rest_framework import serializers


class CategoryCommissionSerializer(serializers.ModelSerializer):
    """Serializer for category commission rates"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'commission_rate']
        read_only_fields = ['id', 'name', 'slug']


class CategoryCommissionListView(generics.ListAPIView):
    """List all categories with their commission rates (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = CategoryCommissionSerializer
    
    def get_queryset(self):
        queryset = Category.objects.all().order_by('name')
        
        # Search by category name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset


class CategoryCommissionUpdateView(APIView):
    """Update category commission rate (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def patch(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {'error': 'Category not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        commission_rate = request.data.get('commission_rate')
        
        if commission_rate is not None:
            try:
                from decimal import Decimal
                commission_rate = Decimal(str(commission_rate))
                if commission_rate < Decimal('2.00') or commission_rate > Decimal('10.00'):
                    raise ValueError()
                category.commission_rate = commission_rate
            except (ValueError, Exception):
                return Response(
                    {'error': 'Commission rate must be between 2 and 10'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        category.save()
        
        serializer = CategoryCommissionSerializer(category)
        return Response({
            'message': 'Commission updated successfully',
            'category': serializer.data
        })
