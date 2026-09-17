import json

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def pagina_login(request):
    return render(request, 'login_app/login.html')


@csrf_exempt
@require_POST
def api_iniciar_sesion(request):
    """Autentica un usuario mediante cédula de identidad y contraseña."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'El cuerpo debe ser un JSON válido.'},
            status=400,
        )

    cedula = str(data.get('cedula', '')).strip()
    password = data.get('password', '')

    if not cedula or not password:
        return JsonResponse(
            {'error': 'La cédula y la contraseña son obligatorias.'},
            status=400,
        )

    user = authenticate(request, username=cedula, password=password)

    if user is None:
        return JsonResponse({'error': 'Credenciales inválidas.'}, status=401)

    login(request, user)
    return JsonResponse({
        'mensaje': 'Inicio de sesión exitoso.',
        'usuario': {
            'id': user.id,
            'cedula': user.cedula,
            'nombre': user.get_full_name(),
            'rol': user.rol,
        },
    })
