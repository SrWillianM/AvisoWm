import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../store/authStore';
import styles from './Directorio.module.css';

export default function Directorio() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'Administrador';

  // Estados de Contactos
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(true);
  const [showFormContacto, setShowFormContacto] = useState(false);
  const [depto, setDepto] = useState('');
  const [encargado, setEncargado] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [horario, setHorario] = useState('');

  // Estados de Soporte
  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [showFormTicket, setShowFormTicket] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const cargarContactos = async () => {
    try {
      setLoadingContactos(true);
      const res = await client.get('/contactos/');
      setContactos(res.data.results || res.data);
    } catch {
      setFeedback({ text: 'Error al cargar contactos.', type: 'error' });
    } finally {
      setLoadingContactos(false);
    }
  };

  const cargarReportes = async () => {
    try {
      setLoadingReportes(true);
      const res = await client.get('/soporte/');
      setReportes(res.data.results || res.data);
    } catch {
      setFeedback({ text: 'Error al cargar reportes.', type: 'error' });
    } finally {
      setLoadingReportes(false);
    }
  };

  useEffect(() => {
    cargarContactos();
    cargarReportes();
  }, []);

  const handleCrearContacto = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/contactos/', {
        departamento: depto,
        nombre_encargado: encargado,
        telefono,
        correo_contacto: correo || null,
        horario_atencion: horario,
      });
      setContactos((prev) => [...prev, data]);
      setFeedback({ text: 'Contacto institucional agregado con éxito.', type: 'success' });
      setShowFormContacto(false);
      setDepto('');
      setEncargado('');
      setTelefono('');
      setCorreo('');
      setHorario('');
    } catch (err) {
      setFeedback({ text: 'Error al guardar contacto institucional.', type: 'error' });
    }
  };

  const handleCrearTicket = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/soporte/', {
        asunto,
        mensaje,
      });
      setReportes((prev) => [data, ...prev]);
      setFeedback({ text: 'Reporte enviado correctamente.', type: 'success' });
      setShowFormTicket(false);
      setAsunto('');
      setMensaje('');
    } catch (err) {
      setFeedback({ text: 'Error al enviar reporte de soporte.', type: 'error' });
    }
  };

  const handleCambiarEstadoSoporte = async (idReporte, nuevoEstado) => {
    try {
      const { data } = await client.patch(`/soporte/${idReporte}/`, {
        estado: nuevoEstado,
      });
      setReportes((prev) =>
        prev.map((r) => (r.id_reporte === idReporte ? { ...r, estado: data.estado } : r))
      );
      setFeedback({ text: `Estado actualizado a "${nuevoEstado}".`, type: 'success' });
    } catch (err) {
      setFeedback({ text: 'No se pudo actualizar el estado.', type: 'error' });
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Directorio y Soporte</h1>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.text}
        </div>
      )}

      {/* SECCIÓN 1: Directorio Institucional (RF-08) */}
      <section className={styles.section}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="page-subtitle" style={{ margin: 0 }}>Contactos Útiles</h2>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowFormContacto(!showFormContacto)}
            >
              {showFormContacto ? 'Cancelar' : '+ Agregar Contacto'}
            </button>
          )}
        </div>

        {showFormContacto && isAdmin && (
          <form onSubmit={handleCrearContacto} className={`card ${styles.formBox}`}>
            <h3 className="text-sm font-semibold mb-3">Nuevo Contacto</h3>
            <div className={styles.grid2}>
              <div className="form-group">
                <label className="form-label">Departamento</label>
                <input
                  className="form-input"
                  value={depto}
                  onChange={(e) => setDepto(e.target.value)}
                  placeholder="Ej: Secretaría Académica"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Encargado</label>
                <input
                  className="form-input"
                  value={encargado}
                  onChange={(e) => setEncargado(e.target.value)}
                  placeholder="Ej: Lic. Marta González"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-input"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 071-205000"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo (Opcional)</label>
                <input
                  type="email"
                  className="form-input"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ej: secretaria@colegio.edu.py"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Horario de Atención</label>
              <input
                className="form-input"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                placeholder="Ej: Lunes a Viernes 07:00 a 12:00 hs"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFormContacto(false)}
              >
                Cerrar
              </button>
            </div>
          </form>
        )}

        {loadingContactos ? (
          <LoadingSpinner />
        ) : contactos.length === 0 ? (
          <div className="empty-state">
            <p>No hay contactos registrados.</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {contactos.map((c) => (
              <div key={c.id_contacto} className={`card ${styles.contactoCard}`}>
                <div className={styles.contactoHeader}>
                  <h3 className={styles.contactoDepto}>{c.departamento}</h3>
                  <span className="badge badge-primary">Institucional</span>
                </div>
                <p className="text-sm"><strong>Encargado:</strong> {c.nombre_encargado}</p>
                <p className="text-sm"><strong>Teléfono:</strong> <a href={`tel:${c.telefono}`}>{c.telefono}</a></p>
                {c.correo_contacto && (
                  <p className="text-sm"><strong>Correo:</strong> <a href={`mailto:${c.correo_contacto}`}>{c.correo_contacto}</a></p>
                )}
                <p className="text-xs text-muted mt-2">{c.horario_atencion}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Soporte Técnico (RF-09, RN-06) */}
      <section className={styles.section}>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="page-subtitle" style={{ margin: 0 }}>Soporte Técnico</h2>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowFormTicket(!showFormTicket)}
          >
            {showFormTicket ? 'Cancelar' : '+ Enviar Reporte'}
          </button>
        </div>

        {showFormTicket && (
          <form onSubmit={handleCrearTicket} className={`card ${styles.formBox}`}>
            <h3 className="text-sm font-semibold mb-3">Nuevo Reporte</h3>
            <div className="form-group">
              <label className="form-label">Asunto</label>
              <input
                className="form-input"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Ej: Dificultad para visualizar avisos"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea
                className="form-input"
                rows={3}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Describa el inconveniente..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">Enviar</button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFormTicket(false)}
              >
                Cerrar
              </button>
            </div>
          </form>
        )}

        {loadingReportes ? (
          <LoadingSpinner />
        ) : reportes.length === 0 ? (
          <div className="empty-state">
            <p>No hay reportes de soporte pendientes.</p>
          </div>
        ) : (
          <div className={styles.ticketsList}>
            {reportes.map((rep) => (
              <div key={rep.id_reporte} className={`card ${styles.ticketCard}`}>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm">{rep.asunto}</h4>
                  <span
                    className={`badge ${
                      rep.estado === 'Resuelto'
                        ? 'badge-success'
                        : rep.estado === 'En_Revision'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {rep.estado === 'En_Revision' ? 'En Revisión' : rep.estado}
                  </span>
                </div>
                <p className="text-sm text-muted mb-3">{rep.mensaje}</p>

                <div className="flex justify-between items-center text-xs text-muted flex-wrap gap-2">
                  <span>
                    {rep.usuario_nombre || `Usuario #${rep.id_usuario}`} —{' '}
                    {new Date(rep.fecha_envio).toLocaleDateString('es-PY', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isAdmin && (
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-semibold">Estado:</span>
                      <select
                        className="form-input"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                        value={rep.estado}
                        onChange={(e) => handleCambiarEstadoSoporte(rep.id_reporte, e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En_Revision">En Revisión</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
