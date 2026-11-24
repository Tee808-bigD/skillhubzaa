import urllib.parse
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token):
    """Return (user, reason). reason is None on success, else 'expired'/'invalid'/'inactive'."""
    try:
        access_token = AccessToken(token)
    except Exception as exc:
        # SimpleJWT raises TokenError('Token is expired') for stale tokens.
        reason = 'expired' if 'expired' in str(exc).lower() else 'invalid'
        return AnonymousUser(), reason

    try:
        user = User.objects.get(id=access_token['user_id'])
    except User.DoesNotExist:
        return AnonymousUser(), 'invalid'

    if not user.is_active:
        return AnonymousUser(), 'inactive'
    return user, None


class JwtAuthMiddleware:
    """
    Custom middleware to authenticate WebSocket connections using a JWT
    passed in the query string (e.g., ws://.../?token=<access_token>).
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # Parse the query string to find the token
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = urllib.parse.parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            user, reason = await get_user_from_token(token)
            scope['user'] = user
            scope['jwt_error'] = reason
        else:
            scope['user'] = AnonymousUser()
            scope['jwt_error'] = 'missing'

        return await self.inner(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)

