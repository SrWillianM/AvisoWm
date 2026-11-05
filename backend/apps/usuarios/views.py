"""
Views — App Usuarios.
Trazabilidad: RF-01 (Login), RF-02 (CRUD usuarios), RNF-04 (PBKDF2 SHA-256), RNF-05 (RBAC).
Control de Acceso: Exclusivo para Administrador en gestión de cuentas institucionales.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import LoginSerializer, UsuarioSerializer


# ---------------------------------------------------------------------------
# Permiso RBAC Personalizado: EsAdministrador
# ---------------------------------------------------------------------------

class EsAdministrador(permissions.BasePermission):
    """
    Control de Acceso Basado en Roles (RBAC):
    Verifica que el usuario solicitante esté autenticado mediante JWT y posea el rol 'Administrador'.
    Cualquier intento por parte de Profesores o Padres genera HTTP 403 Forbidden.
    """

    message = "Acceso denegado: solo los administradores pueden realizar esta acción."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == "Administrador"
        )


# ---------------------------------------------------------------------------
# RF-01 — Login con Cédula y Contraseña → Generación de JWT (SimpleJWT)
# ---------------------------------------------------------------------------

class LoginView(APIView):
    """
    POST /api/auth/login/
    Punto de entrada de autenticación.
    - Recibe cédula y contraseña.
    - Autentica contra el hasher PBKDF2/SHA-256 (RNF-04).
    - Genera un Access Token (2h) y Refresh Token (7d).
    - No requiere autenticación previa (AllowAny).
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # Genera el par de tokens criptográficos firmados con HMAC-SHA256
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id_usuario": user.id_usuario,
                    "nombre_completo": user.nombre_completo,
                    "rol": user.rol,
                },
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# RF-02 — Administración de Usuarios (Solo Administrador)
# ---------------------------------------------------------------------------

class UsuarioListCreateView(generics.ListCreateAPIView):
    """
    GET /api/usuarios/ — Lista todos los usuarios ordenados por fecha de registro.
    POST /api/usuarios/ — Da de alta una nueva cuenta institucional (Admin).
    """

    queryset = Usuario.objects.all().order_by("-fecha_registro")
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/usuarios/<id>/ — Detalle de una cuenta.
    PATCH /api/usuarios/<id>/ — Modificación de rol, nombre o contraseña.
    DELETE /api/usuarios/<id>/ — Baja de cuenta institucional.
    
    Protección de Integridad: Impide el autoborrado del administrador en sesión.
    """

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_usuario"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Regla de seguridad: evita que el administrador actual quede bloqueado fuera del sistema
        if instance.id_usuario == request.user.id_usuario:
            return Response(
                {"detail": "Por seguridad, no puedes eliminar tu propia cuenta en sesión."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# GET /api/auth/me/ — Perfil del Usuario en Sesión Activa
# ---------------------------------------------------------------------------

class MeView(APIView):
    """
    GET /api/auth/me/
    Retorna la información del usuario autenticado a partir del payload del JWT.
    Permite al frontend inicializar el estado del usuario sin consultar datos de terceros.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
