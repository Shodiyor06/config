from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Avg, Q
from .models import Homework, HomeworkSubmission
from groups.models import Group


class CreateHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'TEACHER':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            homework = Homework.objects.create(
                group_id=request.data['group'],
                title=request.data['title'],
                description=request.data.get('description', '')
            )
            return Response({
                "message": "Homework created",
                "id": homework.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubmitHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, homework_id):
        if request.user.role != 'STUDENT':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            homework = Homework.objects.get(id=homework_id)
        except Homework.DoesNotExist:
            return Response({"error": "Homework not found"}, status=status.HTTP_404_NOT_FOUND)

        if homework.is_expired():
            return Response(
                {"error": "Deadline passed (24 hours)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already submitted
        if HomeworkSubmission.objects.filter(homework=homework, student=request.user).exists():
            return Response(
                {"error": "Already submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'file' not in request.FILES:
            return Response(
                {"error": "File required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission = HomeworkSubmission.objects.create(
            homework=homework,
            student=request.user,
            file=request.FILES['file']
        )

        return Response({
            "message": "Homework submitted",
            "id": submission.id
        }, status=status.HTTP_201_CREATED)


class GradeHomework(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, submission_id):
        if request.user.role != 'TEACHER':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        try:
            submission = HomeworkSubmission.objects.get(id=submission_id)
        except HomeworkSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

        # Verify teacher owns this homework
        if submission.homework.group.teacher != request.user:
            return Response({"error": "Not your submission"}, status=status.HTTP_403_FORBIDDEN)

        submission.score = request.data.get('score')
        submission.feedback = request.data.get('feedback', '')
        submission.graded_at = timezone.now()
        submission.save()

        return Response({"message": "Homework graded"}, status=status.HTTP_200_OK)


class HomeworkListStudent(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response([], status=status.HTTP_403_FORBIDDEN)

        groups = request.user.student_groups.all()
        homeworks = Homework.objects.filter(group__in=groups).order_by('-created_at')

        data = []
        for h in homeworks:
            # Check if submitted
            submission = HomeworkSubmission.objects.filter(
                homework=h, 
                student=request.user
            ).first()

            data.append({
                "id": h.id,
                "title": h.title,
                "description": h.description,
                "course": h.group.course.name,
                "group_name": h.group.name,
                "created_at": h.created_at,
                "deadline": h.deadline(),
                "expired": h.is_expired(),
                "status": "GRADED" if submission and submission.score is not None else (
                    "SUBMITTED" if submission else "PENDING"
                ),
                "grade": submission.score if submission else None,
                "feedback": submission.feedback if submission else None,
                "submission": {
                    "submitted_at": submission.submitted_at,
                    "file_url": submission.file.url
                } if submission else None
            })

        return Response(data)


class HomeworkSubmissionsTeacher(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response([], status=status.HTTP_403_FORBIDDEN)

        submissions = HomeworkSubmission.objects.filter(
            homework__group__teacher=request.user
        ).select_related('student', 'homework', 'homework__group').order_by('-submitted_at')

        data = []
        for s in submissions:
            data.append({
                "id": s.id,
                "student_name": s.student.phone,
                "homework_title": s.homework.title,
                "group_name": s.homework.group.name,
                "submitted_at": s.submitted_at,
                "late": s.is_late(),
                "file_url": s.file.url,
                "score": s.score,
                "feedback": s.feedback,
                "status": "GRADED" if s.score is not None else "SUBMITTED"
            })

        return Response(data)


class MyHomeworkSubmissions(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response([], status=status.HTTP_403_FORBIDDEN)

        submissions = HomeworkSubmission.objects.filter(
            student=request.user
        ).select_related('homework').order_by('-submitted_at')

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


class StudentStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'STUDENT':
            return Response({}, status=status.HTTP_403_FORBIDDEN)

        groups = request.user.student_groups.all()
        total_homework = Homework.objects.filter(group__in=groups).count()
        
        submissions = HomeworkSubmission.objects.filter(student=request.user)
        submitted = submissions.count()
        pending = total_homework - submitted
        
        avg_grade = submissions.filter(
            score__isnull=False
        ).aggregate(avg=Avg('score'))['avg'] or 0

        return Response({
            'total': total_homework,
            'pending': pending,
            'submitted': submitted,
            'average_grade': round(avg_grade, 1)
        })


class TeacherStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'TEACHER':
            return Response({}, status=status.HTTP_403_FORBIDDEN)

        groups = Group.objects.filter(teacher=request.user)
        total_groups = groups.count()
        total_students = sum(g.students.count() for g in groups)
        total_homework = Homework.objects.filter(group__teacher=request.user).count()
        pending_grades = HomeworkSubmission.objects.filter(
            homework__group__teacher=request.user,
            score__isnull=True
        ).count()

        return Response({
            'total_groups': total_groups,
            'total_students': total_students,
            'total_homework': total_homework,
            'pending_grades': pending_grades
        })


class HomeworkDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            homework = Homework.objects.select_related('group', 'group__course', 'group__teacher').get(id=pk)
        except Homework.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check access
        if request.user.role == 'STUDENT':
            if not homework.group.students.filter(id=request.user.id).exists():
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'TEACHER':
            if homework.group.teacher != request.user:
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        # Get submission if student
        submission = None
        if request.user.role == 'STUDENT':
            submission = HomeworkSubmission.objects.filter(
                homework=homework,
                student=request.user
            ).first()

        return Response({
            "id": homework.id,
            "title": homework.title,
            "description": homework.description,
            "course_name": homework.group.course.name,
            "group_name": homework.group.name,
            "teacher_name": homework.group.teacher.phone,
            "created_at": homework.created_at,
            "deadline": homework.deadline(),
            "max_grade": 100,
            "status": "GRADED" if submission and submission.score is not None else (
                "SUBMITTED" if submission else "PENDING"
            ),
            "grade": submission.score if submission else None,
            "feedback": submission.feedback if submission else None,
            "submission": {
                "submitted_at": submission.submitted_at,
                "file_url": submission.file.url
            } if submission else None
        })