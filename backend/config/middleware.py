"""
Custom middleware for cache control on API responses.
Prevents browsers and CDNs from caching API responses to ensure fresh data.
"""

class APICacheControlMiddleware:
    """
    Middleware to add cache-control headers to API responses.
    Ensures API responses are not cached by browsers or CDNs.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Only apply to API routes
        if request.path.startswith('/api/'):
            # Prevent caching of API responses
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            # Prevent CDN caching
            response['CDN-Cache-Control'] = 'no-store'
            response['Cloudflare-CDN-Cache-Control'] = 'no-store'
        
        return response


class StaticCacheControlMiddleware:
    """
    Middleware to add appropriate cache headers for static files.
    Static files with hashes can be cached for long periods.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # For static files, allow long caching (handled by WhiteNoise, but just in case)
        if request.path.startswith('/static/'):
            response['Cache-Control'] = 'public, max-age=31536000, immutable'
        
        return response
