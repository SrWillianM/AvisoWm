import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import BadgeRol from '../../components/BadgeRol';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const [tabActiva, setTabActiva] = useState('usuarios'); // 'usuarios' | 'cursos'
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Form nuevo usuario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('Padre');
  const [password, setPassword] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);

  // Form nuevo curso
  const [gradoCurso, setGradoCurso] = useState('');
  const [seccion, setSeccion] = useState('A');
  const [turno, setTurno] = useState('Mañana');
  const [nivelEducativo, setNivelEducativo] = useState('EEB');
  const [showCursoForm, setShowCursoForm] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [uRes, cRes] = await Promise.all([
        client.get('/usuarios/'),
        client.get('/cursos/'),
      ]);
      setUsuarios(uRes.data.results || uRes.data);
      setCursos(cRes.data.results || cRes.data);
    } catch {
      setFeedback({ text: 'Error al sincronizar con el backend.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/usuarios/', {
        nombre_completo: nombreCompleto,
        cedula,
        correo: correo || null,
        rol,
        password,
      });
      setUsuarios((prev) => [data, ...prev]);
      setFeedback({ text: `Usuario ${data.nombre_completo} creado con éxito.`, type: 'success' });
      setShowUserForm(false);
      setNombreCompleto('');
      setCedula('');
      setCorreo('');
      setPassword('');
      setRol('Padre');
    } catch (err) {
      const msg =
        err.response?.data?.cedula?.[0] ||
        err.response?.data?.correo?.[0] ||
        err.response?.data?.detail ||
        'Error al crear usuario.';
      setFeedback({ text: msg, type: 'error' });
    }
  };

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/cursos/', {
        grado_curso: gradoCurso,
        seccion,
        turno,
        nivel_educativo: nivelEducativo,
      });
      setCursos((prev) => [...prev, data]);
      setFeedback({ text: `Curso "${data.grado_curso} ${data.seccion}" registrado.`, type: 'success' });
      setShowCursoForm(false);
      setGradoCurso('');
      setSeccion('A');
      setTurno('Mañana');
      setNivelEducativo('EEB');
    } catch {
      setFeedback({ text: 'Error al dar de alta el curso.', type: 'error' });
    }
  };

  const handleEliminarUsuario = async (idUsuario, nombre) => {
    if (!window.confirm(`¿Seguro que desea eliminar al usuario ${nombre}?`)) return;
    try {
      await client.delete(`/usuarios/${idUsuario}/`);
      setUsuarios((prev) => prev.filter((u) => u.id_usuario !== idUsuario));
      setFeedback({ text: `Usuario ${nombre} eliminado.`, type: 'success' });
    } catch (err) {
      setFeedback({
        text: err.response?.data?.detail || 'No se pudo eliminar el usuario.',
        type: 'error',
      });
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">⚙ Panel de Administración Central</h1>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.text}
        </div>
      )}

      {/* Tabs Usuarios vs Cursos */}
      <div className="tabs">
        <button
          className={`tab ${tabActiva === 'usuarios' ? 'active' : ''}`}
          onClick={() => setTabActiva('usuarios')}
        >
          Usuarios & Roles ({usuarios.length})
        </button>
        <button
          className={`tab ${tabActiva === 'cursos' ? 'active' : ''}`}
          onClick={() => setTabActiva('cursos')}
        >
          Catálogo Cursos ({cursos.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : tabActiva === 'usuarios' ? (
        /* PESTAÑA 1: GESTIÓN DE USUARIOS */
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="page-subtitle" style={{ margin: 0 }}>Cuentas de Usuarios Institucionales</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowUserForm(!showUserForm)}
            >
              {showUserForm ? 'Cancelar' : '+ Registrar Usuario'}
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCrearUsuario} className={`card ${styles.formCard}`}>
              <h3 className="text-sm font-semibold mb-4">Alta de Usuario (RBAC)</h3>
              <div className={styles.grid2}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    className="form-input"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej: Lic. Pedro Danieli"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cédula de Identidad (Login)</label>
                  <input
                    className="form-input"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej: 4567890"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ej: usuario@colegio.edu.py"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rol del Sistema</label>
                  <select
                    className="form-input"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="Padre">Padre / Tutor</option>
                    <option value="Profesor">Profesor</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña Inicial (PBKDF2 SHA-256)</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">Guardar Usuario</button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowUserForm(false)}
                >
                  Cerrar
                </button>
              </div>
            </form>
          )}

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Cédula</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Fecha Alta</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td><strong>{u.nombre_completo}</strong></td>
                    <td className="text-sm">{u.cedula}</td>
                    <td className="text-sm text-muted">{u.correo || '—'}</td>
                    <td><BadgeRol rol={u.rol} /></td>
                    <td className="text-xs text-muted">
                      {new Date(u.fecha_registro).toLocaleDateString('es-PY')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleEliminarUsuario(u.id_usuario, u.nombre_completo)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* PESTAÑA 2: CATÁLOGO DE CURSOS Y SECCIONES */
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="page-subtitle" style={{ margin: 0 }}>Catálogo de Cursos y Secciones</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCursoForm(!showCursoForm)}
            >
              {showCursoForm ? 'Cancelar' : '+ Agregar Curso'}
            </button>
          </div>

          {showCursoForm && (
            <form onSubmit={handleCrearCurso} className={`card ${styles.formCard}`}>
              <h3 className="text-sm font-semibold mb-4">Alta de Curso</h3>
              <div className={styles.grid2}>
                <div className="form-group">
                  <label className="form-label">Grado / Curso</label>
                  <input
                    className="form-input"
                    value={gradoCurso}
                    onChange={(e) => setGradoCurso(e.target.value)}
                    placeholder="Ej: 1.° Año Bachillerato"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sección</label>
                  <input
                    className="form-input"
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value)}
                    placeholder="Ej: A, B o C"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Turno</label>
                  <select
                    className="form-input"
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nivel Educativo</label>
                  <select
                    className="form-input"
                    value={nivelEducativo}
                    onChange={(e) => setNivelEducativo(e.target.value)}
                  >
                    <option value="EEB">Educación Escolar Básica (EEB)</option>
                    <option value="EM">Educación Media (EM)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm">Guardar Curso</button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCursoForm(false)}
                >
                  Cerrar
                </button>
              </div>
            </form>
          )}

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Grado / Curso</th>
                  <th>Sección</th>
                  <th>Turno</th>
                  <th>Nivel Educativo</th>
                </tr>
              </thead>
              <tbody>
                {cursos.map((c) => (
                  <tr key={c.id_curso}>
                    <td className="text-xs text-muted">#{c.id_curso}</td>
                    <td><strong>{c.grado_curso}</strong></td>
                    <td><span className="badge badge-primary">{c.seccion}</span></td>
                    <td className="text-sm">{c.turno}</td>
                    <td className="text-sm">
                      <span className="badge badge-success">
                        {c.nivel_educativo === 'EEB' ? 'Básica' : 'Media'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
