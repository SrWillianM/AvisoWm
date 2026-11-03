import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import AvisoCard from '../../components/AvisoCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../store/authStore';
import styles from './Cartelera.module.css';

export default function Cartelera() {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState([]);
  const [vinculos, setVinculos] = useState([]);
  const [cursoActivo, setCursoActivo] = useState(null); // null = Todos los vinculados
  const [loading, setLoading] = useState(true);
  const [showVincular, setShowVincular] = useState(false);
  const [showGestionar, setShowGestionar] = useState(false);
  const [nuevoCursoId, setNuevoCursoId] = useState('');
  const [nombreHijo, setNombreHijo] = useState('');
  const [cursos, setCursos] = useState([]);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const isPadre = user?.rol === 'Padre';

  // 1. Cargar vínculos del Padre y catálogo de cursos
  const cargarVinculosYCursos = async () => {
    try {
      if (isPadre) {
        const vinculosRes = await client.get('/mis-cursos/');
        const dataVinculos = vinculosRes.data.results || vinculosRes.data;
        setVinculos(Array.isArray(dataVinculos) ? dataVinculos : []);
      }
      const cursosRes = await client.get('/cursos/');
      const dataCursos = cursosRes.data.results || cursosRes.data;
      setCursos(Array.isArray(dataCursos) ? dataCursos : []);
    } catch (err) {
      console.error('Error cargando vínculos y catálogo:', err);
    }
  };

  // 2. Cargar avisos desde el endpoint
  const cargarAvisos = async () => {
    try {
      setLoading(true);
      const res = await client.get('/avisos/');
      const dataAvisos = res.data.results || res.data;
      setAvisos(Array.isArray(dataAvisos) ? dataAvisos : []);
    } catch (err) {
      console.error('Error cargando avisos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVinculosYCursos();
    cargarAvisos();
  }, [user]);

  // Manejar vinculación de nuevo hijo/curso
  const handleVincular = async (e) => {
    e.preventDefault();
    setFeedback({ text: '', type: '' });
    try {
      const { data } = await client.post('/mis-cursos/', {
        id_curso: parseInt(nuevoCursoId, 10),
        nombre_hijo: nombreHijo.trim(),
      });
      setVinculos((prev) => [...prev, data]);
      setFeedback({
        text: `Curso vinculado correctamente para ${nombreHijo.trim()}.`,
        type: 'success',
      });
      setShowVincular(false);
      setNuevoCursoId('');
      setNombreHijo('');
      await cargarAvisos();
    } catch (err) {
      setFeedback({
        text: err.response?.data?.non_field_errors?.[0] || 'No se pudo vincular el curso seleccionado.',
        type: 'error',
      });
    }
  };

  // Manejar desvinculación
  const handleDesvincular = async (idPadreCurso, nombreHijo) => {
    if (!window.confirm(`¿Desvincular a ${nombreHijo || 'este curso'}?`)) {
      return;
    }
    try {
      await client.delete(`/mis-cursos/${idPadreCurso}/`);
      setVinculos((prev) => prev.filter((v) => v.id_padre_curso !== idPadreCurso));
      if (cursoActivo === idPadreCurso) {
        setCursoActivo(null);
      }
      setFeedback({
        text: `Curso de ${nombreHijo || 'alumno'} desvinculado.`,
        type: 'success',
      });
      await cargarAvisos();
    } catch (err) {
      setFeedback({ text: 'Error al desvincular el curso.', type: 'error' });
    }
  };

  // Filtrado reactivo de avisos
  const avisosFiltrados = cursoActivo
    ? avisos.filter((a) => a.tipo_aviso === 'General' || a.id_curso === cursoActivo)
    : avisos;

  return (
    <div className="page-container">
      {/* Encabezado y acciones principales */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Avisos</h1>
        </div>

        {isPadre && (
          <div className={styles.actions}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowVincular(true);
                setShowGestionar(false);
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Vincular Curso</span>
            </button>

            {vinculos.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowGestionar(!showGestionar);
                  setShowVincular(false);
                }}
              >
                <span>{showGestionar ? 'Cerrar' : `Mis Cursos (${vinculos.length})`}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} mt-2`}>
          {feedback.text}
        </div>
      )}

      {/* Formulario para vincular un hijo a su grado */}
      {showVincular && isPadre && (
        <form onSubmit={handleVincular} className={`card ${styles.modalCard}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold" style={{ margin: 0, color: '#0f172a' }}>
              Vincular alumno a curso
            </h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowVincular(false)}
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label" htmlFor="nombreHijo">
                Nombre del alumno
              </label>
              <input
                id="nombreHijo"
                className="form-input"
                value={nombreHijo}
                onChange={(e) => setNombreHijo(e.target.value)}
                placeholder="Ej: Lucas Medina"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nuevoCurso">
                Curso y sección
              </label>
              <select
                id="nuevoCurso"
                className="form-input"
                value={nuevoCursoId}
                onChange={(e) => setNuevoCursoId(e.target.value)}
                required
              >
                <option value="">Seleccionar curso...</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.grado_curso} "{c.seccion}" — Turno {c.turno}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary btn-sm">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowVincular(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de gestión de cursos del padre */}
      {showGestionar && isPadre && vinculos.length > 0 && (
        <div className={`card ${styles.modalCard}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold" style={{ margin: 0, color: '#0f172a' }}>
              Cursos vinculados
            </h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setShowGestionar(false)}
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className={styles.vinculosList}>
            {vinculos.map((v) => (
              <div key={v.id_padre_curso} className={styles.vinculoItem}>
                <div>
                  <strong className="text-sm">{v.nombre_hijo || 'Alumno'}</strong>
                  <span className="text-muted text-xs" style={{ marginLeft: 8 }}>
                    {v.curso_detalle?.grado_curso} "{v.curso_detalle?.seccion}" ({v.curso_detalle?.turno})
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDesvincular(v.id_padre_curso, v.nombre_hijo)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros segmentados por hijo / curso */}
      {isPadre && vinculos.length > 0 && (
        <div className={styles.tabsContainer}>
          <div className="tabs" style={{ borderBottom: 'none', marginBottom: 12 }}>
            <button
              className={`tab ${cursoActivo === null ? 'active' : ''}`}
              onClick={() => setCursoActivo(null)}
            >
              Todos mis hijos
            </button>
            {vinculos.map((v) => (
              <button
                key={v.id_padre_curso}
                className={`tab ${cursoActivo === v.id_curso ? 'active' : ''}`}
                onClick={() => setCursoActivo(v.id_curso)}
              >
                {v.nombre_hijo}: {v.curso_detalle?.grado_curso} "{v.curso_detalle?.seccion}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contador de avisos estilo SCAU */}
      <div className={styles.counterRow}>
        <span>
          {avisosFiltrados.length}{' '}
          {avisosFiltrados.length === 1 ? 'aviso encontrado' : 'avisos encontrados'}
        </span>
      </div>

      {/* Estado vacío cuando no tiene cursos */}
      {isPadre && vinculos.length === 0 && !showVincular && (
        <div className={`card ${styles.emptyCard}`}>
          <h2 className={styles.emptyTitle}>Sin cursos vinculados</h2>
          <p className={styles.emptyText}>
            Selecciona los cursos de tus hijos para recibir sus avisos específicos.
          </p>
          <button
            className="btn btn-primary btn-sm mt-4"
            onClick={() => setShowVincular(true)}
          >
            Vincular Curso
          </button>
        </div>
      )}

      {/* Lista de tarjetas de avisos */}
      <section className={styles.listSection}>
        {loading ? (
          <LoadingSpinner />
        ) : avisosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay avisos disponibles.</p>
          </div>
        ) : (
          <div>
            {avisosFiltrados.map((aviso) => (
              <AvisoCard key={aviso.id_aviso} aviso={aviso} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
