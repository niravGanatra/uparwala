import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model


class LocationTrackingConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time location tracking during bookings.
    
    Usage:
    - Pandit connects and sends location updates when booking status is 'on_the_way'
    - Customer connects to receive real-time location updates
    
    WebSocket URL: ws://domain/ws/tracking/{booking_id}/
    """
    
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'tracking_{self.booking_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'booking_id': self.booking_id,
            'message': 'Connected to live tracking.'
        }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Receive location update from Pandit and broadcast to all connected clients.
        
        Expected message format:
        {
            "type": "location_update",
            "latitude": 19.0760,
            "longitude": 72.8777
        }
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'location_update')
            
            if message_type == 'location_update':
                latitude = data.get('latitude')
                longitude = data.get('longitude')
                
                if latitude is None or longitude is None:
                    await self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': 'Missing latitude or longitude.'
                    }))
                    return
                
                # Broadcast location to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'location_message',
                        'latitude': latitude,
                        'longitude': longitude,
                        'timestamp': data.get('timestamp'),
                    }
                )
                
                # Optionally update Pandit's location in database
                # await self.update_pandit_location(latitude, longitude)
            
            elif message_type == 'status_update':
                status = data.get('status')
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'status_message',
                        'status': status,
                    }
                )
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format.'
            }))
    
    async def location_message(self, event):
        """Handle location broadcast to all clients in the room"""
        await self.send(text_data=json.dumps({
            'type': 'location_update',
            'latitude': event['latitude'],
            'longitude': event['longitude'],
            'timestamp': event.get('timestamp'),
        }))
    
    async def status_message(self, event):
        """Handle status broadcast to all clients in the room"""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'status': event['status'],
        }))
    
    @database_sync_to_async
    def get_booking(self, booking_id):
        """Get booking from database"""
        from .models import ServiceBooking
        try:
            return ServiceBooking.objects.get(id=booking_id)
        except ServiceBooking.DoesNotExist:
            return None
    
    @database_sync_to_async
    def update_pandit_location(self, latitude, longitude):
        """Update Pandit's location in database"""
        from .models import ServiceBooking
        try:
            booking = ServiceBooking.objects.get(id=self.booking_id)
            pandit = booking.pandit
            pandit.latitude = latitude
            pandit.longitude = longitude
            pandit.save(update_fields=['latitude', 'longitude'])
        except ServiceBooking.DoesNotExist:
            pass


class BookingNotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time booking notifications.
    
    - Pandits receive new booking requests
    - Customers receive booking status updates
    
    WebSocket URL: ws://domain/ws/notifications/{user_id}/
    """
    
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        # This consumer is primarily for receiving server-sent notifications
        pass
    
    async def booking_notification(self, event):
        """Send booking notification to user"""
        await self.send(text_data=json.dumps({
            'type': 'booking_notification',
            'booking_id': event['booking_id'],
            'message': event['message'],
            'status': event.get('status'),
        }))
    
    async def new_booking_request(self, event):
        """Notify Pandit of new booking request"""
        await self.send(text_data=json.dumps({
            'type': 'new_booking_request',
            'booking_id': event['booking_id'],
            'service_name': event.get('service_name'),
            'customer_name': event.get('customer_name'),
            'booking_date': event.get('booking_date'),
            'booking_time': event.get('booking_time'),
        }))
