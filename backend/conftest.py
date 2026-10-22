"""
conftest.py — Fixtures globales para pytest-django.
Cubre los 3 roles del RBAC y clientes autenticados.
"""

import pytest
from rest_framework.test import APIClient

from apps.cursos.models import CursoSeccion, PadreCurso
from apps.usuarios.models import Usuario


@pytest.fixture
def api_client():
    """Cliente API sin autenticar."""
    return APIClient()


@pytest.fixture
def admin_user(db):
    """Usuario con rol Administrador."""
    return Usuario.objects.create_user(
        cedula="admin001",
        password="TestPass2026!",
        nombre_completo="Admin Demo",
        correo="admin@test.com",
        rol="Administrador",
    )


@pytest.fixture
def profesor_user(db):
    """Usuario con rol Profesor."""
    return Usuario.objects.create_user(
        cedula="prof001",
        password="TestPass2026!",
        nombre_completo="Profesor Demo",
        correo="prof@test.com",
        rol="Profesor",
    )


@pytest.fixture
def padre_user(db):
    """Usuario con rol Padre."""
    return Usuario.objects.create_user(
        cedula="padre001",
        password="TestPass2026!",
        nombre_completo="Padre Demo",
        correo="padre@test.com",
        rol="Padre",
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    """Cliente API autenticado como Administrador."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def profesor_client(api_client, profesor_user):
    """Cliente API autenticado como Profesor."""
    client = APIClient()
    client.force_authenticate(user=profesor_user)
    return client


@pytest.fixture
def padre_client(api_client, padre_user):
    """Cliente API autenticado como Padre."""
    client = APIClient()
    client.force_authenticate(user=padre_user)
    return client


@pytest.fixture
def curso_sample(db):
    """Curso de ejemplo: 3.° Grado A — Mañana — EEB."""
    return CursoSeccion.objects.create(
        grado_curso="3.° Grado",
        seccion="A",
        turno="Mañana",
        nivel_educativo="EEB",
    )


@pytest.fixture
def curso_sample_b(db):
    """Segundo curso de ejemplo: 6.° Grado B."""
    return CursoSeccion.objects.create(
        grado_curso="6.° Grado",
        seccion="B",
        turno="Tarde",
        nivel_educativo="EEB",
    )


@pytest.fixture
def padre_vinculado(padre_user, curso_sample):
    """Padre vinculado a curso_sample con nombre_hijo."""
    return PadreCurso.objects.create(
        id_usuario=padre_user,
        id_curso=curso_sample,
        nombre_hijo="Juan Demo",
    )
