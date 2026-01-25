from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tracking/(?P<booking_id>\d+)/$', consumers.LocationTrackingConsumer.as_asgi()),
    re_path(r'ws/notifications/(?P<user_id>\d+)/$', consumers.BookingNotificationConsumer.as_asgi()),
]
