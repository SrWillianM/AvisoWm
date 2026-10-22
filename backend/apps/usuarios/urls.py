"""URLs de gestión de usuarios — /api/usuarios/."""

from django.urls import path

from .views import UsuarioDetailView, UsuarioListCreateView

urlpatterns = [
    path("", UsuarioListCreateView.as_view(), name="usuario-list-create"),
    path("<int:id_usuario>/", UsuarioDetailView.as_view(), name="usuario-detail"),
]
