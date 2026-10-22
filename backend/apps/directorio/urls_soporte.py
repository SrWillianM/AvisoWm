"""URLs — /api/soporte/."""

from django.urls import path

from .views import SoporteDetailView, SoporteListCreateView

urlpatterns = [
    path("", SoporteListCreateView.as_view(), name="soporte-list-create"),
    path("<int:id_reporte>/", SoporteDetailView.as_view(), name="soporte-detail"),
]
