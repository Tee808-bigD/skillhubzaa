import urllib.parse
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token):
    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token['user_id'])
    except Exception:
        return AnonymousUser()


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
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)

