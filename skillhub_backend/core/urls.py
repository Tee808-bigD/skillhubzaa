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
    RegisterView,
    LogoutView,
    AcceptTermsView,
    DataExportView,
    DeleteAccountView,
    ReportViewSet,
    DMCARequestView,
    LegalDocumentView,
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
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    # POPIA Compliance & Consent Endpoints
    path('auth/register/', RegisterView.as_view(), name='core-auth-register'),
    path('auth/logout/', LogoutView.as_view(), name='core-auth-logout'),
    path('auth/accept-terms/', AcceptTermsView.as_view(), name='core-auth-accept-terms'),
    # POPIA Data Subject Rights (Access & Deletion)
    path('users/data-export/', DataExportView.as_view(), name='core-user-data-export'),
    path('users/delete-account/', DeleteAccountView.as_view(), name='core-user-delete-account'),
    path('users/avatar/', AvatarUpdateView.as_view(), name='user-avatar-update'),
    # Safe Harbor & DMCA
    path('dmca/', DMCARequestView.as_view(), name='core-dmca-request'),
    # Legal Documents (Terms, Privacy Policy, Community Guidelines)
    path('legal/<str:policy_type>/', LegalDocumentView.as_view(), name='core-legal-document'),
    path('', include(router.urls)),
]
