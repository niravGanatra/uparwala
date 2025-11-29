from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Address
from .serializers import AddressSerializer


class AddressListCreateView(generics.ListCreateAPIView):
    """List all addresses or create a new address"""
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an address"""
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class SetDefaultAddressView(APIView):
    """Set an address as default"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
            address.is_default = True
            address.save()  # This will auto-unset other defaults
            
            return Response({
                'message': 'Address set as default',
                'address': AddressSerializer(address).data
            })
        except Address.DoesNotExist:
            return Response(
                {'error': 'Address not found'},
                status=status.HTTP_404_NOT_FOUND
            )
