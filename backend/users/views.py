from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
# Temporarily disabled Google OAuth to fix server startup
# from google.oauth2 import id_token
# from google.auth.transport import requests
from django.conf import settings
from .serializers import RegisterSerializer, UserSerializer
from .profile_serializers import UserProfileSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

# Temporarily disabled - Google OAuth libraries causing import issues
# Uncomment after fixing Google auth setup
class GoogleLoginView(APIView):
    """Handle Google OAuth login - TEMPORARILY DISABLED"""
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        return Response(
            {'error': 'Google login temporarily disabled. Please use regular login with: admin@uparwala.com / admin123'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

# Original GoogleLoginView code (commented out):
# class GoogleLoginView(APIView):
#     """Handle Google OAuth login"""
#     permission_classes = (permissions.AllowAny,)
#     
#     def post(self, request):
#         token = request.data.get('credential') or request.data.get('token')
#         
#         if not token:
#             return Response(
#                 {'error': 'No credential provided'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         
#         try:
#             # Verify the token with Google
#             idinfo = id_token.verify_oauth2_token(
#                 token,
#                 requests.Request(),
#                 settings.GOOGLE_OAUTH_CLIENT_ID
#             )
#             
#             # Get user info from token
#             email = idinfo.get('email')
#             first_name = idinfo.get('given_name', '')
#             last_name = idinfo.get('family_name', '')
#             
#             if not email:
#                 return Response(
#                     {'error': 'Email not provided by Google'},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
#             
#             # Get or create user
#             user, created = User.objects.get_or_create(
#                 email=email,
#                 defaults={
#                     'username': email.split('@')[0],
#                     'first_name': first_name,
#                     'last_name': last_name,
#                 }
#             )
#             
#             # Generate JWT tokens
#             refresh = RefreshToken.for_user(user)
#             
#             return Response({
#                 'access': str(refresh.access_token),
#                 'refresh': str(refresh),
#                 'user': UserSerializer(user).data
#             })
#             
#         except ValueError as e:
#             return Response(
#                 {'error': f'Invalid token: {str(e)}'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             return Response(
#                 {'error': f'Authentication failed: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request):
    """Get or update user profile with enhancements"""
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = UserProfileSerializer(request.user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
