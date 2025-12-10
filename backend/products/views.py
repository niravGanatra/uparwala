from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductQuestion, ProductAnswer, RecentlyViewed
from .serializers import CategorySerializer, ProductSerializer, ProductCreateSerializer
from .qa_serializers import ProductQuestionSerializer, ProductAnswerSerializer
from vendors.models import VendorProfile
from users.permissions import IsApprovedVendor
from .bulk_upload import process_product_csv, generate_csv_template
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from .models import Category, Product, ProductQuestion, ProductAnswer, RecentlyViewed, GlobalAttribute, AttributeTerm
from .serializers import (
    CategorySerializer, ProductSerializer, ProductCreateSerializer,
    GlobalAttributeSerializer, AttributeTermSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Categories. Public Read-Only."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

class GlobalAttributeViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Global Attributes."""
    queryset = GlobalAttribute.objects.all()
    serializer_class = GlobalAttributeSerializer
    permission_classes = [permissions.IsAdminUser]

class AttributeTermViewSet(viewsets.ModelViewSet):
    """Admin CRUD for Attribute Terms."""
    queryset = AttributeTerm.objects.all()
    serializer_class = AttributeTermSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['attribute']

class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__slug', 'vendor']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'stock_quantity']
    
    def get_queryset(self):
        # Admin users can see all products (including inactive)
        if self.request.user and (self.request.user.is_staff or self.request.user.is_superuser):
            return Product.objects.all()
        # Regular customers only see active products from verified vendors
        return Product.objects.filter(is_active=True, vendor__verification_status='verified')

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Only show products from verified vendors"""
        if self.request.user and (self.request.user.is_staff or self.request.user.is_superuser):
            return Product.objects.all()
        return Product.objects.filter(is_active=True, vendor__verification_status='verified')

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


# Product Q&A Endpoints
@api_view(['GET', 'POST'])
def product_questions(request, product_id):
    """Get questions for a product or ask a new question"""
    product = get_object_or_404(Product, id=product_id)
    
    if request.method == 'GET':
        questions = ProductQuestion.objects.filter(
            product=product,
            is_approved=True
        ).prefetch_related('answers__user').order_by('-created_at')
        serializer = ProductQuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = ProductQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def answer_question(request, question_id):
    """Answer a product question"""
    question = get_object_or_404(ProductQuestion, id=question_id)
    
    serializer = ProductAnswerSerializer(data=request.data)
    if serializer.is_valid():
        # Check if user is vendor of the product
        is_vendor = hasattr(request.user, 'vendor_profile') and question.product.vendor.user == request.user
        
        serializer.save(
            user=request.user,
            question=question,
            is_vendor=is_vendor,
            is_staff=request.user.is_staff
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Recently Viewed Endpoints
@api_view(['GET'])
def recently_viewed(request):
    """Get recently viewed products"""
    limit = int(request.GET.get('limit', 10))
    
    if request.user.is_authenticated:
        products = RecentlyViewed.get_recent_products(user=request.user, limit=limit)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        products = RecentlyViewed.get_recent_products(session_key=session_key, limit=limit)
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def track_product_view(request, product_id):
    """Track a product view"""
    product = get_object_or_404(Product, id=product_id)
    
    if request.user.is_authenticated:
        RecentlyViewed.add_view(product=product, user=request.user)
    else:
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        RecentlyViewed.add_view(product=product, session_key=session_key)
    
    return Response({'status': 'tracked'})


# Bulk Upload Endpoints
@api_view(['POST'])
@permission_classes([IsApprovedVendor])
def bulk_upload_products(request):
    """Bulk upload products via CSV"""
    csv_file = request.FILES.get('file')
    if not csv_file:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    vendor = request.user.vendor_profile
    results = process_product_csv(csv_file, vendor)
    
    return Response(results)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_csv_template(request):
    """Download CSV template for bulk upload"""
    template_content = generate_csv_template()
    response = HttpResponse(template_content, content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="product_upload_template.csv"'
    return response


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_product_pincode(request, slug):
    """
    Check if a product is deliverable to a specific pincode.
    Logic:
    1. Check if pincode is in Global ServiceablePincode list.
    2. Check if pincode is in Vendor's serviceable_pincodes list.
    """
    from orders.utils import is_pincode_servicable
    pincode = request.query_params.get('pincode')
    if not pincode:
        return Response({'available': False, 'message': 'Pincode is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    product = get_object_or_404(Product, slug=slug)
    
    is_available, message = is_pincode_servicable(pincode, product.vendor)
    
    return Response({
        'available': is_available,
        'message': message,
        'pincode': pincode
    })
