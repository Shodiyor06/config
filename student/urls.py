from django.urls import path
from .views import student_dashboard

urlpatterns = [
    path('student/', student_dashboard),
]
