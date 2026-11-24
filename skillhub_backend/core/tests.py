"""Regression tests for the real-time chat path and health probe."""
from datetime import timedelta

from channels.db import database_sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken

from core.middleware import JwtAuthMiddleware
from core.models import ChatRoom, Message, Post, User
from core.routing import websocket_urlpatterns

create_user = database_sync_to_async(User.objects.create_user)


def ws_app():
    return JwtAuthMiddleware(URLRouter(websocket_urlpatterns))


def expired_token(user):
    token = AccessToken.for_user(user)
    token.set_exp(from_time=timezone.now() - timedelta(hours=2), lifetime=timedelta(minutes=1))
    return str(token)


class ChatConsumerTests(TransactionTestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username='alice_ws', password='Sup3r$ecret')
        self.bob = User.objects.create_user(username='bob_ws', password='Sup3r$ecret')
        self.room = ChatRoom.objects.create(name='alice & bob')
        self.room.participants.add(self.alice, self.bob)

    async def connect(self, user, room_id=None, token=None):
        url = f'/ws/chat/{room_id or self.room.pk}/'
        if token is not False:
            url += f'?token={token or AccessToken.for_user(user)}'
        close = {}
        router = ws_app()

        async def app(scope, receive, send):
            async def capture(message):
                if message['type'] == 'websocket.close':
                    close['code'] = message.get('code')
                await send(message)
            await router(scope, receive, capture)

        ws = WebsocketCommunicator(app, url)
        connected, _ = await ws.connect()
        ws.close_capture = close
        return ws, connected

    async def test_valid_jwt_is_accepted(self):
        ws, connected = await self.connect(self.alice)
        self.assertTrue(connected)
        payload = await ws.receive_json_from()
        self.assertEqual(payload['type'], 'connection_established')
        await ws.disconnect()

    async def test_expired_jwt_closes_with_4001(self):
        ws, connected = await self.connect(self.alice, token=expired_token(self.alice))
        self.assertFalse(connected)
        self.assertEqual(ws.close_capture.get('code'), 4001)

    async def test_missing_jwt_closes_with_4001(self):
        ws, connected = await self.connect(self.alice, token=False)
        self.assertFalse(connected)
        self.assertEqual(ws.close_capture.get('code'), 4001)

    async def test_non_participant_closes_with_4003(self):
        outsider = await create_user(username='outsider_ws', password='Sup3r$ecret')
        ws, connected = await self.connect(outsider)
        self.assertFalse(connected)
        self.assertEqual(ws.close_capture.get('code'), 4003)

    async def test_message_is_broadcast_persisted_and_ordered(self):
        alice_ws, _ = await self.connect(self.alice)
        bob_ws, _ = await self.connect(self.bob)
        await alice_ws.receive_json_from()  # connection_established
        await bob_ws.receive_json_from()

        await alice_ws.send_json_to({'type': 'chat_message', 'content': 'first'})
        first_to_alice = await alice_ws.receive_json_from()
        first_to_bob = await bob_ws.receive_json_from()
        self.assertEqual(first_to_alice['content'], 'first')
        self.assertEqual(first_to_bob['content'], 'first')

        await bob_ws.send_json_to({'type': 'chat_message', 'content': 'second'})
        second_to_alice = await alice_ws.receive_json_from()
        second_to_bob = await bob_ws.receive_json_from()
        self.assertEqual(second_to_alice['content'], 'second')
        self.assertEqual(second_to_bob['content'], 'second')

        stored = await database_sync_to_async(
            lambda: list(Message.objects.filter(room=self.room).order_by('timestamp', 'id')
                         .values_list('content', flat=True))
        )()
        self.assertEqual(stored, ['first', 'second'])

        await alice_ws.disconnect()
        await bob_ws.disconnect()


class HealthAndApiTests(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()

    @override_settings(REDIS_URL='')
    def test_health_reports_database_ok_without_redis(self):
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['checks']['database'], 'ok')
        self.assertEqual(response.data['checks']['redis'], 'not_configured')

    def test_direct_room_and_message_post(self):
        alice = User.objects.create_user(username='alice_api', password='Sup3r$ecret')
        bob = User.objects.create_user(username='bob_api', password='Sup3r$ecret')
        self.client.force_authenticate(alice)

        res = self.client.post('/api/rooms/direct/', {'participant_username': 'bob_api'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        room_id = res.data['id']

        res = self.client.post('/api/messages/', {'room_id': room_id, 'content': 'Hi Bob'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['sender']['username'], 'alice_api')

        res = self.client.get(f'/api/rooms/{room_id}/messages/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

        # Outsiders cannot inject messages into someone else's room.
        outsider = User.objects.create_user(username='eve_api', password='Sup3r$ecret')
        self.client.force_authenticate(outsider)
        res = self.client.post('/api/messages/', {'room_id': room_id, 'content': 'sneaky'}, format='json')
        self.assertEqual(res.status_code, 403)


class PostAndCommentApiTests(TestCase):
    """Regressions found by the Postman collection (author handling/ownership)."""

    def setUp(self):
        self.client = APIClient()
        self.alice = User.objects.create_user(username='alice_post', password='Sup3r$ecret')
        self.bob = User.objects.create_user(username='bob_post', password='Sup3r$ecret')

    def test_create_post_attaches_author(self):
        self.client.force_authenticate(self.alice)
        res = self.client.post('/api/posts/', {'content': 'hello world'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['author']['username'], 'alice_post')

    def test_nested_comment_does_not_require_post_in_body(self):
        self.client.force_authenticate(self.alice)
        post = self.client.post('/api/posts/', {'content': 'discuss'}, format='json').data

        res = self.client.post(f"/api/posts/{post['id']}/comments/", {'content': 'nice'}, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['content'], 'nice')
        self.assertEqual(res.data['author']['username'], 'alice_post')

    def test_non_author_cannot_delete_post(self):
        self.client.force_authenticate(self.alice)
        post_id = self.client.post('/api/posts/', {'content': 'mine'}, format='json').data['id']

        self.client.force_authenticate(self.bob)
        res = self.client.delete(f'/api/posts/{post_id}/')
        self.assertEqual(res.status_code, 403)
        self.assertTrue(Post.objects.filter(pk=post_id).exists())

    def test_staff_can_delete_post(self):
        self.client.force_authenticate(self.alice)
        post_id = self.client.post('/api/posts/', {'content': 'moderate me'}, format='json').data['id']

        moderator = User.objects.create_user(
            username='mod_post', password='Sup3r$ecret', is_staff=True
        )
        self.client.force_authenticate(moderator)
        res = self.client.delete(f'/api/posts/{post_id}/')
        self.assertEqual(res.status_code, 204)


class OwnershipPermissionTests(TestCase):
    """Non-owners cannot delete events, services or reels."""

    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(username='owner_own', password='Sup3r$ecret')
        self.other = User.objects.create_user(username='other_own', password='Sup3r$ecret')

    def _create(self, endpoint, payload):
        self.client.force_authenticate(self.owner)
        res = self.client.post(endpoint, payload, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        return res.data['id']

    def test_event_service_reel_are_owner_only(self):
        cases = [
            ('/api/events/', {'title': 'E', 'description': 'd', 'date': '2026-12-01T10:00:00Z', 'location': 'JHB'}),
            ('/api/services/', {'title': 'S', 'description': 'd', 'price': '100.00'}),
            ('/api/reels/', {'caption': 'R'}),
        ]
        for endpoint, payload in cases:
            with self.subTest(endpoint=endpoint):
                obj_id = self._create(endpoint, payload)
                self.client.force_authenticate(self.other)
                res = self.client.delete(f'{endpoint}{obj_id}/')
                self.assertEqual(res.status_code, 403)

                self.client.force_authenticate(self.owner)
                res = self.client.delete(f'{endpoint}{obj_id}/')
                self.assertEqual(res.status_code, 204)
