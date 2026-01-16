from django.shortcuts import render, redirect

def student_dashboard(request):
    if request.session.get('role') != 'STUDENT':
        return redirect('/login/')
    return render(request, '/student/dashboard.html')
