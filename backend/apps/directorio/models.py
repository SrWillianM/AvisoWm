"""
App Directorio — Modelos contacto_util y reporte_soporte.
Trazabilidad: RF-08, RF-09, RN-06.
"""

from django.conf import settings
from django.db import models


class ContactoUtil(models.Model):
    """Tabla `contacto_util` — directorio institucional de contactos."""

    id_contacto = models.AutoField(primary_key=True)
    departamento = models.CharField(max_length=80)
    nombre_encargado = models.CharField(max_length=100)
    telefono = models.CharField(max_length=30)
    correo_contacto = models.EmailField(max_length=100, blank=True, null=True)
    horario_atencion = models.CharField(max_length=80)

    class Meta:
        db_table = "contacto_util"
        verbose_name = "contacto útil"
        verbose_name_plural = "contactos útiles"

    def __str__(self):
        return f"{self.departamento} — {self.nombre_encargado}"


class ReporteSoporte(models.Model):
    """Tabla `reporte_soporte` — tickets de soporte técnico con flujo de estados."""

    ESTADO_CHOICES = [
        ("Pendiente", "Pendiente"),
        ("En_Revision", "En Revisión"),
        ("Resuelto", "Resuelto"),
    ]

    id_reporte = models.AutoField(primary_key=True)
    asunto = models.CharField(max_length=120)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default="Pendiente")
    id_usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column="id_usuario",
        related_name="reportes",
    )

    class Meta:
        db_table = "reporte_soporte"
        ordering = ["-fecha_envio"]
        verbose_name = "reporte de soporte"
        verbose_name_plural = "reportes de soporte"

    def __str__(self):
        return f"[{self.estado}] {self.asunto}"
