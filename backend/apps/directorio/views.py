"""
Views — App Directorio.
Trazabilidad: RF-08 (Directorio Institucional), RF-09 (Soporte Técnico), RN-06 (Flujo de estados de tickets).
Seguridad: Segmentación de tickets para usuarios y permisos exclusivos de resolución para Administrador.
"""

from rest_framework import generics, permissions, serializers as drf_serializers

from apps.usuarios.views import EsAdministrador

from .models import ContactoUtil, ReporteSoporte
from .serializers import ContactoUtilSerializer, ReporteSoporteSerializer


# ---------------------------------------------------------------------------
# RF-08 — Directorio Institucional de Contactos Útiles
# ---------------------------------------------------------------------------

class ContactoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/contactos/ — Lista de contactos útiles institucionales (todos los usuarios autenticados).
    POST /api/contactos/ — Registro de un nuevo contacto de departamento (solo Administrador).
    """

    queryset = ContactoUtil.objects.all().order_by("departamento")
    serializer_class = ContactoUtilSerializer

    def get_permissions(self):
        """Permite lectura a todos y restringe escritura al Administrador."""
        if self.request.method == "POST":
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]


class ContactoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/contactos/<id>/
    Modificación o eliminación de un contacto institucional.
    Exclusivo para el rol Administrador.
    """

    queryset = ContactoUtil.objects.all()
    serializer_class = ContactoUtilSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_contacto"


# ---------------------------------------------------------------------------
# RF-09 — Mesa de Ayuda y Reportes de Soporte Técnico (RN-06)
# ---------------------------------------------------------------------------

class SoporteListCreateView(generics.ListCreateAPIView):
    """
    GET /api/soporte/ — Consulta de tickets de soporte técnico:
      - Administrador: Visión global de todos los tickets reportados en la institución.
      - Padres y Profesores: Visión restringida, solo ven sus propios tickets enviados.
    POST /api/soporte/ — Apertura de ticket (cualquier usuario autenticado).
    """

    serializer_class = ReporteSoporteSerializer

    def get_queryset(self):
        """Aplica filtro de privacidad para que los usuarios no lean tickets ajenos."""
        user = self.request.user
        qs = ReporteSoporte.objects.select_related("id_usuario")
        if user.rol == "Administrador":
            return qs
        return qs.filter(id_usuario=user)

    def perform_create(self, serializer):
        """Garantiza que el ticket quede asociado al usuario autenticado (sin falsificación)."""
        serializer.save(id_usuario=self.request.user)


class SoporteDetailView(generics.RetrieveUpdateAPIView):
    """
    GET /api/soporte/<id>/ — Detalle de un ticket.
    PATCH /api/soporte/<id>/ — Transición de estados (RN-06: Pendiente -> En_Revision -> Resuelto).
    
    Regla RN-06:
    Únicamente el Administrador puede cambiar el estado de resolución de un ticket.
    """

    queryset = ReporteSoporte.objects.select_related("id_usuario")
    serializer_class = ReporteSoporteSerializer
    lookup_field = "id_reporte"

    def get_permissions(self):
        """Restringe las actualizaciones de estado (PATCH/PUT) a administradores."""
        if self.request.method in ("PATCH", "PUT"):
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        """RN-06: Validación defensiva contra manipulación del flujo de estados."""
        new_estado = serializer.validated_data.get("estado")
        if new_estado and self.request.user.rol != "Administrador":
            raise drf_serializers.ValidationError(
                {"estado": "Solo un administrador puede cambiar el estado de resolución del reporte."}
            )
        serializer.save()
