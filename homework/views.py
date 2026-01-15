from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Homework
from groups.models import Group

from django.utils import timezone
from .models import Homework, HomeworkSubmission

class CreateHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Forbidden"}, status=403)

        Homework.objects.create(
            group_id=request.data['group'],
            title=request.data['title'],
            description=request.data.get('description', '')
        )

        return Response({"message": "Homework created"})


from .models import Homework, HomeworkSubmission

class SubmitHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, homework_id):
        if request.user.role != 'STUDENT':
            return Response({"error": "Forbidden"}, status=403)

        homework = Homework.objects.get(id=homework_id)

        if homework.is_expired():
            return Response(
                {"error": "Deadline passed (24 hours)"},
                status=400
            )

        HomeworkSubmission.objects.create(
            homework=homework,
            student=request.user,
            file=request.FILES['file']
        )

        return Response({"message": "Homework submitted"})


class GradeHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, submission_id):
        if request.user.role != 'TEACHER':
            return Response({"error": "Forbidden"}, status=403)

        submission = HomeworkSubmission.objects.get(id=submission_id)

        submission.score = request.data.get('score')
        submission.feedback = request.data.get('feedback', '')
        submission.graded_at = timezone.now()
        submission.save()

        return Response({"message": "Homework graded"})



class HomeworkListStudent(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response([], status=403)

        groups = request.user.student_groups.all()
        homeworks = Homework.objects.filter(group__in=groups)

        data = []
        for h in homeworks:
            data.append({
                "id": h.id,
                "title": h.title,
                "description": h.description,
                "created_at": h.created_at,
                "deadline": h.deadline(),
                "expired": h.is_expired()
            })

        return Response(data)

class HomeworkSubmissionsTeacher(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response([], status=403)

        submissions = HomeworkSubmission.objects.filter(
            homework__group__teacher=request.user
        ).select_related('student', 'homework')

        data = []
        for s in submissions:
            data.append({
                "id": s.id,
                "student": s.student.phone,
                "homework": s.homework.title,
                "submitted_at": s.submitted_at,
                "late": s.is_late(),
                "file": s.file.url,
                "score": s.score
            })

        return Response(data)


class MyHomeworkSubmissions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response([], status=403)

        submissions = HomeworkSubmission.objects.filter(student=request.user)

        data = []
        for s in submissions:
            data.append({
                "homework": s.homework.title,
                "submitted_at": s.submitted_at,
                "late": s.is_late(),
                "score": s.score,
                "feedback": s.feedback,
                "graded_at": s.graded_at
            })

        return Response(data)
