from django.urls import path
from .views import (
    HomeworkListStudent,
    HomeworkSubmissionsTeacher,
    MyHomeworkSubmissions,
    SubmitHomework,
    GradeHomework,
    CreateHomework
)

urlpatterns = [
    path('list/', HomeworkListStudent.as_view()),
    path('submissions/', HomeworkSubmissionsTeacher.as_view()),
    path('my-submissions/', MyHomeworkSubmissions.as_view()),

    path('create/', CreateHomework.as_view()),
    path('submit/<int:homework_id>/', SubmitHomework.as_view()),
    path('grade/<int:submission_id>/', GradeHomework.as_view()),
]
