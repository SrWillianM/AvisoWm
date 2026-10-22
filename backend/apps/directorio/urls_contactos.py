"""URLs — /api/contactos/."""

from django.urls import path

from .views import ContactoDetailView, ContactoListCreateView

urlpatterns = [
    path("", ContactoListCreateView.as_view(), name="contacto-list-create"),
    path("<int:id_contacto>/", ContactoDetailView.as_view(), name="contacto-detail"),
]
