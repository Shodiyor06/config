from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
from accounts.models import User
import json


@csrf_exempt   # 🔥 MANA SHU — 3-QADAM
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    data = json.loads(request.body.decode('utf-8'))
    phone = data.get('phone')
    password = data.get('password')

    if not phone or not password:
        return JsonResponse(
            {'error': 'Telefon va parol majburiy'},
            status=400
        )

    try:
        user = User.objects.get(phone=phone)
    except User.DoesNotExist:
        return JsonResponse(
            {'error': 'Login yoki parol noto‘g‘ri'},
            status=401
        )

    if not check_password(password, user.password):
        return JsonResponse(
            {'error': 'Login yoki parol noto‘g‘ri'},
            status=401
        )

    # ✅ HAMMASI TO‘G‘RI BO‘LSA
    login(request, user)

    return JsonResponse({
        'success': True,
        'role': user.role,
        'name': user.phone
    })
