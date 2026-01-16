from django.urls import path
from .views import LoginAPIView, redirect_by_role

urlpatterns = [
    path('api/auth/login/', LoginAPIView.as_view(), name='api_login'),
    path('profile/', redirect_by_role, name='profile'),
]