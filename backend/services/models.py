from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import random
import string


class Service(models.Model):
    """Religious/Spiritual services offered by Pandits"""
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(
        help_text="Approximate duration of the service in minutes"
    )
    base_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    required_samagri_list = models.JSONField(
        default=list,
        blank=True,
        help_text='List of required items, e.g. [{"item": "Haldi", "qty": "100g"}]'
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='service_images/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'
    
    def __str__(self):
        return f"{self.name} (₹{self.base_price})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PanditProfile(models.Model):
    """Profile for Pandits (Service Providers)"""
    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='pandit_profile'
    )
    bio = models.TextField(blank=True, help_text="Brief introduction about the Pandit")
    years_experience = models.PositiveIntegerField(
        default=0,
        help_text="Years of experience in performing puja/religious services"
    )
    languages_spoken = models.JSONField(
        default=list,
        help_text='Languages known, e.g. ["Hindi", "Sanskrit", "English"]'
    )
    specializations = models.ManyToManyField(
        Service, 
        related_name='pandits', 
        blank=True,
        help_text="Services this Pandit specializes in"
    )
    profile_photo = models.ImageField(
        upload_to='pandit_photos/', 
        blank=True, 
        null=True
    )
    
    # Verification
    verification_status = models.CharField(
        max_length=20, 
        choices=VERIFICATION_STATUS, 
        default='pending'
    )
    verification_notes = models.TextField(
        blank=True,
        help_text="Admin notes about verification decision"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Availability & Location
    is_online = models.BooleanField(
        default=False,
        help_text="Is the Pandit currently accepting bookings?"
    )
    latitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, 
        decimal_places=6, 
        null=True, 
        blank=True
    )
    serviceable_pincodes = models.JSONField(
        default=list,
        help_text='Pincodes where this Pandit can provide services, e.g. ["400001", "400002"]'
    )
    service_radius_km = models.PositiveIntegerField(
        default=10,
        help_text="Maximum distance (in km) this Pandit is willing to travel"
    )
    
    # Ratings
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=Decimal('0.00'),
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    total_bookings_completed = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Pandit Profile'
        verbose_name_plural = 'Pandit Profiles'
    
    def __str__(self):
        return f"Pandit: {self.user.get_full_name() or self.user.username}"
    
    def can_go_online(self):
        """Check if Pandit can toggle online status"""
        return self.verification_status == 'verified'
    
    def save(self, *args, **kwargs):
        # Prevent unverified Pandits from going online
        if self.is_online and self.verification_status != 'verified':
            self.is_online = False
        super().save(*args, **kwargs)


class KYCDocument(models.Model):
    """KYC documents for Pandit verification"""
    DOCUMENT_TYPES = [
        ('aadhar', 'Aadhar Card'),
        ('pan', 'PAN Card'),
        ('vedic_certificate', 'Vedic Certificate'),
        ('degree', 'Educational Degree'),
        ('other', 'Other'),
    ]
    
    pandit = models.ForeignKey(
        PanditProfile, 
        on_delete=models.CASCADE, 
        related_name='kyc_documents'
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_name = models.CharField(max_length=255, blank=True)
    document_file = models.FileField(upload_to='kyc_documents/')
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = 'KYC Document'
        verbose_name_plural = 'KYC Documents'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.pandit}"


def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))


class ServiceBooking(models.Model):
    """Booking for Pandit services"""
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('confirmed', 'Confirmed'),
        ('on_the_way', 'On The Way'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
        ('failed', 'Failed'),
    ]
    
    # Booking parties
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='service_bookings'
    )
    pandit = models.ForeignKey(
        PanditProfile, 
        on_delete=models.CASCADE, 
        related_name='bookings'
    )
    service = models.ForeignKey(
        Service, 
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    
    # Booking details
    booking_date = models.DateField()
    booking_time = models.TimeField()
    address = models.TextField()
    pincode = models.CharField(max_length=10)
    special_instructions = models.TextField(blank=True)
    
    # Status tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='requested'
    )
    rejection_reason = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # OTP for service verification
    otp_start = models.CharField(
        max_length=6, 
        blank=True,
        help_text="OTP to start the service (shared with customer)"
    )
    otp_end = models.CharField(
        max_length=6, 
        blank=True,
        help_text="OTP to end the service (shared with customer)"
    )
    
    # Payment
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    convenience_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal('0.00')
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    payment_id = models.CharField(max_length=100, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_travel_at = models.DateTimeField(null=True, blank=True)
    arrived_at = models.DateTimeField(null=True, blank=True)
    service_started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Service Booking'
        verbose_name_plural = 'Service Bookings'
    
    def __str__(self):
        return f"Booking #{self.id} - {self.service.name} by {self.customer.username}"
    
    def save(self, *args, **kwargs):
        # Generate OTPs on creation
        if not self.pk:
            self.otp_start = generate_otp()
            self.otp_end = generate_otp()
        super().save(*args, **kwargs)


class BookingReview(models.Model):
    """Customer review for completed bookings"""
    booking = models.OneToOneField(
        ServiceBooking, 
        on_delete=models.CASCADE, 
        related_name='review'
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Booking Review'
        verbose_name_plural = 'Booking Reviews'
    
    def __str__(self):
        return f"Review for Booking #{self.booking.id} - {self.rating}★"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update Pandit's average rating
        pandit = self.booking.pandit
        reviews = BookingReview.objects.filter(booking__pandit=pandit)
        total = reviews.count()
        if total > 0:
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            pandit.average_rating = avg
            pandit.total_reviews = total
            pandit.save(update_fields=['average_rating', 'total_reviews'])
