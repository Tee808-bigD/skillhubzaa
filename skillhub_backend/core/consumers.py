import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message, User


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer handling real-time direct chat between SkillHub ZA users.
    Supports connect, disconnect, message broadcasting, database persistence, and typing indicators.
    """

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope.get('user', AnonymousUser())

        # Validate authentication and room membership
        is_allowed = await self.is_user_participant(self.user, self.room_id)
        if not is_allowed:
            # Reject connection if user is not authenticated or not a participant
            await self.close(code=4003)
            return

        # Join the channel layer room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send connection confirmation to client
        await self.send_json({
            'type': 'connection_established',
            'room_id': self.room_id,
            'user': self.user.username,
            'message': 'Connected to SkillHub ZA real-time chat room.'
        })

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        """
        Handle incoming JSON messages from the client.
        Supported events:
          - type: "chat_message" | { message: "...", content: "..." }
          - type: "typing" | { is_typing: true/false }
        """
        event_type = content.get('type', 'chat_message')

        if event_type == 'chat_message':
            text = (content.get('message') or content.get('content') or '').strip()
            if not text:
                return

            # Persist message to database asynchronously
            saved_msg = await self.save_message(self.user, self.room_id, text)

            # Broadcast message to all clients in the room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'id': str(saved_msg['id']),
                    'room_id': self.room_id,
                    'message': saved_msg['content'],
                    'content': saved_msg['content'],
                    'sender': saved_msg['sender'],
                    'timestamp': saved_msg['timestamp'],
                }
            )

        elif event_type == 'typing':
            is_typing = bool(content.get('is_typing', False))
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.typing',
                    'room_id': self.room_id,
                    'username': self.user.username,
                    'is_typing': is_typing,
                }
            )

    async def chat_message(self, event):
        """Group handler: Deliver chat message to connected WebSocket client"""
        await self.send_json({
            'type': 'chat_message',
            'id': event.get('id'),
            'room_id': event.get('room_id'),
            'message': event.get('message'),
            'content': event.get('content'),
            'sender': event.get('sender'),
            'timestamp': event.get('timestamp'),
        })

    async def chat_typing(self, event):
        """Group handler: Deliver typing status to other connected participants"""
        # Do not echo typing status back to the sender
        if event.get('username') != self.user.username:
            await self.send_json({
                'type': 'typing',
                'room_id': event.get('room_id'),
                'username': event.get('username'),
                'is_typing': event.get('is_typing'),
            })

    @database_sync_to_async
    def is_user_participant(self, user, room_id):
        if not user or not user.is_authenticated:
            return False
        try:
            room = ChatRoom.objects.get(pk=room_id)
            return room.participants.filter(pk=user.pk).exists()
        except (ChatRoom.DoesNotExist, ValueError):
            return False

    @database_sync_to_async
    def save_message(self, user, room_id, content):
        room = ChatRoom.objects.get(pk=room_id)
        msg = Message.objects.create(
            room=room,
            sender=user,
            content=content,
            text=content
        )
        return {
            'id': msg.id,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'sender': {
                'id': user.id,
                'username': user.username,
                'full_name': user.get_full_name() or user.username,
                'avatar': user.avatar,
            }
        }
