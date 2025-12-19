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
# Google OAuth View (Re-enabled with Code Flow)
import requests
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleLoginView(APIView):
    """Handle Google OAuth login (Authorization Code Flow)"""
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        code = request.data.get('code')
        error = request.data.get('error')
        
        if error or not code:
            return Response(
                {'error': 'Authorization code not provided or login failed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Exchange code for tokens (Access + ID Token)
            # The redirect_uri for popup flow in react-oauth/google is 'postmessage'
            token_endpoint = "https://oauth2.googleapis.com/token"
            
            # Using SOCIALACCOUNT_PROVIDERS config as source of truth for secrets
            google_conf = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']
            client_id = google_conf['client_id']
            client_secret = google_conf['secret']
            
            payload = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': 'postmessage',  # Critical for react-oauth/google
                'grant_type': 'authorization_code'
            }
            
            # Helper to inspect payload if needed in logs (safely)
            # print(f"DEBUG: Exchanging code. ClientID: {client_id[:10]}...")
            
            token_response = requests.post(token_endpoint, data=payload)
            token_data = token_response.json()
            
            if 'error' in token_data:
                return Response(
                    {'error': f"Google Token Exchange Failed: {token_data.get('error_description', token_data.get('error'))}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            access_token = token_data.get('access_token')
            
            # 2. Get User Info
            user_info_endpoint = "https://www.googleapis.com/oauth2/v3/userinfo"
            user_info_response = requests.get(user_info_endpoint, headers={'Authorization': f'Bearer {access_token}'})
            user_info = user_info_response.json()
            
            email = user_info.get('email')
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
                
            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
            google_id = user_info.get('sub')
            picture = user_info.get('picture')

            # 3. Get or Create User
            # We use email as the unique identifier
            try:
                user = User.objects.get(email=email)
                # Update details if needed? 
                # user.first_name = first_name ...
            except User.DoesNotExist:
                # Create new user
                username = email.split('@')[0]
                # Ensure username uniqueness
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                    
                user = User.objects.create(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True
                )
                user.set_unusable_password()
                user.save()
            
            # 4. Issue JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
            
        except Exception as e:
            print(f"Google Login Exception: {str(e)}")
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
