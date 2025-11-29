from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.utils.text import slugify
from django.utils import timezone

from .models import CMSPage
from .admin_serializers import CMSPageSerializer


class CMSPageListView(generics.ListCreateAPIView):
    """List all CMS pages or create a new one (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = CMSPageSerializer
    
    def get_queryset(self):
        return CMSPage.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        # Auto-generate slug if not provided
        title = serializer.validated_data.get('title')
        slug = serializer.validated_data.get('slug')
        
        if not slug and title:
            slug = slugify(title)
            # Ensure uniqueness
            original_slug = slug
            counter = 1
            while CMSPage.objects.filter(slug=slug).exists():
                slug = f"{original_slug}-{counter}"
                counter += 1
            serializer.save(slug=slug)
        else:
            serializer.save()


class CMSPageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a CMS page (Admin only)"""
    permission_classes = [IsAdminUser]
    serializer_class = CMSPageSerializer
    queryset = CMSPage.objects.all()
    lookup_field = 'id'


class PublishCMSPageView(APIView):
    """Publish or unpublish a CMS page (Admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        try:
            page = CMSPage.objects.get(pk=pk)
        except CMSPage.DoesNotExist:
            return Response(
                {'error': 'Page not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        is_published = request.data.get('is_published', True)
        page.is_published = is_published
        
        if is_published and not page.published_at:
            page.published_at = timezone.now()
            
        page.save()
        
        serializer = CMSPageSerializer(page)
        return Response({
            'message': f"Page {'published' if is_published else 'unpublished'}",
            'page': serializer.data
        })


class PublicCMSPageView(generics.RetrieveAPIView):
    """Get a published CMS page by slug (Public)"""
    permission_classes = [AllowAny]
    serializer_class = CMSPageSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        return CMSPage.objects.filter(is_published=True)
