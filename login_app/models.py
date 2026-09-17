from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class UsuarioManager(UserManager):
    def create_user(self, cedula, password=None, **extra_fields):
        if not cedula:
            raise ValueError('La cédula de identidad es obligatoria.')
        user = self.model(cedula=cedula.strip(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, cedula, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(cedula, password, **extra_fields)


class Usuario(AbstractUser):
    class Rol(models.TextChoices):
        ADMINISTRADOR = 'ADMINISTRADOR', 'Administrador'
        DOCENTE = 'DOCENTE', 'Docente'
        PADRE_TUTOR = 'PADRE_TUTOR', 'Padre/Tutor'

    cedula = models.CharField(
        'cédula de identidad',
        max_length=20,
        primary_key=True,
        help_text='Identificador único del usuario, sin puntos ni guiones.',
    )
    username = None
    email = None
    rol = models.CharField(max_length=20, choices=Rol.choices)
    objects = UsuarioManager()

    USERNAME_FIELD = 'cedula'
    REQUIRED_FIELDS = []

    @property
    def id(self):
        return self.cedula

    def __str__(self):
        return self.cedula
