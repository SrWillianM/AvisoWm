"""
Views — App Cursos.
Trazabilidad: RF-02 (Catálogo Cursos), RF-05 / RF-06 (Padre-Curso), RN-01, RN-05.
Seguridad: Prevención de IDOR y segmentación de datos por usuario autenticado.
"""

from rest_framework import generics, permissions

from apps.usuarios.views import EsAdministrador

from .models import CursoSeccion, PadreCurso
from .serializers import CursoSeccionSerializer, PadreCursoSerializer


# ---------------------------------------------------------------------------
# Catálogo Institucional de Cursos y Secciones — RF-02, RN-01
# ---------------------------------------------------------------------------

class CursoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/cursos/ — Listar los cursos institucionales (disponible para todo usuario autenticado).
    POST /api/cursos/ — Dar de alta un nuevo curso (exclusivo para Administrador).
    """

    queryset = CursoSeccion.objects.all().order_by("nivel_educativo", "grado_curso", "seccion")
    serializer_class = CursoSeccionSerializer

    def get_permissions(self):
        """Aplica control granular de permisos según el método HTTP."""
        if self.request.method == "POST":
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]


class CursoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/cursos/<id>/
    Permite ver detalle, actualizar o eliminar un curso del catálogo.
    Exclusivo para el rol Administrador.
    """

    queryset = CursoSeccion.objects.all()
    serializer_class = CursoSeccionSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_curso"


# ---------------------------------------------------------------------------
# Vinculación Padre - Curso - Hijo — RF-05, RF-06, RN-04, RN-05
# ---------------------------------------------------------------------------

class EsPadre(permissions.BasePermission):
    """
    Regla RBAC:
    Solo los tutores con rol 'Padre' pueden gestionar sus vínculos de hijos y cursos.
    """

    message = "Acceso denegado: solo los tutores/padres pueden gestionar vínculos de cursos."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.rol == "Padre"
        )


class PadreCursoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/mis-cursos/ — Lista los cursos vinculados exclusivamente al padre autenticado.
    POST /api/mis-cursos/ — Asocia un nuevo curso indicando el nombre del hijo.

    Seguridad contra IDOR:
    El queryset siempre filtra `id_usuario=self.request.user`, impidiendo que un tutor
    pueda listar, ver o espiar los vínculos o hijos de otros padres.
    """

    serializer_class = PadreCursoSerializer
    permission_classes = [EsPadre]

    def get_queryset(self):
        # RN-05: Cada padre solo tiene visibilidad sobre sus propios registros
        return PadreCurso.objects.filter(
            id_usuario=self.request.user
        ).select_related("id_curso")

    def perform_create(self, serializer):
        # Asigna forzosamente el usuario de la sesión autenticada
        serializer.save(id_usuario=self.request.user)


class PadreCursoDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/mis-cursos/<id>/ — Desvincula un curso del padre autenticado.

    Seguridad contra IDOR:
    El `get_queryset` está acotado al usuario en sesión. Si un usuario intenta enviar
    el ID de un vínculo que pertenece a otro padre, Django responderá con HTTP 404 Not Found,
    evitando la eliminación no autorizada de recursos ajenos.
    """

    serializer_class = PadreCursoSerializer
    permission_classes = [EsPadre]
    lookup_field = "id_padre_curso"

    def get_queryset(self):
        return PadreCurso.objects.filter(id_usuario=self.request.user)
