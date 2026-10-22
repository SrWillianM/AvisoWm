"""
Serializers — App Cursos.
"""

from rest_framework import serializers

from .models import CursoSeccion, PadreCurso


class CursoSeccionSerializer(serializers.ModelSerializer):
    """Serializer del catálogo de cursos/secciones."""

    class Meta:
        model = CursoSeccion
        fields = ["id_curso", "grado_curso", "seccion", "turno", "nivel_educativo"]


class PadreCursoSerializer(serializers.ModelSerializer):
    """Serializer de vínculo padre-curso."""

    curso_detalle = CursoSeccionSerializer(source="id_curso", read_only=True)

    class Meta:
        model = PadreCurso
        fields = ["id_padre_curso", "id_usuario", "id_curso", "nombre_hijo", "curso_detalle"]
        read_only_fields = ["id_padre_curso", "id_usuario"]
