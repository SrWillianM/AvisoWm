"""
Tests de Usuarios — CP-01 (Autenticación) y CP-02 (CRUD Usuarios).
CP-13 (PBKDF2 hash) y CP-14 (RBAC HTTP 403).
"""

import pytest
from django.urls import reverse
from rest_framework import status

from apps.usuarios.models import Usuario


# ===========================================================================
# CP-01: Autenticación (RF-01)
# ===========================================================================

@pytest.mark.django_db
class TestCP01Autenticacion:
    """CP-01: Login con cédula + contraseña → JWT."""

    url = reverse("auth-login")

    def test_login_exitoso_retorna_jwt(self, api_client, admin_user):
        """Login con credenciales válidas retorna access + refresh tokens."""
        response = api_client.post(
            self.url,
            {"cedula": "admin001", "password": "TestPass2026!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access" in data
        assert "refresh" in data
        assert data["user"]["id_usuario"] == admin_user.id_usuario
        assert data["user"]["rol"] == "Administrador"

    def test_login_credenciales_invalidas(self, api_client, admin_user):
        """Login con contraseña incorrecta retorna HTTP 400."""
        response = api_client.post(
            self.url,
            {"cedula": "admin001", "password": "wrongpass"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_cedula_inexistente(self, api_client):
        """Login con cédula que no existe retorna HTTP 400."""
        response = api_client.post(
            self.url,
            {"cedula": "99999999", "password": "anything"},
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ===========================================================================
# CP-02: CRUD Usuarios (RF-02)
# ===========================================================================

@pytest.mark.django_db
class TestCP02CRUDUsuarios:
    """CP-02: Solo Admin puede crear/editar/eliminar usuarios."""

    url = reverse("usuario-list-create")

    def test_admin_crea_usuario(self, admin_client):
        """Admin crea un nuevo usuario → HTTP 201."""
        response = admin_client.post(
            self.url,
            {
                "nombre_completo": "Nuevo Profesor",
                "cedula": "nuevo001",
                "correo": "nuevo@test.com",
                "rol": "Profesor",
                "password": "NuevaPass1!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Usuario.objects.filter(cedula="nuevo001").exists()

    def test_profesor_no_puede_crear_usuario(self, profesor_client):
        """Profesor intenta crear usuario → HTTP 403 (RBAC)."""
        response = profesor_client.post(
            self.url,
            {
                "nombre_completo": "Intruso",
                "cedula": "intruso001",
                "rol": "Padre",
                "password": "Hack123!",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_padre_no_puede_listar_usuarios(self, padre_client):
        """Padre intenta listar usuarios → HTTP 403 (RBAC)."""
        response = padre_client.get(self.url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_edita_usuario(self, admin_client, profesor_user):
        """Admin edita nombre de un usuario → HTTP 200."""
        url = reverse("usuario-detail", kwargs={"id_usuario": profesor_user.id_usuario})
        response = admin_client.patch(
            url,
            {"nombre_completo": "Profesor Editado"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        profesor_user.refresh_from_db()
        assert profesor_user.nombre_completo == "Profesor Editado"


# ===========================================================================
# CP-13: Seguridad PBKDF2 (RNF-04)
# ===========================================================================

@pytest.mark.django_db
class TestCP13PBKDF2:
    """CP-13: Hash en DB usa PBKDF2 SHA-256."""

    def test_password_hash_usa_pbkdf2(self, admin_user):
        """El hash almacenado comienza con 'pbkdf2_sha256$'."""
        assert admin_user.password.startswith("pbkdf2_sha256$")


# ===========================================================================
# CP-14: RBAC HTTP 403 (RNF-05) — parcial, complementado en otros test files
# ===========================================================================

@pytest.mark.django_db
class TestCP14RBAC:
    """CP-14: Endpoints protegidos rechazan roles no autorizados."""

    def test_endpoint_usuarios_sin_auth(self, api_client):
        """Sin autenticación → HTTP 401."""
        response = api_client.get(reverse("usuario-list-create"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_endpoint_usuarios_rol_padre(self, padre_client):
        """Padre → HTTP 403 en endpoint de admin."""
        response = padre_client.get(reverse("usuario-list-create"))
        assert response.status_code == status.HTTP_403_FORBIDDEN
