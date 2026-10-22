"""
Tests de Avisos — CP-03, CP-04, CP-05, CP-07.
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.avisos.models import Aviso


# ===========================================================================
# CP-03: Aviso General (RF-03, RN-02)
# ===========================================================================

@pytest.mark.django_db
class TestCP03AvisoGeneral:
    """CP-03: Solo Admin puede publicar avisos generales."""

    url = reverse("aviso-list-create")

    def test_admin_publica_aviso_general(self, admin_client, admin_user):
        """Admin publica aviso General → HTTP 201, id_curso=null."""
        response = admin_client.post(
            self.url,
            {"titulo": "Reunión general", "contenido": "Convocamos a todos.", "tipo_aviso": "General"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["tipo_aviso"] == "General"
        assert data["id_curso"] is None

    def test_profesor_no_puede_publicar_aviso_general(self, profesor_client):
        """Profesor intenta aviso General → HTTP 400 (validación RN-02)."""
        response = profesor_client.post(
            self.url,
            {"titulo": "Intento general", "contenido": "No debería.", "tipo_aviso": "General"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ===========================================================================
# CP-04: Aviso Específico (RF-04, RN-03)
# ===========================================================================

@pytest.mark.django_db
class TestCP04AvisoEspecifico:
    """CP-04: Avisos específicos requieren id_curso válido."""

    url = reverse("aviso-list-create")

    def test_profesor_publica_aviso_especifico(self, profesor_client, curso_sample):
        """Profesor publica con id_curso válido → HTTP 201."""
        response = profesor_client.post(
            self.url,
            {
                "titulo": "Tarea de Matemáticas",
                "contenido": "Ejercicios página 42.",
                "tipo_aviso": "Especifico",
                "id_curso": curso_sample.id_curso,
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["id_curso"] == curso_sample.id_curso

    def test_aviso_especifico_sin_curso_falla(self, profesor_client):
        """Aviso específico sin id_curso → HTTP 400 (RN-03)."""
        response = profesor_client.post(
            self.url,
            {
                "titulo": "Sin curso",
                "contenido": "Falta id_curso.",
                "tipo_aviso": "Especifico",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ===========================================================================
# CP-05: Cartelera Padre (RF-05, RN-04)
# ===========================================================================

@pytest.mark.django_db
class TestCP05CarteleraPadre:
    """CP-05: Padre ve solo avisos activos: Generales + los de su curso vinculado."""

    url = reverse("aviso-list-create")

    def test_padre_ve_avisos_filtrados(
        self, padre_client, admin_user, padre_vinculado, curso_sample, curso_sample_b
    ):
        """Padre ve avisos generales + los de su curso, pero NO los de otro curso."""
        # Aviso general
        Aviso.objects.create(
            titulo="General", contenido="Para todos",
            tipo_aviso="General", id_autor=admin_user, id_curso=None,
        )
        # Aviso del curso del padre
        Aviso.objects.create(
            titulo="Mi curso", contenido="Tarea",
            tipo_aviso="Especifico", id_autor=admin_user, id_curso=curso_sample,
        )
        # Aviso de OTRO curso (no debe verse)
        Aviso.objects.create(
            titulo="Otro curso", contenido="No para mí",
            tipo_aviso="Especifico", id_autor=admin_user, id_curso=curso_sample_b,
        )
        # Aviso desactivado (no debe verse)
        Aviso.objects.create(
            titulo="Desactivado", contenido="Baja lógica",
            tipo_aviso="General", id_autor=admin_user, id_curso=None,
            estado_activo=False,
        )

        response = padre_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        resultados = response.json()["results"]
        titulos = [a["titulo"] for a in resultados]
        assert "General" in titulos
        assert "Mi curso" in titulos
        assert "Otro curso" not in titulos
        assert "Desactivado" not in titulos


# ===========================================================================
# CP-07: Edición / Baja Lógica de Aviso (RF-07)
# ===========================================================================

@pytest.mark.django_db
class TestCP07EdicionAviso:
    """CP-07: Autor o Admin edita; otro usuario no puede."""

    def test_autor_edita_su_aviso(self, profesor_client, profesor_user, curso_sample):
        """El autor edita título de su aviso → HTTP 200."""
        aviso = Aviso.objects.create(
            titulo="Original", contenido="Texto",
            tipo_aviso="Especifico", id_autor=profesor_user, id_curso=curso_sample,
        )
        url = reverse("aviso-detail", kwargs={"id_aviso": aviso.id_aviso})
        response = profesor_client.patch(url, {"titulo": "Editado"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        aviso.refresh_from_db()
        assert aviso.titulo == "Editado"

    def test_baja_logica(self, admin_client, admin_user, curso_sample):
        """Admin desactiva aviso (estado_activo=False) → baja lógica."""
        aviso = Aviso.objects.create(
            titulo="Activo", contenido="T",
            tipo_aviso="Especifico", id_autor=admin_user, id_curso=curso_sample,
        )
        url = reverse("aviso-detail", kwargs={"id_aviso": aviso.id_aviso})
        response = admin_client.patch(url, {"estado_activo": False}, format="json")
        assert response.status_code == status.HTTP_200_OK
        aviso.refresh_from_db()
        assert aviso.estado_activo is False

    def test_padre_no_puede_editar(self, padre_client, admin_user, curso_sample):
        """Padre intenta editar aviso ajeno → HTTP 403."""
        aviso = Aviso.objects.create(
            titulo="No mío", contenido="T",
            tipo_aviso="Especifico", id_autor=admin_user, id_curso=curso_sample,
        )
        url = reverse("aviso-detail", kwargs={"id_aviso": aviso.id_aviso})
        response = padre_client.patch(url, {"titulo": "Hack"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN
