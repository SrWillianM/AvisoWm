"""
App Usuarios — Modelo personalizado de usuario con autenticación por cédula.
Trazabilidad: RF-01, RF-02, RN-01, RNF-04, RNF-05.
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UsuarioManager(BaseUserManager):
    """Manager personalizado: crea usuarios autenticables por cédula."""

    def create_user(self, cedula, password=None, **extra_fields):
        if not cedula:
            raise ValueError("La cédula es obligatoria.")
        extra_fields.setdefault("rol", "Padre")
        user = self.model(cedula=cedula, **extra_fields)
        user.set_password(password)  # PBKDF2/SHA-256 (RNF-04)
        user.save(using=self._db)
        return user

    def create_superuser(self, cedula, password=None, **extra_fields):
        extra_fields.setdefault("rol", "Administrador")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(cedula, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo `usuario` — DDL: id_usuario, nombre_completo, cedula,
    correo, contrasena_hash (campo `password`), rol, fecha_registro.
    """

    ROL_CHOICES = [
        ("Administrador", "Administrador"),
        ("Profesor", "Profesor"),
        ("Padre", "Padre"),
    ]

    id_usuario = models.AutoField(primary_key=True)
    nombre_completo = models.CharField(max_length=120)
    cedula = models.CharField(max_length=20, unique=True)
    correo = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default="Padre")
    fecha_registro = models.DateTimeField(auto_now_add=True)

    # Campos requeridos por AbstractBaseUser
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    USERNAME_FIELD = "cedula"
    REQUIRED_FIELDS = ["nombre_completo"]

    class Meta:
        db_table = "usuario"
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    @property
    def id(self):
        return self.id_usuario

    def __str__(self):
        return f"{self.nombre_completo} ({self.cedula})"
