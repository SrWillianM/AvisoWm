"""
Views — App Usuarios.
Trazabilidad: RF-01 (Login), RF-02 (CRUD usuarios), RNF-05 (RBAC).
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import LoginSerializer, UsuarioSerializer


# ---------------------------------------------------------------------------
# Permisos personalizados (RBAC)
# ---------------------------------------------------------------------------

class EsAdministrador(permissions.BasePermission):
    """Solo permite acceso a usuarios con rol Administrador."""

    message = "Solo los administradores pueden realizar esta acción."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and request.user.rol == "Administrador"
        )


# ---------------------------------------------------------------------------
# RF-01 — Login con cédula + contraseña → JWT
# ---------------------------------------------------------------------------

class LoginView(APIView):
    """POST /api/auth/login/ — Autentica y retorna tokens JWT."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
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
# RF-02 — CRUD Usuarios (solo Administrador)
# ---------------------------------------------------------------------------

class UsuarioListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/usuarios/ — Listar o crear usuarios (Admin)."""

    queryset = Usuario.objects.all().order_by("-fecha_registro")
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]


class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/usuarios/<id>/ — Detalle, editar o eliminar (Admin)."""

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_usuario"

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id_usuario == request.user.id_usuario:
            return Response(
                {"detail": "No puedes eliminar tu propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# GET /api/auth/me/ — Perfil del usuario autenticado
# ---------------------------------------------------------------------------

class MeView(APIView):
    """GET /api/auth/me/ — Retorna el perfil del usuario autenticado."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
