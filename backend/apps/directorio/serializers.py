"""
Serializers — App Directorio.
"""

from rest_framework import serializers

from .models import ContactoUtil, ReporteSoporte


class ContactoUtilSerializer(serializers.ModelSerializer):
    """Serializer del directorio institucional de contactos."""

    class Meta:
        model = ContactoUtil
        fields = [
            "id_contacto",
            "departamento",
            "nombre_encargado",
            "telefono",
            "correo_contacto",
            "horario_atencion",
        ]


class ReporteSoporteSerializer(serializers.ModelSerializer):
    """Serializer de tickets de soporte."""

    usuario_nombre = serializers.CharField(
        source="id_usuario.nombre_completo", read_only=True
    )

    class Meta:
        model = ReporteSoporte
        fields = [
            "id_reporte",
            "asunto",
            "mensaje",
            "fecha_envio",
            "estado",
            "id_usuario",
            "usuario_nombre",
        ]
        read_only_fields = ["id_reporte", "fecha_envio", "id_usuario"]
