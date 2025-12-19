from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom Adapter to allow Superusers to login without email verification.
    """
    def is_email_verified(self, email_address):
        # Allow superusers to bypass email verification
        if email_address.user.is_superuser:
            return True
        return super().is_email_verified(email_address)
