"""
Views — App Directorio.
Trazabilidad: RF-08 (directorio contactos), RF-09 (soporte técnico), RN-06.
"""

from rest_framework import generics, permissions, serializers as drf_serializers

from apps.usuarios.views import EsAdministrador

from .models import ContactoUtil, ReporteSoporte
from .serializers import ContactoUtilSerializer, ReporteSoporteSerializer


# ---------------------------------------------------------------------------
# RF-08 — Directorio de Contactos Útiles
# ---------------------------------------------------------------------------

class ContactoListCreateView(generics.ListCreateAPIView):
    """
    GET /api/contactos/ — Listar contactos (autenticados).
    POST /api/contactos/ — Crear contacto (solo Admin).
    """

    queryset = ContactoUtil.objects.all().order_by("departamento")
    serializer_class = ContactoUtilSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]


class ContactoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """PATCH/DELETE /api/contactos/<id>/ — Solo Admin."""

    queryset = ContactoUtil.objects.all()
    serializer_class = ContactoUtilSerializer
    permission_classes = [EsAdministrador]
    lookup_field = "id_contacto"


# ---------------------------------------------------------------------------
# RF-09 — Reportes de Soporte Técnico (RN-06)
# ---------------------------------------------------------------------------

class SoporteListCreateView(generics.ListCreateAPIView):
    """
    GET /api/soporte/ — Admin ve todos; otros ven solo los suyos.
    POST /api/soporte/ — Crear ticket (cualquier usuario autenticado).
    """

    serializer_class = ReporteSoporteSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ReporteSoporte.objects.select_related("id_usuario")
        if user.rol == "Administrador":
            return qs
        return qs.filter(id_usuario=user)

    def perform_create(self, serializer):
        serializer.save(id_usuario=self.request.user)


class SoporteDetailView(generics.RetrieveUpdateAPIView):
    """
    PATCH /api/soporte/<id>/ — Solo Admin puede cambiar estado (RN-06).
    """

    queryset = ReporteSoporte.objects.select_related("id_usuario")
    serializer_class = ReporteSoporteSerializer
    lookup_field = "id_reporte"

    def get_permissions(self):
        if self.request.method in ("PATCH", "PUT"):
            return [EsAdministrador()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        """RN-06: Solo Admin transiciona el estado."""
        new_estado = serializer.validated_data.get("estado")
        if new_estado and self.request.user.rol != "Administrador":
            raise drf_serializers.ValidationError(
                {"estado": "Solo un administrador puede cambiar el estado del reporte."}
            )
        serializer.save()
