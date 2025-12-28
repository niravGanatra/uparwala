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
from .serializers import RegisterSerializer, UserSerializer, CareerApplicationSerializer
from .models import CareerApplication
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


class ConvertGuestView(APIView):
    """Convert a guest order to a registered account"""
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        order_id = request.data.get('order_id')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'An account with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create the new user
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True
            )
            
            # Link the order to this new user
            if order_id:
                from orders.models import Order
                try:
                    order = Order.objects.get(id=order_id, guest_email=email, user__isnull=True)
                    order.user = user
                    order.save()
                except Order.DoesNotExist:
                    pass  # Order might already be linked or doesn't exist
            
            return Response({
                'success': True,
                'message': 'Account created successfully',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to create account: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CareerApplicationCreateView(generics.CreateAPIView):
    queryset = CareerApplication.objects.all()
    serializer_class = CareerApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        application = serializer.save()
        # Send email to candidate
        # Send emails asynchronously to prevent timeouts
        import threading
        from notifications.resend_service import send_email_via_resend
        from django.conf import settings

        def send_notifications():
            try:
                # 1. Send confirmation to candidate
                candidate_subject = f"Application Received: {application.full_name}"
                candidate_message = (
                    f"<p>Dear {application.full_name},</p>"
                    f"<p>We have received your application for a career at Uparwala.in. We will review it and get back to you shortly.</p>"
                    f"<p>Best Regards,<br>Uparwala Team</p>"
                )
                send_email_via_resend(
                    to_email=application.email,
                    subject=candidate_subject,
                    html_content=candidate_message
                )
                
                # 2. Send notification to admin
                admin_subject = f"New Career Application: {application.full_name}"
                admin_message = (
                    f"<p><strong>Name:</strong> {application.full_name}</p>"
                    f"<p><strong>Email:</strong> {application.email}</p>"
                    f"<p><strong>Phone:</strong> {application.phone}</p>"
                    f"<p><strong>Message:</strong><br>{application.message}</p>"
                    f"<p>Please check the admin panel for the resume.</p>"
                )
                send_email_via_resend(
                    to_email=settings.DEFAULT_FROM_EMAIL,
                    subject=admin_subject,
                    html_content=admin_message
                )
                print(f"DEBUG: Career application emails sent via Resend for {application.email}")
            except Exception as e:
                print(f"Error sending career application emails via Resend: {e}")

        # Start background thread
        email_thread = threading.Thread(target=send_notifications)
        email_thread.daemon = True
        email_thread.start()

class CareerApplicationListView(generics.ListAPIView):
    queryset = CareerApplication.objects.all().order_by('-created_at')
    serializer_class = CareerApplicationSerializer
    permission_classes = [permissions.IsAdminUser]

class CareerApplicationDeleteView(generics.DestroyAPIView):
    queryset = CareerApplication.objects.all()
    permission_classes = [permissions.IsAdminUser]


class ToggleManagerView(APIView):
    """Admin view to toggle manager status for a user"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Toggle is_manager status
        action = request.data.get('action')  # 'make_manager' or 'remove_manager'
        
        if action == 'make_manager':
            user.is_manager = True
            user.save()
            return Response({'message': f'{user.username} is now a manager', 'is_manager': True})
        elif action == 'remove_manager':
            user.is_manager = False
            user.save()
            return Response({'message': f'{user.username} is no longer a manager', 'is_manager': False})
        else:
            return Response({'error': 'Invalid action. Use make_manager or remove_manager'}, status=status.HTTP_400_BAD_REQUEST)
