from django.urls import path

from .views import api_iniciar_sesion, pagina_login

urlpatterns = [
    path('', pagina_login, name='login_page'),
    path('login/', api_iniciar_sesion, name='login'),
]
