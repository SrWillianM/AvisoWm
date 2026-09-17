from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('cedula', 'first_name', 'last_name', 'rol', 'is_active')
    list_filter = ('rol', 'is_active', 'is_staff')
    ordering = ('cedula',)
    search_fields = ('cedula', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('cedula', 'password')}),
        ('Información personal', {
            'fields': ('first_name', 'last_name', 'rol'),
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups',
                       'user_permissions'),
        }),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('cedula', 'rol', 'password1', 'password2'),
        }),
    )
