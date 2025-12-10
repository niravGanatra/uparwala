from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from orders.models import Cart
import json

User = get_user_model()
# Get a user with a cart
cart = Cart.objects.filter(items__isnull=False).first()
if not cart:
    print("No active cart found to test")
else:
    user = cart.user
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Needs state_code
    response = client.post('/payments/calculate-totals/', {
        'state_code': 'DL'
    }, format='json')
    
    print("Status Code:", response.status_code)
    try:
        print("Response:", json.dumps(response.data, indent=2))
    except:
        print("Raw Response:", response.content)
