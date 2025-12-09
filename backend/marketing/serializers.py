from rest_framework import serializers
from .models import Campaign, UTMTracking


class CampaignSerializer(serializers.ModelSerializer):
    conversion_rate = serializers.SerializerMethodField()
    roi = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = ['id', 'name', 'description', 'utm_source', 'utm_medium', 'utm_campaign',
                 'clicks', 'conversions', 'revenue', 'conversion_rate', 'roi',
                 'start_date', 'end_date', 'budget', 'is_active', 'created_at']
        read_only_fields = ['id', 'clicks', 'conversions', 'revenue', 'created_at']
    
    def get_conversion_rate(self, obj):
        return obj.get_conversion_rate()
    
    def get_roi(self, obj):
        return obj.get_roi()


class UTMTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UTMTracking
        fields = ['id', 'user', 'session_key', 'utm_source', 'utm_medium', 'utm_campaign',
                 'utm_term', 'utm_content', 'referrer', 'landing_page', 'campaign',
                 'order', 'converted', 'conversion_value', 'created_at', 'converted_at']
        read_only_fields = ['id', 'created_at']
