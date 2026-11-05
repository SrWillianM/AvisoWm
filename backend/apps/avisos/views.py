"""
Views — App Avisos.
Trazabilidad: RF-03, RF-04, RF-05, RF-07, RN-02, RN-03, RN-04.
Seguridad: RBAC estricto, mitigación de BOLA y segmentación de datos a nivel ORM.
"""

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.cursos.models import PadreCurso
from apps.usuarios.views import EsAdministrador

from .models import Aviso
from .serializers import AvisoSerializer


# ---------------------------------------------------------------------------
# Clases de Permisos Personalizadas (RBAC — RNF-05)
# ---------------------------------------------------------------------------

class EsProfesorOAdmin(permissions.BasePermission):
    """
    Regla de Seguridad RBAC:
    - Lectura (GET): Permitida a todo usuario autenticado.
    - Escritura / Creación (POST): Exclusiva para 'Administrador' o 'Profesor'.
    Los tutores ('Padre') no pueden emitir comunicados bajo ninguna circunstancia.
    """

    message = "Solo profesores y administradores tienen permisos para publicar comunicados institucionales."

    def has_permission(self, request, view):
        if request.method == "POST":
            return (
                request.user.is_authenticated
                and request.user.rol in ("Administrador", "Profesor")
            )
        return request.user.is_authenticated


class EsAutorOAdmin(permissions.BasePermission):
    """
    Seguridad a nivel de objeto (Object-Level Permission):
    Solo el autor original del aviso o un Administrador del sistema
    pueden modificar o dar de baja lógica un comunicado existente (RF-07).
    Previene ataques IDOR (Insecure Direct Object Reference).
    """

    message = "Solo el autor original o un administrador pueden modificar este aviso."

    def has_object_permission(self, request, view, obj):
        return (
            obj.id_autor == request.user
            or request.user.rol == "Administrador"
        )


# ---------------------------------------------------------------------------
# Vista de Listado y Creación de Avisos — RF-03, RF-04, RF-05
# ---------------------------------------------------------------------------

class AvisoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/avisos/ — Retorna la cartelera institucional segmentada:
      - Administrador: Ve todos los comunicados (activos e inactivos).
      - Profesor: Ve todos los comunicados con estado_activo=True.
      - Padre / Tutor: Filtro estricto RN-04. Solo ve avisos activos donde:
            tipo_aviso == 'General'  O  id_curso pertenezca a sus cursos vinculados.
    POST /api/avisos/ — Publica un nuevo comunicado (solo Profesor o Admin).
    """

    serializer_class = AvisoSerializer
    permission_classes = [EsProfesorOAdmin]

    def get_queryset(self):
        """
        Consulta optimizada con `select_related` para evitar el problema de N+1 queries
        al traer en un solo JOIN los datos del autor y del curso referenciado.
        """
        user = self.request.user
        qs = Aviso.objects.select_related("id_autor", "id_curso")

        # 1. Administrador: Visión global de auditoría (incluye dados de baja)
        if user.rol == "Administrador":
            return qs

        # 2. Padre: Segmentación estricta en base de datos (RN-04)
        if user.rol == "Padre":
            # Extrae los IDs de curso a los que está vinculado este padre en `padre_curso`
            cursos_ids = PadreCurso.objects.filter(
                id_usuario=user
            ).values_list("id_curso", flat=True)

            # Aplica operador lógico OR en SQL:
            # WHERE estado_activo = TRUE AND (tipo_aviso = 'General' OR id_curso IN (...))
            return qs.filter(
                estado_activo=True,
            ).filter(
                Q(tipo_aviso="General") | Q(id_curso__in=cursos_ids)
            )

        # 3. Profesor: Avisos vigentes del colegio
        return qs.filter(estado_activo=True)

    def perform_create(self, serializer):
        """
        Asigna automáticamente el autor autenticado de forma confiable desde el JWT,
        impidiendo la suplantación de identidad en el campo `id_autor`.
        """
        serializer.save(id_autor=self.request.user)


# ---------------------------------------------------------------------------
# Vista de Detalle y Modificación de Avisos — RF-07
# ---------------------------------------------------------------------------

class AvisoDetailView(generics.RetrieveUpdateAPIView):
    """
    GET /api/avisos/<id>/ — Detalle completo de un aviso.
    PATCH /api/avisos/<id>/ — Modificación o baja lógica (RF-07).
    No se eliminan registros físicamente (sin DELETE en SQL) para preservar
    la trazabilidad institucional y el respaldo histórico de comunicados.
    """

    queryset = Aviso.objects.select_related("id_autor", "id_curso")
    serializer_class = AvisoSerializer
    permission_classes = [permissions.IsAuthenticated, EsAutorOAdmin]
    lookup_field = "id_aviso"
