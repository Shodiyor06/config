from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('student/', TemplateView.as_view(template_name='student/dashboard.html'), name='student_dashboard'),
    path('teacher/', TemplateView.as_view(template_name='teacher/dashboard.html'), name='teacher_dashboard'),
    path('homework/<int:pk>/', TemplateView.as_view(template_name='student/homework_detail.html'), name='homework_detail'),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/homework/', include('homework.urls')),
    path('api/schedules/', include('schedules.urls')),
    path('api/ratings/', include('ratings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)