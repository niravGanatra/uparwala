from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class CustomLoginView(APIView):
    """
    Custom login view that returns JWT tokens directly
    Bypasses dj-rest-auth to avoid cookie/configuration issues
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Please provide both username/email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(request, username=username, password=password)
        
        if user is None:
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_vendor': user.is_vendor,
                'vendor_status': user.vendor_status,
            }
        }, status=status.HTTP_200_OK)
