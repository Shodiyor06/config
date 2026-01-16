from django.shortcuts import render, redirect

def teacher_dashboard(request):
    if request.user.role != 'TEACHER':
        return redirect('/login/')
    return render(request, 'teacher/dashboard.html')
