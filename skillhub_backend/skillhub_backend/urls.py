"""
URL Configuration for skillhub_backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import CustomTokenObtainPairView, home_view

urlpatterns = [
    # Root Landing Page: Links to Full Web App, Admin, and API Endpoints
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    # JWT Authentication Endpoints (CustomTokenObtainPairView includes user summary)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # SkillHub ZA Core Endpoints
    path('api/', include('core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
