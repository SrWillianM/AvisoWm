"""
Serializers — App Avisos.
"""

from rest_framework import serializers

from apps.usuarios.serializers import UsuarioLiteSerializer

from .models import Aviso


class AvisoSerializer(serializers.ModelSerializer):
    """Serializer completo para crear/editar avisos con validación de RN-02/RN-03."""

    autor = UsuarioLiteSerializer(source="id_autor", read_only=True)
    curso_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Aviso
        fields = [
            "id_aviso",
            "titulo",
            "contenido",
            "fecha_publicacion",
            "tipo_aviso",
            "estado_activo",
            "id_autor",
            "id_curso",
            "autor",
            "curso_nombre",
        ]
        read_only_fields = ["id_aviso", "fecha_publicacion", "id_autor"]

    def get_curso_nombre(self, obj):
        if obj.id_curso:
            return str(obj.id_curso)
        return None

    def validate(self, attrs):
        """
        RN-02: tipo_aviso='General' requiere rol Administrador, id_curso=None.
        RN-03: tipo_aviso='Especifico' requiere id_curso no nulo.
        """
        request = self.context.get("request")
        tipo = attrs.get("tipo_aviso", getattr(self.instance, "tipo_aviso", None))
        id_curso = attrs.get("id_curso", getattr(self.instance, "id_curso", None))

        if tipo == "General":
            if request and request.user.rol != "Administrador":
                raise serializers.ValidationError(
                    {"tipo_aviso": "Solo los administradores pueden publicar avisos generales."}
                )
            # Forzar id_curso nulo para avisos generales
            attrs["id_curso"] = None

        elif tipo == "Especifico":
            if not id_curso:
                raise serializers.ValidationError(
                    {"id_curso": "Los avisos específicos requieren un curso/sección."}
                )

        return attrs
