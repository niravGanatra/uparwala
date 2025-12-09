from .models import ServiceablePincode

def is_pincode_servicable(pincode, vendor_profile=None):
    """
    Check if a pincode is serviceable based on Global and Vendor constraints.
    
    Args:
        pincode (str): The pincode to check.
        vendor_profile (VendorProfile): The vendor to check against (optional).
        
    Returns:
        tuple: (bool, str) -> (is_available, message)
    """
    if not pincode:
        return False, "Pincode is required."

    # 1. Global Check
    # If Global list is NOT empty, strict enforcement applies.
    # If Global list IS empty, we assume all pincodes are globally allowed (or disallowed? Usually allowed if empty list implies no restriction, but here we likely want strict).
    # Based on previous logic: "If global list exists, check it."
    
    global_pincodes_exist = ServiceablePincode.objects.filter(is_active=True).exists()
    
    if global_pincodes_exist:
        if not ServiceablePincode.objects.filter(pincode=pincode, is_active=True).exists():
            return False, "Sorry, we do not deliver to this location yet."
            
    # 2. Vendor Check
    if vendor_profile:
        # Check if vendor has specific pincodes
        if vendor_profile.serviceable_pincodes:
            # Parse CSV
            allowed_pincodes = [p.strip() for p in vendor_profile.serviceable_pincodes.split(',') if p.strip()]
            if allowed_pincodes and pincode not in allowed_pincodes:
                return False, "Seller does not deliver to this pincode."

    return True, "Delivery available!"
