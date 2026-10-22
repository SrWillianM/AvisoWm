"""
Views — App Avisos.
Trazabilidad: RF-03, RF-04, RF-05, RF-07, RN-02, RN-03, RN-04.
"""

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.cursos.models import PadreCurso
from apps.usuarios.views import EsAdministrador

from .models import Aviso
from .serializers import AvisoSerializer


class EsAutorOAdmin(permissions.BasePermission):
    """Permite editar al autor del aviso o a un Administrador."""

    message = "Solo el autor o un administrador pueden modificar este aviso."

    def has_object_permission(self, request, view, obj):
        return (
            obj.id_autor == request.user
            or request.user.rol == "Administrador"
        )


class AvisoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/avisos/ — Lista avisos según rol:
      - Admin/Profesor: todos los activos (o todos si Admin).
      - Padre: solo activos con Q(General) | Q(id_curso in cursos_vinculados) [RN-04].
    POST /api/avisos/ — Publicar un aviso (RN-02, RN-03).
    """

    serializer_class = AvisoSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Aviso.objects.select_related("id_autor", "id_curso")

        if user.rol == "Administrador":
            return qs

        if user.rol == "Padre":
            cursos_ids = PadreCurso.objects.filter(
                id_usuario=user
            ).values_list("id_curso", flat=True)
            return qs.filter(
                estado_activo=True,
            ).filter(
                Q(tipo_aviso="General") | Q(id_curso__in=cursos_ids)
            )

        # Profesor: ve avisos activos (todos los generales + los de sus cursos si los tiene)
        return qs.filter(estado_activo=True)

    def perform_create(self, serializer):
        serializer.save(id_autor=self.request.user)


class AvisoDetailView(generics.RetrieveUpdateAPIView):
    """
    GET /api/avisos/<id>/ — Detalle de un aviso.
    PATCH /api/avisos/<id>/ — Editar título/contenido o baja lógica (RF-07).
    """

    queryset = Aviso.objects.select_related("id_autor", "id_curso")
    serializer_class = AvisoSerializer
    permission_classes = [permissions.IsAuthenticated, EsAutorOAdmin]
    lookup_field = "id_aviso"
