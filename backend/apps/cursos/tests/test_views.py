"""
Tests de Cursos — CP-06 (Vinculación padre-curso, RN-05).
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.cursos.models import PadreCurso


@pytest.mark.django_db
class TestCP06VinculacionPadreCurso:
    """CP-06: Padre vincula curso con nombre_hijo; no ve vínculos ajenos."""

    url = reverse("padre-curso-list-create")

    def test_padre_vincula_curso(self, padre_client, padre_user, curso_sample):
        """Padre vincula curso → HTTP 201."""
        response = padre_client.post(
            self.url,
            {"id_curso": curso_sample.id_curso, "nombre_hijo": "María"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert PadreCurso.objects.filter(id_usuario=padre_user, nombre_hijo="María").exists()

    def test_padre_lista_solo_sus_vinculos(self, padre_client, padre_vinculado, curso_sample_b, admin_user):
        """Padre solo ve sus propios vínculos, no los de otro padre."""
        # Crear vínculo de otro padre
        from apps.usuarios.models import Usuario
        otro_padre = Usuario.objects.create_user(
            cedula="otro001", password="p", nombre_completo="Otro", rol="Padre",
        )
        PadreCurso.objects.create(
            id_usuario=otro_padre, id_curso=curso_sample_b, nombre_hijo="Ajeno",
        )

        response = padre_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        items = data.get("results", data) if isinstance(data, dict) else data
        nombres = [v["nombre_hijo"] for v in items]
        assert "Juan Demo" in nombres  # del fixture padre_vinculado
        assert "Ajeno" not in nombres

    def test_profesor_no_accede_mis_cursos(self, profesor_client):
        """Profesor → HTTP 403 en /api/mis-cursos/ (solo Padres)."""
        response = profesor_client.get(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
