from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    PostViewSet,
    CommentViewSet,
    LikeViewSet,
    EventViewSet,
    ServiceViewSet,
    ReelViewSet,
    MessageViewSet,
    ChatRoomViewSet,
    AvatarUpdateView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'events', EventViewSet, basename='event')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'reels', ReelViewSet, basename='reel')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'rooms', ChatRoomViewSet, basename='chatroom')

urlpatterns = [
    path('users/avatar/', AvatarUpdateView.as_view(), name='user-avatar-update'),
    path('', include(router.urls)),
]
