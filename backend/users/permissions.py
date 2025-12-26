from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)

class IsApprovedVendor(BasePermission):
    """
    Permission class to check if user is an approved vendor
    """
    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Debug logging to help diagnose permission issues
        logger.info(f"Vendor permission check - User: {user.email}, is_vendor: {user.is_vendor}, vendor_status: {user.vendor_status}")
        
        # Accept any approved-like status (approved, verified, etc.)  
        allowed_statuses = ['approved', 'verified', 'Approved', 'Verified', 'APPROVED', 'VERIFIED']
        
        has_perm = (
            user.is_vendor and
            user.vendor_status in allowed_statuses
        )
        
        if not has_perm:
            logger.warning(f"Vendor permission DENIED - User: {user.email}, is_vendor: {user.is_vendor}, vendor_status: '{user.vendor_status}'")
        
        return has_perm

class IsVendor(BasePermission):
    """
    Permission class to check if user is a vendor (any status)
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_vendor
