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
        # Support email-based login (dj_rest_auth passes email in kwargs)
        email = kwargs.get('email')
        
        if username is None and email:
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                print(f"Auth Debug: Email '{email}' not found")
                return None
        
        if username is None:
            username = kwargs.get(User.USERNAME_FIELD)
        
        print(f"Auth Debug: Attempting to authenticate user '{username}'")
        
        if username is None or password is None:
            print("Auth Debug: Missing username or password")
            return None
        
        try:
            # Check if username is actually an email
            if '@' in username:
                 try:
                     user = User.objects.get(email=username)
                 except User.DoesNotExist:
                     # Fallback to username lookup
                     user = User.objects.get(**{User.USERNAME_FIELD: username})
            else:
                user = User.objects.get(**{User.USERNAME_FIELD: username})
            print(f"Auth Debug: User found: {user.username} (ID: {user.id}, Active: {user.is_active})")
        except User.DoesNotExist:
            print(f"Auth Debug: User '{username}' not found in database")
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)
            return None
        
        # Check password regardless of is_active status
        password_valid = user.check_password(password)
        print(f"Auth Debug: Check password result: {password_valid}")
        
        if password_valid:
            print("Auth Debug: Authentication successful")
            return user
        
        print("Auth Debug: Authentication failed - Invalid password")
        return None
    
    def user_can_authenticate(self, user):
        """
        Allow all users to authenticate, even if is_active=False
        """
        return True
