from rest_framework.permissions import BasePermission

class IsApprovedVendor(BasePermission):
    """
    Permission class to check if user is an approved vendor
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.is_vendor and
            request.user.vendor_status == 'approved'
        )

class IsVendor(BasePermission):
    """
    Permission class to check if user is a vendor (any status)
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_vendor
