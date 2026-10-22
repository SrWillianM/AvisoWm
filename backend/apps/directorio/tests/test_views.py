"""
Tests de Directorio — CP-08 (Contactos) y CP-09 (Soporte, RN-06).
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.directorio.models import ContactoUtil, ReporteSoporte


# ===========================================================================
# CP-08: Directorio de Contactos (RF-08)
# ===========================================================================

@pytest.mark.django_db
class TestCP08Directorio:
    """CP-08: Autenticados leen; solo Admin crea/edita."""

    url = reverse("contacto-list-create")

    def test_autenticado_lista_contactos(self, padre_client):
        """GET autenticado → HTTP 200."""
        ContactoUtil.objects.create(
            departamento="Secretaría", nombre_encargado="Ana",
            telefono="0985123456", horario_atencion="07:00 - 12:00",
        )
        response = padre_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_padre_no_crea_contacto(self, padre_client):
        """Padre intenta POST → HTTP 403."""
        response = padre_client.post(
            self.url,
            {
                "departamento": "IT",
                "nombre_encargado": "Carlos",
                "telefono": "0981000000",
                "horario_atencion": "08:00 - 16:00",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_crea_contacto(self, admin_client):
        """Admin crea contacto → HTTP 201."""
        response = admin_client.post(
            self.url,
            {
                "departamento": "Dirección",
                "nombre_encargado": "Director",
                "telefono": "0981111111",
                "horario_atencion": "07:00 - 14:00",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED


# ===========================================================================
# CP-09: Soporte Técnico (RF-09, RN-06)
# ===========================================================================

@pytest.mark.django_db
class TestCP09Soporte:
    """CP-09: Cualquiera crea ticket (estado='Pendiente'); solo Admin cambia estado."""

    url = reverse("soporte-list-create")

    def test_padre_crea_ticket(self, padre_client):
        """Padre crea ticket → HTTP 201, estado='Pendiente'."""
        response = padre_client.post(
            self.url,
            {"asunto": "No puedo ver avisos", "mensaje": "La cartelera no carga."},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["estado"] == "Pendiente"

    def test_admin_cambia_estado(self, admin_client, padre_user):
        """Admin cambia estado del ticket → HTTP 200."""
        reporte = ReporteSoporte.objects.create(
            asunto="Bug", mensaje="Error", id_usuario=padre_user,
        )
        url = reverse("soporte-detail", kwargs={"id_reporte": reporte.id_reporte})
        response = admin_client.patch(url, {"estado": "En_Revision"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        reporte.refresh_from_db()
        assert reporte.estado == "En_Revision"

    def test_padre_no_cambia_estado(self, padre_client, padre_user):
        """Padre intenta cambiar estado → HTTP 403 (RN-06)."""
        reporte = ReporteSoporte.objects.create(
            asunto="Bug", mensaje="Error", id_usuario=padre_user,
        )
        url = reverse("soporte-detail", kwargs={"id_reporte": reporte.id_reporte})
        response = padre_client.patch(url, {"estado": "Resuelto"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
