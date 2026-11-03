import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../store/authStore';
import styles from './GestionAvisos.module.css';

export default function GestionAvisos() {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado del formulario
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipoAviso, setTipoAviso] = useState(user?.rol === 'Administrador' ? 'General' : 'Especifico');
  const [idCurso, setIdCurso] = useState('');
  const [editingId, setEditingId] = useState(null);

  const isAdmin = user?.rol === 'Administrador';

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [avisosRes, cursosRes] = await Promise.all([
        client.get('/avisos/'),
        client.get('/cursos/'),
      ]);
      const listAvisos = avisosRes.data.results || avisosRes.data;
      setAvisos(listAvisos);
      const listCursos = cursosRes.data.results || cursosRes.data;
      setCursos(listCursos);
    } catch (err) {
      setError('Error al cargar datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setTitulo('');
    setContenido('');
    setTipoAviso(isAdmin ? 'General' : 'Especifico');
    setIdCurso('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const payload = {
      titulo,
      contenido,
      tipo_aviso: tipoAviso,
      id_curso: tipoAviso === 'Especifico' && idCurso ? parseInt(idCurso, 10) : null,
    };

    try {
      if (editingId) {
        await client.patch(`/avisos/${editingId}/`, payload);
        setSuccess('Aviso actualizado correctamente.');
      } else {
        await client.post('/avisos/', payload);
        setSuccess('Aviso publicado con éxito.');
      }
      limpiarFormulario();
      await cargarDatos();
    } catch (err) {
      const msg =
        err.response?.data?.tipo_aviso?.[0] ||
        err.response?.data?.id_curso?.[0] ||
        err.response?.data?.detail ||
        'Error al procesar el aviso.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditar = (aviso) => {
    setEditingId(aviso.id_aviso);
    setTitulo(aviso.titulo);
    setContenido(aviso.contenido);
    setTipoAviso(aviso.tipo_aviso);
    setIdCurso(aviso.id_curso ? String(aviso.id_curso) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleEstado = async (aviso) => {
    try {
      await client.patch(`/avisos/${aviso.id_aviso}/`, {
        estado_activo: !aviso.estado_activo,
      });
      setAvisos((prev) =>
        prev.map((a) =>
          a.id_aviso === aviso.id_aviso
            ? { ...a, estado_activo: !a.estado_activo }
            : a
        )
      );
    } catch (err) {
      setError('No se pudo modificar el estado del aviso.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Gestión de Avisos</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Formulario de Emisión / Edición */}
      <section className={`card ${styles.formCard}`}>
        <h2 className="page-subtitle">
          {editingId ? 'Editar Aviso' : 'Nuevo Aviso'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              className="form-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Actividades de inicio del año lectivo"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              className="form-input"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escriba el comunicado oficial..."
              rows={4}
              required
            />
          </div>

          <div className={styles.twoCols}>
            <div className="form-group">
              <label className="form-label" htmlFor="tipoAviso">Alcance</label>
              <select
                id="tipoAviso"
                className="form-input"
                value={tipoAviso}
                onChange={(e) => {
                  setTipoAviso(e.target.value);
                  if (e.target.value === 'General') setIdCurso('');
                }}
              >
                {isAdmin && <option value="General">General (Institucional)</option>}
                <option value="Especifico">Específico por Curso</option>
              </select>
            </div>

            {tipoAviso === 'Especifico' && (
              <div className="form-group">
                <label className="form-label" htmlFor="idCurso">Curso Asignado</label>
                <select
                  id="idCurso"
                  className="form-input"
                  value={idCurso}
                  onChange={(e) => setIdCurso(e.target.value)}
                  required={tipoAviso === 'Especifico'}
                >
                  <option value="">Seleccione curso...</option>
                  {cursos.map((c) => (
                    <option key={c.id_curso} value={c.id_curso}>
                      {c.grado_curso} "{c.seccion}" — {c.turno}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? <span className="spinner" /> : editingId ? 'Guardar Cambios' : 'Publicar'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Listado para Administrador / Profesor */}
      <section className="mt-6">
        <h2 className="page-subtitle">Avisos Emitidos</h2>

        {loading ? (
          <LoadingSpinner />
        ) : avisos.length === 0 ? (
          <div className="empty-state">
            <p>No se encontraron avisos registrados.</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Alcance</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {avisos.map((av) => (
                  <tr key={av.id_aviso} className={!av.estado_activo ? styles.rowInactiva : ''}>
                    <td className="text-xs text-muted">
                      {new Date(av.fecha_publicacion).toLocaleDateString('es-PY')}
                    </td>
                    <td>
                      <span className={`badge ${av.tipo_aviso === 'General' ? 'badge-primary' : 'badge-success'}`}>
                        {av.tipo_aviso}
                      </span>
                    </td>
                    <td className={styles.cellTitulo}>
                      <strong>{av.titulo}</strong>
                    </td>
                    <td className="text-sm">
                      {av.tipo_aviso === 'General' ? 'Institucional' : av.curso_nombre || `Curso #${av.id_curso}`}
                    </td>
                    <td>
                      <span className={`badge ${av.estado_activo ? 'badge-success' : 'badge-danger'}`}>
                        {av.estado_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditar(av)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${av.estado_activo ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleEstado(av)}
                        >
                          {av.estado_activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
