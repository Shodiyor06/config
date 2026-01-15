from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Rating
from .serializers import RatingSerializer
from django.http import HttpResponse
import openpyxl

class MyRatingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'STUDENT':
            ratings = Rating.objects.filter(student=user)
        elif user.role == 'TEACHER':
            ratings = Rating.objects.filter(group__teacher=user)
        else:
            ratings = Rating.objects.all()

        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)



class ExportRatingsExcel(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response({"error":"Forbidden"}, status=403)

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(["Student", "Group", "Score", "Attendance"])

        for r in Rating.objects.all():
            ws.append([r.student.phone, r.group.name, r.score, r.attendance])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename=ratings.xlsx'
        wb.save(response)
        return response
