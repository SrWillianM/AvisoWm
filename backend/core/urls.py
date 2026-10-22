"""
Core URL configuration.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # API
    path("api/auth/", include("apps.usuarios.urls_auth")),
    path("api/usuarios/", include("apps.usuarios.urls")),
    path("api/cursos/", include("apps.cursos.urls")),
    path("api/avisos/", include("apps.avisos.urls")),
    path("api/mis-cursos/", include("apps.cursos.urls_padre")),
    path("api/contactos/", include("apps.directorio.urls_contactos")),
    path("api/soporte/", include("apps.directorio.urls_soporte")),
    # OpenAPI schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]
