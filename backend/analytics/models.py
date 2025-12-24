from django.db import models
from django.conf import settings

class AnalyticsEvent(models.Model):
    """
    Store raw analytics events for dashboard aggregation
    """
    EVENT_TYPES = (
        ('session_start', 'Session Start'),
        ('page_view', 'Page View'),
        ('search', 'Search Query'),
        ('product_view', 'Product View'),
        ('add_to_cart', 'Add to Cart'),
        ('remove_from_cart', 'Remove from Cart'),
        ('initiate_checkout', 'Initiate Checkout'),
        ('error', 'Error Log'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, db_index=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    
    # Flexible data storage (stores price, product_id, query, error_code, performance metrics)
    data = models.JSONField(default=dict)
    
    # Metadata
    url = models.URLField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['session_id', 'timestamp']),
        ]

    def __str__(self):
        user_str = self.user.username if self.user else 'Anon'
        return f"{self.event_type} - {user_str} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
