from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle

class LoginRateThrottle(AnonRateThrottle):
    """
    Rate throttle specifically for the token/login endpoint to prevent brute-force attacks.
    Defaults to 5 requests per minute per IP address.
    """
    scope = 'login'

    def get_cache_key(self, request, view):
        # Throttle by IP and username if provided to protect both client and target account
        ident = self.get_ident(request)
        username = request.data.get('username', '') if hasattr(request, 'data') and isinstance(request.data, dict) else ''
        return self.cache_format % {
            'scope': self.scope,
            'ident': f"{ident}:{username}" if username else ident,
        }
