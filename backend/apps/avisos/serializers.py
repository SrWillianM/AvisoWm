"""
Serializers — App Avisos.
Validación de reglas de negocio RN-02 y RN-03, y serialización para la API REST.
"""

from rest_framework import serializers

from apps.usuarios.serializers import UsuarioLiteSerializer

from .models import Aviso


class AvisoSerializer(serializers.ModelSerializer):
    """
    Serializer de Avisos Institucionales:
    - Transforma las instancias del modelo Aviso a JSON y viceversa.
    - Valida de forma estricta las reglas de negocio RN-02 y RN-03 en el método `validate()`.
    - Protege campos inmutables como `id_aviso`, `fecha_publicacion` y `id_autor`.
    """

    # Representación anidada del autor para mostrar nombre completo y rol sin exponer credenciales
    autor = UsuarioLiteSerializer(source="id_autor", read_only=True)
    
    # Campo computado que devuelve el grado, sección y turno como texto amigable
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
        # Campos de solo lectura para evitar que el cliente manipule el autor o la fecha
        read_only_fields = ["id_aviso", "fecha_publicacion", "id_autor"]

    def get_curso_nombre(self, obj):
        """Devuelve la representación textual del curso si está asignado."""
        if obj.id_curso:
            return str(obj.id_curso)
        return None

    def validate(self, attrs):
        """
        Validaciones de Dominio y Reglas de Negocio Institucionales:
        - RN-02: Aviso 'General' → Exclusivo de Administradores, id_curso debe ser NULL.
        - RN-03: Aviso 'Especifico' → Requiere obligatoriamente un curso válido.
        - RBAC: Los tutores (Padre) no pueden emitir ningún comunicado.
        """
        request = self.context.get("request")
        tipo = attrs.get("tipo_aviso", getattr(self.instance, "tipo_aviso", None))
        id_curso = attrs.get("id_curso", getattr(self.instance, "id_curso", None))

        # Defensa en profundidad: Bloquear cualquier intento de publicación si el rol es Padre
        if request and request.user.rol == "Padre":
            raise serializers.ValidationError(
                {"detail": "Los tutores no tienen permisos para publicar comunicados."}
            )

        # Regla RN-02: General exclusivo para Administradores
        if tipo == "General":
            if request and request.user.rol != "Administrador":
                raise serializers.ValidationError(
                    {"tipo_aviso": "Solo los administradores pueden publicar avisos generales."}
                )
            # Garantiza que en la base de datos id_curso sea NULL para avisos generales
            attrs["id_curso"] = None

        # Regla RN-03: Específico requiere forzosamente un curso asignado
        elif tipo == "Especifico":
            if not id_curso:
                raise serializers.ValidationError(
                    {"id_curso": "Los avisos específicos requieren asignar un curso/sección válido."}
                )

        return attrs
