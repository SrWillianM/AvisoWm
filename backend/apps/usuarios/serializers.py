"""
Serializers — App Usuarios.
"""

from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import Usuario


class LoginSerializer(serializers.Serializer):
    """Serializer para login con cédula + contraseña → JWT."""

    cedula = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        cedula = attrs.get("cedula")
        password = attrs.get("password")
        user = authenticate(username=cedula, password=password)
        if not user:
            raise serializers.ValidationError("Cédula o contraseña incorrecta.")
        if not user.is_active:
            raise serializers.ValidationError("La cuenta está desactivada.")
        attrs["user"] = user
        return attrs


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer completo de Usuario para CRUD administrativo."""

    password = serializers.CharField(write_only=True, required=False, min_length=6)

    class Meta:
        model = Usuario
        fields = [
            "id_usuario",
            "nombre_completo",
            "cedula",
            "correo",
            "rol",
            "fecha_registro",
            "password",
        ]
        read_only_fields = ["id_usuario", "fecha_registro"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UsuarioLiteSerializer(serializers.ModelSerializer):
    """Serializer reducido para embeber en respuestas de avisos, etc."""

    class Meta:
        model = Usuario
        fields = ["id_usuario", "nombre_completo", "rol"]
