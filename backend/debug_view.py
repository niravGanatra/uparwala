from django.conf import settings
from rest_framework.test import APIRequestFactory
from payments.views import CalculateTotalsView
from orders.models import Cart

factory = APIRequestFactory()
cart = Cart.objects.filter(items__isnull=False).first()
if cart:
    user = cart.user
    request = factory.post('/payments/calculate-totals/', {'state_code': 'DL'}, format='json')
    request.user = user
    view = CalculateTotalsView.as_view()
    try:
        response = view(request)
        print("Status:", response.status_code)
        if hasattr(response, 'data'):
            print("Data:", response.data)
        else:
            print("Content:", response.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("No cart found")
