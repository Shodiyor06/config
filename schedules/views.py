from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Schedule
from .serializers import ScheduleSerializer

class MyScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'STUDENT':
            schedules = Schedule.objects.filter(group__students=user)
        elif user.role == 'TEACHER':
            schedules = Schedule.objects.filter(group__teacher=user)
        else:
            schedules = Schedule.objects.all()

        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

