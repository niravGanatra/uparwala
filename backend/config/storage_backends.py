from storages.backends.s3boto3 import S3Boto3Storage
from botocore.config import Config


class CloudflareR2Storage(S3Boto3Storage):
    """Custom storage backend for Cloudflare R2 with timeout configuration"""
    
    def __init__(self, **settings):
        # Add boto3 client configuration with timeouts
        settings['client_config'] = Config(
            connect_timeout=5,
            read_timeout=10,
            retries={
                'max_attempts': 3,
                'mode': 'adaptive'
            }
        )
        super().__init__(**settings)
