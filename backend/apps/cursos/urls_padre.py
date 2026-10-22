"""URLs — /api/mis-cursos/ (vínculos padre-curso)."""

from django.urls import path

from .views import PadreCursoDeleteView, PadreCursoListCreateView

urlpatterns = [
    path("", PadreCursoListCreateView.as_view(), name="padre-curso-list-create"),
    path("<int:id_padre_curso>/", PadreCursoDeleteView.as_view(), name="padre-curso-delete"),
]
