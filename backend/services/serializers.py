from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Service, PanditProfile, KYCDocument, ServiceBooking, BookingReview

User = get_user_model()


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    class Meta:
        model = Service
        fields = [
            'id', 'name', 'slug', 'description', 'duration_minutes',
            'base_price', 'required_samagri_list', 'is_active', 'image'
        ]
        read_only_fields = ['id', 'slug']


class KYCDocumentSerializer(serializers.ModelSerializer):
    """Serializer for KYC documents"""
    document_type_display = serializers.CharField(
        source='get_document_type_display', read_only=True
    )
    
    class Meta:
        model = KYCDocument
        fields = [
            'id', 'document_type', 'document_type_display', 'document_name',
            'document_file', 'uploaded_at', 'is_verified', 'admin_notes'
        ]
        read_only_fields = ['id', 'uploaded_at', 'is_verified', 'admin_notes']


class PanditProfileSerializer(serializers.ModelSerializer):
    """Serializer for Pandit profiles"""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    kyc_documents = KYCDocumentSerializer(many=True, read_only=True)
    specializations = ServiceSerializer(many=True, read_only=True)
    specialization_ids = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(),
        many=True,
        write_only=True,
        source='specializations',
        required=False
    )
    can_go_online = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = PanditProfile
        fields = [
            'id', 'user', 'user_name', 'user_email', 'bio', 'years_experience',
            'languages_spoken', 'specializations', 'specialization_ids',
            'profile_photo', 'verification_status', 'is_online',
            'latitude', 'longitude', 'serviceable_pincodes',
            'average_rating', 'total_reviews', 'total_bookings_completed',
            'kyc_documents', 'can_go_online', 'created_at'
        ]
        read_only_fields = [
            'id', 'user', 'verification_status', 'average_rating',
            'total_reviews', 'total_bookings_completed', 'created_at'
        ]
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class PanditProfileListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing Pandits"""
    user_name = serializers.SerializerMethodField()
    specializations = serializers.SerializerMethodField()
    
    class Meta:
        model = PanditProfile
        fields = [
            'id', 'user_name', 'profile_photo', 'years_experience',
            'languages_spoken', 'specializations', 'average_rating',
            'total_reviews', 'is_online'
        ]
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_specializations(self, obj):
        return list(obj.specializations.values_list('name', flat=True))


class AvailabilitySerializer(serializers.Serializer):
    """Serializer for toggling Pandit availability"""
    is_online = serializers.BooleanField()
    latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )
    longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, allow_null=True
    )


class LocationUpdateSerializer(serializers.Serializer):
    """Serializer for location updates during travel"""
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)


class BookingReviewSerializer(serializers.ModelSerializer):
    """Serializer for booking reviews"""
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = BookingReview
        fields = ['id', 'booking', 'rating', 'review_text', 'customer_name', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_customer_name(self, obj):
        return obj.booking.customer.get_full_name() or obj.booking.customer.username


class ServiceBookingSerializer(serializers.ModelSerializer):
    """Full serializer for Service Bookings"""
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    pandit_name = serializers.SerializerMethodField()
    pandit_phone = serializers.CharField(source='pandit.user.phone', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    review = BookingReviewSerializer(read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'customer', 'customer_name', 'customer_phone',
            'pandit', 'pandit_name', 'pandit_phone',
            'service', 'service_name', 'service_details',
            'booking_date', 'booking_time', 'address', 'pincode', 'special_instructions',
            'status', 'status_display', 'rejection_reason', 'cancellation_reason',
            'otp_start', 'otp_end',
            'base_amount', 'convenience_fee', 'total_amount',
            'payment_status', 'payment_id',
            'created_at', 'accepted_at', 'started_travel_at',
            'arrived_at', 'service_started_at', 'completed_at', 'cancelled_at',
            'review'
        ]
        read_only_fields = [
            'id', 'otp_start', 'otp_end', 'created_at', 'accepted_at',
            'started_travel_at', 'arrived_at', 'service_started_at',
            'completed_at', 'cancelled_at'
        ]
    
    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username
    
    def get_pandit_name(self, obj):
        return obj.pandit.user.get_full_name() or obj.pandit.user.username


class ServiceBookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new bookings"""
    class Meta:
        model = ServiceBooking
        fields = [
            'pandit', 'service', 'booking_date', 'booking_time',
            'address', 'pincode', 'special_instructions'
        ]
    
    def validate_pandit(self, value):
        if value.verification_status != 'verified':
            raise serializers.ValidationError("This Pandit is not yet verified.")
        return value
    
    def validate(self, data):
        # Check if pandit offers the selected service
        pandit = data.get('pandit')
        service = data.get('service')
        if service and pandit:
            if pandit.specializations.exists() and service not in pandit.specializations.all():
                raise serializers.ValidationError({
                    "service": "This Pandit does not offer the selected service."
                })
        return data
    
    def create(self, validated_data):
        # Calculate amounts
        service = validated_data['service']
        validated_data['base_amount'] = service.base_price
        validated_data['convenience_fee'] = service.base_price * 0.05  # 5% convenience fee
        validated_data['total_amount'] = validated_data['base_amount'] + validated_data['convenience_fee']
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class PanditBookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Pandits viewing their booking requests"""
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ServiceBooking
        fields = [
            'id', 'customer_name', 'customer_phone', 'service_name',
            'booking_date', 'booking_time', 'address', 'pincode',
            'status', 'status_display', 'total_amount', 'created_at'
        ]
    
    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username


class PanditSearchSerializer(serializers.Serializer):
    """Serializer for Pandit search query"""
    pincode = serializers.CharField(max_length=10)
    date = serializers.DateField()
    service_id = serializers.IntegerField(required=False)
