from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer, ProductCreateSerializer
from vendors.models import VendorProfile
from users.permissions import IsApprovedVendor

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'vendor']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class VendorProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductCreateSerializer
    permission_classes = [IsApprovedVendor]

    def get_queryset(self):
        return Product.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        vendor = VendorProfile.objects.get(user=self.request.user)
        serializer.save(vendor=vendor)

class VendorProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductCreateSerializer
    permission_classes = [IsApprovedVendor]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(vendor__user=self.request.user)

class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff or request.user.is_superuser)

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    queryset = Product.objects.all()
