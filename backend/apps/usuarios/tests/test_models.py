"""
Tests de modelos — App Usuarios.
"""

import pytest

from apps.usuarios.models import Usuario


@pytest.mark.django_db
class TestUsuarioModel:
    """Verifica la creación y restricciones del modelo Usuario."""

    def test_crear_usuario_con_rol_default(self):
        """El rol por defecto es 'Padre'."""
        user = Usuario.objects.create_user(
            cedula="test001",
            password="pass123",
            nombre_completo="Test User",
        )
        assert user.rol == "Padre"
        assert user.check_password("pass123")

    def test_cedula_unica(self):
        """No se pueden crear dos usuarios con la misma cédula."""
        Usuario.objects.create_user(cedula="dup001", password="p", nombre_completo="A")
        with pytest.raises(Exception):
            Usuario.objects.create_user(cedula="dup001", password="p", nombre_completo="B")

    def test_str_representation(self):
        """__str__ muestra nombre_completo (cedula)."""
        user = Usuario.objects.create_user(
            cedula="str001", password="p", nombre_completo="María López"
        )
        assert "María López" in str(user)
        assert "str001" in str(user)
