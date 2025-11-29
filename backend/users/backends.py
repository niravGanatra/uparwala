from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class AllowInactiveUserBackend(ModelBackend):
    """
    Custom authentication backend that allows inactive users to login.
    This is useful for vendors who have been deactivated by admin but should
    still be able to access their dashboard to see the deactivation message.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        if username is None or password is None:
            return None
        
        try:
            user = User.objects.get(**{User.USERNAME_FIELD: username})
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)
            return None
        
        # Check password regardless of is_active status
        if user.check_password(password):
            return user
        
        return None
    
    def user_can_authenticate(self, user):
        """
        Allow all users to authenticate, even if is_active=False
        """
        return True
