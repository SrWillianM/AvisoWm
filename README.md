# Prototipo de Sistema Web para Gestión de Avisos Institucionales

## Objetivo del Proyecto
El objetivo de este proyecto es diseñar y desarrollar un prototipo de sistema web centralizado para la gestión de avisos y comunicación en instituciones educativas de la ciudad de Obligado (2026). Busca resolver la ineficiencia, pérdida de información y desorganización causada por el uso de canales informales (como redes sociales), garantizando la trazabilidad de los comunicados oficiales.

## Entorno de Programación y Tecnologías (Stack)
Este proyecto se desarrolla bajo un entorno orquestado con contenedores para garantizar la portabilidad y escalabilidad:

* **Lenguaje de Programación (Backend):** Python 3.11
* **Framework Backend:** Django
* **Frontend:** React.js (JavaScript / HTML5 / CSS3)
* **Base de Datos:** PostgreSQL 15 (Relacional)
* **IDE (Entorno de Desarrollo):** Visual Studio Code (con extensiones de Docker y Dev Containers)
* **Infraestructura y Despliegue:** Docker y Docker Compose (Gestión de contenedores)
* **Control de Versiones:** Git / GitHub

## Puesta en marcha local

## Organización de carpetas

```text
servidorDocker/
|-- config/                 Configuración, URLs y servidores Django
|-- login_app/              Usuario personalizado y API de login
|   `-- migrations/         Migraciones administradas por Django
|-- Dockerfile              Imagen del backend
|-- docker-compose.yml      Django, PostgreSQL y pgAdmin
|-- requirements.txt        Dependencias Python
|-- .env                    Variables locales, no se versiona
|-- .env.example            Plantilla de variables
`-- *.md                    Documentación del TFG
```

`script_usuarios.sql` no forma parte del proyecto porque el modelo `Usuario`
y sus migraciones crean y mantienen la tabla correctamente.

Los comandos siguientes se ejecutan desde `C:\servidorDocker` en PowerShell.

1. Copia `.env.example` como `.env` si todavía no existe. El archivo `.env` contiene valores de desarrollo y no debe subirse a Git.
2. Construye la imagen del backend:

	```powershell
	docker compose build web
	```

3. Inicializa Django dentro del volumen compartido con Windows:

	```powershell
	docker compose run --rm web django-admin startproject config .
	docker compose run --rm web python manage.py startapp login_app
	```

	En este repositorio `config` y `login_app` ya fueron creados. No repitas esos comandos sobre una instalación existente.

4. Levanta PostgreSQL, pgAdmin y Django:

	```powershell
	docker compose up -d
	```

	- Django: `http://localhost:8000`
	- pgAdmin: `http://localhost:5050`
	- PostgreSQL desde otro contenedor: host `db`, puerto `5432`

5. Después de cambiar modelos, genera y aplica migraciones:

	```powershell
	docker compose exec web python manage.py makemigrations
	docker compose exec web python manage.py migrate
	```

6. Crea un usuario administrador cuando sea necesario:

	```powershell
	docker compose exec web python manage.py createsuperuser
	```

El endpoint inicial de autenticación es `POST /api/auth/login/` y recibe un JSON como `{"correo":"usuario@example.com","password":"..."}`. Las contraseñas nuevas se almacenan mediante `BCryptSHA256PasswordHasher`; nunca se guarda la contraseña en texto plano.

## Probar el login sin React

Todavía no existe una pantalla visual porque el frontend React se agregará en
el siguiente paso. El backend se puede probar desde PowerShell con un usuario
creado mediante Django:

```powershell
docker compose exec web python manage.py createsuperuser
```

Luego envía una petición `POST` desde Postman, Insomnia o Thunder Client a
`http://localhost:8000/api/auth/login/`, con `Content-Type: application/json`:

```json
{
	"correo": "tu-correo@example.com",
	"password": "TuContraseña"
}
```

La respuesta `200` confirma el inicio de sesión. Una respuesta `401` indica
que el correo o la contraseña no coinciden.

## Configurar PostgreSQL en pgAdmin

Abre `http://localhost:5050` y entra con los valores de `.env`:

```text
Correo: PGADMIN_EMAIL
Contraseña: PGADMIN_PASSWORD
```

En pgAdmin selecciona `Register > Server` y configura:

```text
Nombre: TFG local
Host name/address: db
Port: 5432
Maintenance database: tfg_educativo
Username: tfg_user
Password: tfg_password
```

El host `db` funciona desde pgAdmin porque ambos servicios están en la red de
Docker. Desde Windows usarías `localhost` y el puerto `5432`.

La base de datos se administra mediante modelos y migraciones, no creando
tablas manualmente en pgAdmin:

```powershell
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

Antes de cambios importantes puedes crear un respaldo desde PowerShell:

```powershell
docker compose exec -T db pg_dump -U tfg_user -d tfg_educativo > respaldo_tfg.sql
```

Para restaurar un respaldo en una base local vacía:

```powershell
Get-Content .\respaldo_tfg.sql | docker compose exec -T db psql -U tfg_user -d tfg_educativo
```

No ejecutes `docker compose down -v` salvo que quieras borrar también el
volumen `postgres_data` y todos los datos de desarrollo.