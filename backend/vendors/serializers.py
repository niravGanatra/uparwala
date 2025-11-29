from rest_framework import serializers
from .models import VendorProfile, Wallet, Withdrawal, PayoutRequest

class VendorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_approved', 'created_at')

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = '__all__'
        read_only_fields = ('vendor',)

class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = '__all__'
        read_only_fields = ('vendor', 'status', 'created_at')

class PayoutRequestSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True)
    vendor_email = serializers.EmailField(source='vendor.user.email', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True, allow_null=True)
    rejected_by_name = serializers.CharField(source='rejected_by.username', read_only=True, allow_null=True)
    
    class Meta:
        model = PayoutRequest
        fields = [
            'id', 'vendor', 'vendor_name', 'vendor_email',
            'requested_amount', 'status', 'bank_details',
            'requested_at', 'approved_at', 'rejected_at',
            'approved_by', 'approved_by_name',
            'rejected_by', 'rejected_by_name',
            'admin_notes', 'rejection_reason', 'transaction_id'
        ]
        read_only_fields = [
            'id', 'requested_at', 'approved_at', 'rejected_at',
            'approved_by', 'rejected_by'
        ]
