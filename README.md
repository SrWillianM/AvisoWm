# AvisoWm

Prototipo de sistema web para gestionar avisos y comunicación en instituciones educativas de la ciudad de Obligado.

## Tecnologías

- Python 3.11 y Django
- PostgreSQL 16
- Docker Compose
- HTML, CSS y JavaScript para el prototipo visual actual
- React previsto para la siguiente etapa

## Ejecutar el proyecto

Desde `C:\servidorDocker`:

```powershell
docker compose up -d --build
docker compose exec web python manage.py migrate
```

Abrir el login en <http://localhost:8000/>.

Panel administrativo: <http://localhost:8000/admin/>.

pgAdmin: <http://localhost:5050/>.

## Autenticación

El usuario inicia sesión con su cédula de identidad y contraseña. La cédula es única y funciona como clave primaria del usuario. Las contraseñas se almacenan mediante el sistema de hash bcrypt de Django.

Endpoint de login:

```text
POST /api/auth/login/
```

```json
{
  "cedula": "1234567",
  "password": "TuContraseña"
}
```

Roles iniciales: Administrador, Docente y Padre/Tutor.

## Desarrollo

Después de modificar modelos:

```powershell
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

La configuración local está en `.env`, que no se sube al repositorio.
