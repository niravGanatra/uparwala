from storages.backends.s3boto3 import S3Boto3Storage
from botocore.config import Config
import logging

logger = logging.getLogger(__name__)


class CloudflareR2Storage(S3Boto3Storage):
    """Custom storage backend for Cloudflare R2 with timeout configuration"""
    
    def __init__(self, **settings):
        print("DEBUG STORAGE: CloudflareR2Storage.__init__() called")
        # Add boto3 client configuration with timeouts
        settings['client_config'] = Config(
            connect_timeout=5,
            read_timeout=10,
            retries={
                'max_attempts': 3,
                'mode': 'adaptive'
            }
        )
        print(f"DEBUG STORAGE: boto3 Config created with timeouts")
        super().__init__(**settings)
        print(f"DEBUG STORAGE: S3Boto3Storage initialized")
        print(f"DEBUG STORAGE: Bucket name: {self.bucket_name}")
        print(f"DEBUG STORAGE: Endpoint URL: {self.endpoint_url}")
    
    def _save(self, name, content):
        """Override _save to add debugging"""
        print(f"DEBUG STORAGE: _save() called for file: {name}")
        print(f"DEBUG STORAGE: Content type: {type(content)}")
        print(f"DEBUG STORAGE: Content size: {content.size if hasattr(content, 'size') else 'unknown'}")
        
        try:
            result = super()._save(name, content)
            print(f"DEBUG STORAGE: File saved successfully! Result: {result}")
            return result
        except Exception as e:
            print(f"ERROR STORAGE: Failed to save file: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"ERROR STORAGE: Traceback: {traceback.format_exc()}")
            raise
