"""URLs — /api/avisos/."""

from django.urls import path

from .views import AvisoDetailView, AvisoListCreateView

urlpatterns = [
    path("", AvisoListCreateView.as_view(), name="aviso-list-create"),
    path("<int:id_aviso>/", AvisoDetailView.as_view(), name="aviso-detail"),
]
