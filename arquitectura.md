# Arquitectura del Software

Para este prototipo de trabajo final de grado, se ha seleccionado una **Arquitectura Cliente-Servidor Desacoplada**, separando claramente la capa de presentación de la capa lógica y de datos. 

## Estructura de Componentes

1. **Frontend (Capa de Presentación / Cliente):**
   * Desarrollada con React.
   * Se encarga de la Interfaz de Usuario (UI) y la experiencia de usuario (UX). Se comunicará con el backend exclusivamente a través de peticiones HTTP consumiendo una API REST.

2. **Backend (Capa de Lógica de Negocio / Servidor):**
   * Desarrollada con Django (Python).
   * Utiliza el patrón arquitectónico interno MVT (Model-View-Template) adaptado para funcionar como una API.
   * Gestiona la autenticación segura (Login), el control de roles (Administrador, Docente, Tutor) y las reglas de negocio de segmentación de avisos.

3. **Base de Datos (Capa de Persistencia):**
   * Motor relacional PostgreSQL.
   * Almacena de forma centralizada y segura los registros de usuarios, contraseñas encriptadas (bcrypt), grados, secciones y el historial de avisos.

4. **Orquestación (Entorno):**
   * Todo el ecosistema (Servidor Web + Base de Datos + Interfaz Gráfica de BD) corre sobre contenedores aislados de **Docker**, comunicándose internamente a través de una red virtual configurada en `docker-compose.yml`.