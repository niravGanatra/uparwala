from rest_framework import viewsets, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Service, PanditProfile, KYCDocument, ServiceBooking, BookingReview
from .serializers import (
    ServiceSerializer,
    PanditProfileSerializer,
    PanditProfileListSerializer,
    KYCDocumentSerializer,
    ServiceBookingSerializer,
    ServiceBookingCreateSerializer,
    PanditBookingListSerializer,
    BookingReviewSerializer,
    AvailabilitySerializer,
    LocationUpdateSerializer,
    PanditSearchSerializer,
)


class ServiceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Services"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]


class PanditProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for Pandit Profiles"""
    queryset = PanditProfile.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PanditProfileListSerializer
        return PanditProfileSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            # Only show verified Pandits in list
            queryset = queryset.filter(verification_status='verified')
        return queryset
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's Pandit profile"""
        try:
            profile = request.user.pandit_profile
            serializer = PanditProfileSerializer(profile)
            return Response(serializer.data)
        except PanditProfile.DoesNotExist:
            return Response(
                {"detail": "You don't have a Pandit profile."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='register')
    def register_as_pandit(self, request):
        """Register current user as a Pandit"""
        user = request.user
        if hasattr(user, 'pandit_profile'):
            return Response(
                {"detail": "You already have a Pandit profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PanditProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            profile = serializer.save(user=user)
            user.is_provider = True
            user.save(update_fields=['is_provider'])
            return Response(
                PanditProfileSerializer(profile).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PanditAvailabilityView(APIView):
    """Toggle Pandit online/offline status"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            profile = request.user.pandit_profile
        except PanditProfile.DoesNotExist:
            return Response(
                {"detail": "You don't have a Pandit profile."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AvailabilitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        is_online = serializer.validated_data['is_online']
        
        # Check if Pandit can go online
        if is_online and not profile.can_go_online():
            return Response(
                {"detail": "You must be verified before going online."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        profile.is_online = is_online
        if 'latitude' in serializer.validated_data:
            profile.latitude = serializer.validated_data.get('latitude')
        if 'longitude' in serializer.validated_data:
            profile.longitude = serializer.validated_data.get('longitude')
        profile.save()
        
        return Response({
            "is_online": profile.is_online,
            "message": f"You are now {'online' if profile.is_online else 'offline'}."
        })
    
    def get(self, request):
        """Get current availability status"""
        try:
            profile = request.user.pandit_profile
            return Response({
                "is_online": profile.is_online,
                "can_go_online": profile.can_go_online(),
                "verification_status": profile.verification_status,
            })
        except PanditProfile.DoesNotExist:
            return Response(
                {"detail": "You don't have a Pandit profile."},
                status=status.HTTP_404_NOT_FOUND
            )


class PanditSearchView(generics.ListAPIView):
    """Search for available Pandits by pincode and date"""
    serializer_class = PanditProfileListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = PanditProfile.objects.filter(
            verification_status='verified',
            is_online=True
        )
        
        pincode = self.request.query_params.get('pincode')
        date = self.request.query_params.get('date')
        service_id = self.request.query_params.get('service_id')
        
        if pincode:
            # Filter by serviceable pincodes (JSON array contains)
            queryset = queryset.filter(serviceable_pincodes__contains=pincode)
        
        if service_id:
            queryset = queryset.filter(specializations__id=service_id)
        
        # TODO: Filter out Pandits who already have bookings at the requested date/time
        
        return queryset.distinct()


class KYCDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for KYC Documents"""
    serializer_class = KYCDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        try:
            return self.request.user.pandit_profile.kyc_documents.all()
        except PanditProfile.DoesNotExist:
            return KYCDocument.objects.none()
    
    def perform_create(self, serializer):
        try:
            pandit = self.request.user.pandit_profile
            serializer.save(pandit=pandit)
        except PanditProfile.DoesNotExist:
            raise serializers.ValidationError("You must have a Pandit profile first.")


class ServiceBookingViewSet(viewsets.ModelViewSet):
    """ViewSet for Service Bookings"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceBookingCreateSerializer
        return ServiceBookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Check if viewing as Pandit or Customer
        view_as = self.request.query_params.get('view_as', 'customer')
        
        if view_as == 'pandit' and hasattr(user, 'pandit_profile'):
            return ServiceBooking.objects.filter(pandit=user.pandit_profile)
        
        return ServiceBooking.objects.filter(customer=user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Pandit accepts a booking request"""
        booking = self.get_object()
        
        if not hasattr(request.user, 'pandit_profile'):
            return Response(
                {"detail": "Only Pandits can accept bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.pandit != request.user.pandit_profile:
            return Response(
                {"detail": "This booking is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'requested':
            return Response(
                {"detail": f"Cannot accept booking with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'accepted'
        booking.accepted_at = timezone.now()
        booking.save()
        
        return Response(ServiceBookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Pandit rejects a booking request"""
        booking = self.get_object()
        
        if not hasattr(request.user, 'pandit_profile'):
            return Response(
                {"detail": "Only Pandits can reject bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.pandit != request.user.pandit_profile:
            return Response(
                {"detail": "This booking is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'requested':
            return Response(
                {"detail": f"Cannot reject booking with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'rejected'
        booking.rejection_reason = request.data.get('reason', '')
        booking.save()
        
        return Response(ServiceBookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'], url_path='start-travel')
    def start_travel(self, request, pk=None):
        """Pandit starts traveling to the booking location"""
        booking = self.get_object()
        
        if booking.pandit.user != request.user:
            return Response(
                {"detail": "This booking is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status not in ['accepted', 'confirmed']:
            return Response(
                {"detail": f"Cannot start travel with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'on_the_way'
        booking.started_travel_at = timezone.now()
        booking.save()
        
        return Response({
            "status": booking.status,
            "booking_id": booking.id,
            "message": "Live tracking is now active.",
            "otp_start": booking.otp_start  # Return OTP for verification
        })
    
    @action(detail=True, methods=['post'], url_path='verify-start')
    def verify_start(self, request, pk=None):
        """Verify OTP and start the service"""
        booking = self.get_object()
        otp = request.data.get('otp')
        
        if booking.pandit.user != request.user:
            return Response(
                {"detail": "This booking is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'on_the_way':
            return Response(
                {"detail": "Pandit must be on the way to start service."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if otp != booking.otp_start:
            return Response(
                {"detail": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'in_progress'
        booking.service_started_at = timezone.now()
        booking.save()
        
        return Response({
            "status": booking.status,
            "message": "Service started successfully."
        })
    
    @action(detail=True, methods=['post'], url_path='verify-complete')
    def verify_complete(self, request, pk=None):
        """Verify end OTP and complete the service"""
        booking = self.get_object()
        otp = request.data.get('otp')
        
        if booking.pandit.user != request.user:
            return Response(
                {"detail": "This booking is not assigned to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status != 'in_progress':
            return Response(
                {"detail": "Service must be in progress to complete."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if otp != booking.otp_end:
            return Response(
                {"detail": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'completed'
        booking.completed_at = timezone.now()
        booking.save()
        
        # Update Pandit's completed bookings count
        pandit = booking.pandit
        pandit.total_bookings_completed += 1
        pandit.save(update_fields=['total_bookings_completed'])
        
        return Response({
            "status": booking.status,
            "message": "Service completed successfully."
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Allow cancellation by customer or Pandit
        is_customer = booking.customer == request.user
        is_pandit = hasattr(request.user, 'pandit_profile') and booking.pandit == request.user.pandit_profile
        
        if not (is_customer or is_pandit):
            return Response(
                {"detail": "You don't have permission to cancel this booking."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {"detail": f"Cannot cancel booking with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.cancellation_reason = request.data.get('reason', '')
        booking.cancelled_at = timezone.now()
        booking.save()
        
        return Response(ServiceBookingSerializer(booking).data)


class BookingReviewCreateView(generics.CreateAPIView):
    """Create a review for a completed booking"""
    serializer_class = BookingReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        booking_id = request.data.get('booking')
        booking = get_object_or_404(ServiceBooking, id=booking_id)
        
        # Verify ownership
        if booking.customer != request.user:
            return Response(
                {"detail": "You can only review your own bookings."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verify completion
        if booking.status != 'completed':
            return Response(
                {"detail": "You can only review completed bookings."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already reviewed
        if hasattr(booking, 'review'):
            return Response(
                {"detail": "This booking has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)


class PanditDashboardView(APIView):
    """Dashboard data for Pandits"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            pandit = request.user.pandit_profile
        except PanditProfile.DoesNotExist:
            return Response(
                {"detail": "You don't have a Pandit profile."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get booking statistics
        bookings = ServiceBooking.objects.filter(pandit=pandit)
        
        new_requests = bookings.filter(status='requested').count()
        accepted = bookings.filter(status='accepted').count()
        in_progress = bookings.filter(status='in_progress').count()
        completed = bookings.filter(status='completed').count()
        
        # Get pending bookings
        pending_bookings = bookings.filter(
            status='requested'
        ).order_by('-created_at')[:10]
        
        # Today's bookings
        today = timezone.now().date()
        today_bookings = bookings.filter(
            booking_date=today,
            status__in=['accepted', 'confirmed', 'on_the_way', 'in_progress']
        ).order_by('booking_time')
        
        return Response({
            "profile": PanditProfileSerializer(pandit).data,
            "stats": {
                "new_requests": new_requests,
                "accepted": accepted,
                "in_progress": in_progress,
                "completed": completed,
                "total": bookings.count(),
            },
            "pending_bookings": PanditBookingListSerializer(pending_bookings, many=True).data,
            "today_bookings": PanditBookingListSerializer(today_bookings, many=True).data,
        })
