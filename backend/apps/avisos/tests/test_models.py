"""Tests de modelos — App Avisos."""

import pytest

from apps.avisos.models import Aviso
from apps.usuarios.models import Usuario


@pytest.mark.django_db
class TestAvisoModel:
    def test_str_representation(self):
        user = Usuario.objects.create_user(cedula="av001", password="p", nombre_completo="A")
        aviso = Aviso.objects.create(
            titulo="Test", contenido="C", tipo_aviso="General", id_autor=user,
        )
        assert "[General] Test" in str(aviso)
