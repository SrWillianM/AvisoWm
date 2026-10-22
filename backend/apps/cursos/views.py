"""
Views — App Cursos.
Trazabilidad: RF-02 (catálogo cursos), RF-05/RF-06 (padre-curso), RN-05.
"""

from rest_framework import generics, permissions

from apps.usuarios.views import EsAdministrador

from .models import CursoSeccion, PadreCurso
from .serializers import CursoSeccionSerializer, PadreCursoSerializer


# ---------------------------------------------------------------------------
# Catálogo de Cursos — RF-02
# ---------------------------------------------------------------------------

class CursoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/cursos/ — Listar cursos (todos los autenticados).
    POST /api/cursos/ — Crear curso (solo Admin).
    """

    queryset = CursoSeccion.objects.all().order_by("nivel_educativo", "grado_curso", "seccion")
    serializer_class = CursoSeccionSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]


class CursoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/cursos/<id>/ — Solo Admin modifica."""

    queryset = CursoSeccion.objects.all()
    serializer_class = CursoSeccionSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_curso"


# ---------------------------------------------------------------------------
# Vinculación Padre-Curso — RF-05, RF-06, RN-05
# ---------------------------------------------------------------------------

class EsPadre(permissions.BasePermission):
    """Solo padres pueden gestionar vínculos padre-curso."""

    message = "Solo los padres pueden gestionar vínculos de curso."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == "Padre"


class PadreCursoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/mis-cursos/ — Listar vínculos del padre autenticado (RN-05).
    POST /api/mis-cursos/ — Vincular un curso con nombre_hijo.
    """

    serializer_class = PadreCursoSerializer
    permission_classes = [EsPadre]

    def get_queryset(self):
        # RN-05: solo sus propios vínculos
        return PadreCurso.objects.filter(
            id_usuario=self.request.user
        ).select_related("id_curso")

    def perform_create(self, serializer):
        serializer.save(id_usuario=self.request.user)


class PadreCursoDeleteView(generics.DestroyAPIView):
    """DELETE /api/mis-cursos/<id>/ — Quitar vínculo (solo del padre dueño)."""

    serializer_class = PadreCursoSerializer
    permission_classes = [EsPadre]
    lookup_field = "id_padre_curso"

    def get_queryset(self):
        return PadreCurso.objects.filter(id_usuario=self.request.user)
