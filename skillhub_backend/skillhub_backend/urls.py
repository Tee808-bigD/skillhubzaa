"""
URL Configuration for skillhub_backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView, RegisterView, home_view

urlpatterns = [
    # Root Landing Page: Links to Full Web App, Admin, and API Endpoints
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    # JWT Authentication Endpoints
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/logout/', LogoutView.as_view(), name='token_logout'),
    # Auth Endpoints
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/logout/', LogoutView.as_view(), name='auth_logout'),
    # SkillHub ZA Core Endpoints
    path('api/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
