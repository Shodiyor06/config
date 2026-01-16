from django.urls import path
from .views import (
    HomeworkListStudent,
    HomeworkSubmissionsTeacher,
    MyHomeworkSubmissions,
    SubmitHomework,
    GradeHomework,
    CreateHomework,
    StudentStats,
    TeacherStats,
    HomeworkDetail
)

urlpatterns = [
    # Student endpoints
    path('', HomeworkListStudent.as_view(), name='homework_list'),
    path('stats/', StudentStats.as_view(), name='student_stats'),
    path('my-submissions/', MyHomeworkSubmissions.as_view(), name='my_submissions'),
    path('<int:pk>/', HomeworkDetail.as_view(), name='homework_detail'),
    path('<int:homework_id>/submit/', SubmitHomework.as_view(), name='submit_homework'),
    
    # Teacher endpoints
    path('create/', CreateHomework.as_view(), name='create_homework'),
    path('submissions/', HomeworkSubmissionsTeacher.as_view(), name='teacher_submissions'),
    path('teacher-stats/', TeacherStats.as_view(), name='teacher_stats'),
    path('submission/<int:submission_id>/grade/', GradeHomework.as_view(), name='grade_homework'),
]