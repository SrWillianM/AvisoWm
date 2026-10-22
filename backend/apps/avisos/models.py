"""
App Avisos — Modelo aviso (general y específico por curso).
Trazabilidad: RF-03, RF-04, RF-07, RN-02, RN-03.
"""

from django.conf import settings
from django.db import models


class Aviso(models.Model):
    """
    Tabla `aviso` — avisos generales (id_curso NULL) y específicos (id_curso NOT NULL).
    Constraint CHECK: chk_aviso_alcance.
    """

    TIPO_CHOICES = [
        ("General", "General"),
        ("Especifico", "Específico"),
    ]

    id_aviso = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=150)
    contenido = models.TextField()
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    tipo_aviso = models.CharField(max_length=20, choices=TIPO_CHOICES)
    estado_activo = models.BooleanField(default=True)
    id_autor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        db_column="id_autor",
        related_name="avisos_publicados",
    )
    id_curso = models.ForeignKey(
        "cursos.CursoSeccion",
        on_delete=models.SET_NULL,
        db_column="id_curso",
        null=True,
        blank=True,
        related_name="avisos",
    )

    class Meta:
        db_table = "aviso"
        ordering = ["-fecha_publicacion"]
        verbose_name = "aviso"
        verbose_name_plural = "avisos"
        indexes = [
            models.Index(
                fields=["estado_activo", "tipo_aviso", "id_curso", "-fecha_publicacion"],
                name="idx_aviso_filtro_cartelera",
            ),
        ]

    def __str__(self):
        return f"[{self.tipo_aviso}] {self.titulo}"
