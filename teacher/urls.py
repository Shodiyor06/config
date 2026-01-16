from django.urls import path
from .views import teacher_dashboard

urlpatterns = [
    path('teacher/', teacher_dashboard, name='teacher_dashboard'),
]
