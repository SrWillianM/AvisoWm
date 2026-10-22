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
        text: `¡Excelente! Se vinculó el curso para ${nombreHijo.trim()}.`,
        type: 'success',
      });
      setShowVincular(false);
      setNuevoCursoId('');
      setNombreHijo('');
      // Recargar avisos para reflejar el nuevo curso en la cartelera
      await cargarAvisos();
    } catch (err) {
      setFeedback({
        text: err.response?.data?.non_field_errors?.[0] || 'No se pudo vincular el curso. Verifique si ya estaba vinculado.',
        type: 'error',
      });
    }
  };

  // Manejar desvinculación / eliminación de curso
  const handleDesvincular = async (idPadreCurso, nombreHijo) => {
    if (!window.confirm(`¿Deseas desvincular a ${nombreHijo || 'este curso'}? Dejarás de recibir sus avisos específicos.`)) {
      return;
    }
    try {
      await client.delete(`/mis-cursos/${idPadreCurso}/`);
      setVinculos((prev) => prev.filter((v) => v.id_padre_curso !== idPadreCurso));
      if (cursoActivo === idPadreCurso) {
        setCursoActivo(null);
      }
      setFeedback({
        text: `Se desvinculó a ${nombreHijo || 'el curso'} correctamente.`,
        type: 'success',
      });
      await cargarAvisos();
    } catch (err) {
      setFeedback({ text: 'Error al desvincular el curso.', type: 'error' });
    }
  };

  // Filtrado reactivo de avisos:
  // Si cursoActivo != null: solo aviso General o que coincida con el id_curso del hijo seleccionado
  // Si cursoActivo == null: todos los avisos que devuelve el backend (ya filtrados por el backend para el padre)
  const avisosFiltrados = cursoActivo
    ? avisos.filter((a) => a.tipo_aviso === 'General' || a.id_curso === cursoActivo)
    : avisos;

  const hijoSeleccionado = vinculos.find((v) => v.id_curso === cursoActivo);

  return (
    <div className="page-container">
      <div className={styles.header}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 'var(--space-1)' }}>
            📋 Cartelera de Avisos Oficiales
          </h1>
          <p className="text-sm text-muted">
            {isPadre
              ? 'Consulte los comunicados de la institución y de los cursos de sus hijos.'
              : 'Cartelera general y académica institucional.'}
          </p>
        </div>

        {isPadre && (
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowVincular(true);
                setShowGestionar(false);
              }}
            >
              + Vincular Hijo / Curso
            </button>
            {vinculos.length > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowGestionar(!showGestionar);
                  setShowVincular(false);
                }}
              >
                {showGestionar ? 'Cerrar Gestión' : '⚙ Mis Cursos (' + vinculos.length + ')'}
              </button>
            )}
          </div>
        )}
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} mt-4`}>
          {feedback.text}
        </div>
      )}

      {/* PANEL 1: Formulario para Vincular un nuevo hijo y elegir su curso */}
      {showVincular && isPadre && (
        <form onSubmit={handleVincular} className={`card ${styles.vincularCard} mt-4`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="page-subtitle" style={{ margin: 0 }}>
              👨‍👧‍👦 Vincular Hijo/a a su Curso
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowVincular(false)}
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted mb-4">
            Escriba el nombre de su hijo/a y elija el grado y sección correspondiente. Puede agregar tantos hijos como tenga en la institución.
          </p>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label" htmlFor="nombreHijo">
                Nombre de su Hijo / Hija
              </label>
              <input
                id="nombreHijo"
                className="form-input"
                value={nombreHijo}
                onChange={(e) => setNombreHijo(e.target.value)}
                placeholder="Ej: Lucas Medina / Sofía"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="nuevoCurso">
                Curso / Sección a Asignar
              </label>
              <select
                id="nuevoCurso"
                className="form-input"
                value={nuevoCursoId}
                onChange={(e) => setNuevoCursoId(e.target.value)}
                required
              >
                <option value="">Seleccione el grado y sección...</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.grado_curso} "{c.seccion}" — Turno {c.turno} ({c.nivel_educativo === 'EEB' ? 'Básica' : 'Media'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary">
              Guardar Vinculación
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowVincular(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* PANEL 2: Gestión de Cursos / Hijos vinculados (Permite verlos y desvincularlos) */}
      {showGestionar && isPadre && vinculos.length > 0 && (
        <div className={`card ${styles.gestionarCard} mt-4`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="page-subtitle" style={{ margin: 0 }}>
              Cursos Actuales Vinculados a su Cuenta
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowGestionar(false)}
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted mb-4">
            Solo verá avisos de los cursos que tenga activos en esta lista:
          </p>

          <div className={styles.vinculosList}>
            {vinculos.map((v) => (
              <div key={v.id_padre_curso} className={styles.vinculoItem}>
                <div>
                  <strong>{v.nombre_hijo || 'Hijo/a'}</strong>
                  <span className="text-muted text-sm ml-2">
                    — {v.curso_detalle?.grado_curso} "{v.curso_detalle?.seccion}" ({v.curso_detalle?.turno})
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDesvincular(v.id_padre_curso, v.nombre_hijo)}
                >
                  Quitar Curso
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑAS (TABS) POR HIJO / CURSO — RF-05, RF-06 */}
      {isPadre && vinculos.length > 0 && (
        <div className={`${styles.tabsWrapper} mt-6`}>
          <div className="tabs">
            <button
              className={`tab ${cursoActivo === null ? 'active' : ''}`}
              onClick={() => setCursoActivo(null)}
            >
              ⭐ Todos mis hijos ({vinculos.length} cursos)
            </button>
            {vinculos.map((v) => (
              <button
                key={v.id_padre_curso}
                className={`tab ${cursoActivo === v.id_curso ? 'active' : ''}`}
                onClick={() => setCursoActivo(v.id_curso)}
              >
                👦 {v.nombre_hijo || 'Hijo'}: {v.curso_detalle?.grado_curso} "{v.curso_detalle?.seccion}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BANNER INFORMATIVO DEL FILTRO ACTIVO */}
      {isPadre && vinculos.length > 0 && (
        <div className={styles.filterBanner}>
          {cursoActivo === null ? (
            <span>
              Mostrando comunicados <strong>Generales</strong> y específicos de todos sus cursos (
              {vinculos.map((v) => `${v.nombre_hijo} en ${v.curso_detalle?.grado_curso} ${v.curso_detalle?.seccion}`).join(', ')}).
            </span>
          ) : (
            <span>
              Filtrado activo para <strong>{hijoSeleccionado?.nombre_hijo || 'Hijo/a'}</strong> en{' '}
              <strong>
                {hijoSeleccionado?.curso_detalle?.grado_curso} "{hijoSeleccionado?.curso_detalle?.seccion}"
              </strong>{' '}
              + Comunicados Generales.
            </span>
          )}
        </div>
      )}

      {/* ESTADO VACÍO PARA PADRE SIN CURSOS */}
      {isPadre && vinculos.length === 0 && !showVincular && (
        <div className={`card ${styles.emptyVinculosCard} mt-6`}>
          <div className={styles.emptyIcon}>👨‍👩‍👧‍👦</div>
          <h2 className={styles.emptyTitle}>Aún no has seleccionado los cursos de tus hijos</h2>
          <p className={styles.emptyText}>
            Para recibir únicamente los avisos que te competen, selecciona los grados y secciones a los que asisten tus hijos.
          </p>
          <button
            className="btn btn-primary btn-lg mt-4"
            onClick={() => setShowVincular(true)}
          >
            + Seleccionar Cursos de mis Hijos
          </button>
        </div>
      )}

      {/* LISTADO DE TARJETAS DE AVISOS */}
      <section className="mt-4">
        {loading ? (
          <LoadingSpinner />
        ) : avisosFiltrados.length === 0 ? (
          <div className="empty-state">
            <p>No hay avisos para los criterios seleccionados.</p>
          </div>
        ) : (
          <div className={styles.avisosList}>
            {avisosFiltrados.map((aviso) => (
              <AvisoCard key={aviso.id_aviso} aviso={aviso} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
