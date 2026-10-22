# 🏫 Sistema Web de Gestión de Avisos y Comunicación Institucional
## Proyecto de Grado — UNAE 2026 (Obligado, Itapúa, Paraguay)

> **Autor:** Willian Guillermo Medina Alvarenga  
> **Carrera:** Licenciatura en Análisis de Sistemas Informáticos  
> **Facultad:** Facultad de Ciencias, Artes y Tecnología (UNAE)  
> **Docente Evaluador:** Prof. Pedro Ramón Danieli Acuña  
> **Línea de Investigación (Res. CSU N.° 023/2020 CIDUNAE):** *Innovación, diseño y transferencia* / Sub-línea: *Análisis y diseño de sistemas informáticos*.

---

## 📌 Descripción del Sistema

Prototipo funcional (MVP) de aplicación web cliente-servidor desacoplada para centralizar, segmentar por grado/sección y consultar avisos oficiales de instituciones educativas en la ciudad de Obligado, reemplazando la dispersión, desinformación y vulnerabilidades de privacidad asociadas a grupos informales de mensajería instantánea.

### Stack Tecnológico Oficial
- **Frontend SPA:** React.js 18+ (Vite) + React Router v6 + Axios + CSS Modules con variables y transiciones de 150ms.
- **Backend API:** Python 3.11 + Django 5.x + Django REST Framework + SimpleJWT.
- **Base de Datos:** PostgreSQL 15+ estructurada en Tercera Forma Normal (**3FN** estricta, 6 tablas).
- **Seguridad:** Criptografía de contraseñas con PBKDF2 y HMAC-SHA-256 (`RNF-04`), autorización basada en roles RBAC (`RNF-05`).
- **Infraestructura:** Docker & Docker Compose (3 servicios: `db`, `backend`, `frontend` con Nginx reverse proxy).

---

## 🚀 Despliegue Rápido con Docker Compose

### 1. Clonar y configurar variables de entorno
```bash
cd avisos-obligado
cp .env.example .env
```

### 2. Construir e iniciar los contenedores
```bash
docker compose up --build -d
```

### 3. Aplicar migraciones y cargar datos de demostración
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py loaddata seed.json
```

### 4. Acceder al sistema
- **Aplicación Web (Frontend SPA):** [http://localhost](http://localhost)
- **API REST (Backend Django):** [http://localhost:8000/api/](http://localhost:8000/api/)
- **Documentación Interactiva OpenAPI (Swagger UI):** [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/)

---

## 👥 Credenciales de Demostración (Roles del Sistema)

| Rol | Cédula de Identidad | Contraseña | Perfil y Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador** | `1000001` | `Demo2026!` | Director institucional. Emite avisos Generales y Específicos, gestiona usuarios, cursos y soporte. |
| **Profesor** | `2000001` | `Demo2026!` | Docente. Emite y gestiona avisos Específicos para sus cursos asignados. |
| **Padre / Tutor** | `3000001` | `Demo2026!` | Consulta la cartelera segmentada por sus hijos vinculados y remite tickets de soporte. |

---

## 🧪 Ejecución de Pruebas Automatizadas

### Pruebas de Backend (pytest — Casos CP-01 a CP-14)
```bash
docker compose exec backend pytest -v
```

### Pruebas de Frontend (Vitest + Testing Library)
```bash
cd frontend
npm install
npm run test
```

---

## 📊 Matriz de Trazabilidad Técnica (MTR)

| Requisito / Regla | Componente Backend | Componente Frontend | Caso de Prueba |
| :--- | :--- | :--- | :--- |
| **RF-01** (Autenticación Cédula + JWT) | `apps/usuarios/views.py::LoginView` | `pages/Login/Login.jsx` | `CP-01` |
| **RF-02** (CRUD Usuarios y Cursos) | `apps/usuarios/`, `apps/cursos/` | `pages/AdminPanel/AdminPanel.jsx` | `CP-02` |
| **RF-03** / **RN-02** (Aviso General Admin) | `apps/avisos/serializers.py` | `pages/GestionAvisos/` | `CP-03` |
| **RF-04** / **RN-03** (Aviso Específico Curso) | `apps/avisos/views.py` | `pages/GestionAvisos/` | `CP-04` |
| **RF-05** / **RN-04** (Cartelera segmentada) | `apps/avisos/views.py::get_queryset` | `pages/Cartelera/Cartelera.jsx` | `CP-05` |
| **RF-06** / **RN-05** (Vínculo Padre-Curso) | `apps/cursos/views.py::PadreCurso` | `pages/Cartelera/ (Tabs)` | `CP-06` |
| **RF-07** (Edición y Baja Lógica) | `apps/avisos/views.py::AvisoDetailView` | `pages/GestionAvisos/` | `CP-07` |
| **RF-08** (Directorio Contactos) | `apps/directorio/views.py::Contacto` | `pages/Directorio/` | `CP-08` |
| **RF-09** / **RN-06** (Reportes Soporte) | `apps/directorio/views.py::Soporte` | `pages/Directorio/` | `CP-09` |
| **RNF-01** (Rendimiento < 2.0s) | `idx_aviso_filtro_cartelera` en PostgreSQL | SPA Vite optimizada | `CP-10` |
| **RNF-02** (Usabilidad ≤ 3 clics) | Enrutamiento directo | Navbar reactivo | `CP-11` |
| **RNF-03** (Diseño Responsive) | REST API JSON | CSS Mobile-First (360px - 1920px) | `CP-12` |
| **RNF-04** (Seguridad PBKDF2) | `PASSWORD_HASHERS` en `settings.py` | — | `CP-13` |
| **RNF-05** (Autorización RBAC) | `EsAdministrador`, `EsAutorOAdmin` | `ProtectedRoute.jsx` | `CP-14` |

---

## 🔒 Alcance Estricto del Proyecto
Este sistema es un prototipo oficial validado por la cátedra de Proyecto de Grado UNAE. Taxativamente no incluye módulos superfluos (no contiene chats libres, videollamadas, cobros/aranceles ni legajos reservados de menores), garantizando una arquitectura concisa, segura y auditable.
