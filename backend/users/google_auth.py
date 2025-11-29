from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import requests

User = get_user_model()

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get('access_token')
        email = request.data.get('email')
        name = request.data.get('name')

        if not access_token or not email:
            return Response(
                {'error': 'Access token and email are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': name.split()[0] if name else '',
                    'last_name': ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else '',
                }
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
                    'is_vendor': user.is_vendor,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
