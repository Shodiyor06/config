from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import redirect, render
from .models import User
from django.contrib.auth import authenticate, login

@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '')
        password = request.data.get('password', '')

        # telefonni normallashtiramiz
        phone = ''.join(filter(str.isdigit, phone))
        if len(phone) == 9:
            phone = '998' + phone

        user = User.objects.filter(phone=phone, password=password).first()

        if not user:
            return Response({"detail": "Invalid credentials"}, status=401)
        login(request, user)
        # SESSION
        # request.session['user_id'] = user.id
        # request.session['user_role'] = user.role

        return Response({"status": "ok"})


def redirect_by_role(request):
    user_id = request.session.get('user_id')
    role = request.session.get('user_role')

    if not user_id or not role:
        return redirect('/login/')

    if role == 'STUDENT':
        return redirect('/student/')

    if role == 'TECHER':
        return redirect('/teacher/')
    
    if role == 'ADMIN':
        return redirect('/admin/')

    return redirect('/login/')

