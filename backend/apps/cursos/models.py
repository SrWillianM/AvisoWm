"""
App Cursos — Modelos curso_seccion y padre_curso.
Trazabilidad: RF-02, RF-05, RF-06, RN-04, RN-05.
"""

from django.conf import settings
from django.db import models


class CursoSeccion(models.Model):
    """Tabla `curso_seccion` — catálogo de grados y secciones."""

    TURNO_CHOICES = [
        ("Mañana", "Mañana"),
        ("Tarde", "Tarde"),
        ("Noche", "Noche"),
    ]
    NIVEL_CHOICES = [
        ("EEB", "Educación Escolar Básica"),
        ("EM", "Educación Media"),
    ]

    id_curso = models.AutoField(primary_key=True)
    grado_curso = models.CharField(max_length=40)
    seccion = models.CharField(max_length=15, default="A")
    turno = models.CharField(max_length=20, choices=TURNO_CHOICES, default="Mañana")
    nivel_educativo = models.CharField(max_length=40, choices=NIVEL_CHOICES, default="EEB")

    class Meta:
        db_table = "curso_seccion"
        verbose_name = "curso / sección"
        verbose_name_plural = "cursos / secciones"

    def __str__(self):
        return f"{self.grado_curso} {self.seccion} — {self.turno}"


class PadreCurso(models.Model):
    """Tabla `padre_curso` — vinculación padre-curso con etiqueta del hijo."""

    id_padre_curso = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="id_usuario",
        related_name="vinculos_curso",
    )
    id_curso = models.ForeignKey(
        CursoSeccion,
        on_delete=models.CASCADE,
        db_column="id_curso",
        related_name="padres_vinculados",
    )
    nombre_hijo = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "padre_curso"
        verbose_name = "vínculo padre-curso"
        verbose_name_plural = "vínculos padre-curso"
        ordering = ["id_padre_curso"]
        constraints = [
            models.UniqueConstraint(
                fields=["id_usuario", "id_curso", "nombre_hijo"],
                name="unique_padre_curso_hijo",
            )
        ]

    def __str__(self):
        return f"{self.id_usuario} → {self.id_curso} ({self.nombre_hijo})"
