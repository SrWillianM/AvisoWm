"""URLs — /api/cursos/."""

from django.urls import path

from .views import CursoDetailView, CursoListCreateView

urlpatterns = [
    path("", CursoListCreateView.as_view(), name="curso-list-create"),
    path("<int:id_curso>/", CursoDetailView.as_view(), name="curso-detail"),
]
