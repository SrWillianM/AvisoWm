import React, { useState } from 'react';
import styles from './AvisoCard.module.css';

/**
 * AvisoCard — Diseño minimalista institucional matching SCAU
 */
export default function AvisoCard({ aviso }) {
  const [expandido, setExpandido] = useState(false);
  const isGeneral = aviso.tipo_aviso === 'General';

  // Determinar si es reciente (menos de 14 días)
  const fechaPub = new Date(aviso.fecha_publicacion);
  const ahora = new Date();
  const diffDias = Math.floor((ahora - fechaPub) / (1000 * 60 * 60 * 24));
  const esNuevo = isNaN(diffDias) || diffDias <= 14;

  const fechaFormateada = !isNaN(fechaPub)
    ? fechaPub.toLocaleDateString('es-PY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article className={styles.card}>
      {/* Fila superior: Badges de estado, alcance y fecha */}
      <div className={styles.topRow}>
        <div className={styles.tagsGroup}>
          {esNuevo && <span className={styles.badgeNuevo}>Nuevo</span>}
          <span className={isGeneral ? styles.badgeGeneral : styles.badgeEspecifico}>
            {isGeneral ? 'GENERAL' : 'ESPECÍFICO'}
          </span>
          <span className={styles.separator}>•</span>
          <time className={styles.dateText}>{fechaFormateada}</time>
        </div>

        <button
          type="button"
          className={`${styles.arrowBtn} ${expandido ? styles.arrowExpanded : ''}`}
          onClick={() => setExpandido(!expandido)}
          aria-label={expandido ? 'Ver menos' : 'Ver detalle'}
          title={expandido ? 'Ver menos' : 'Ver detalle'}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className={styles.chevronIcon}>
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Título azul institucional */}
      <h3
        className={styles.title}
        onClick={() => setExpandido(!expandido)}
        role="button"
        tabIndex={0}
      >
        {aviso.titulo}
      </h3>

      {/* Contenido */}
      <p className={`${styles.content} ${!expandido ? styles.contentClamped : ''}`}>
        {aviso.contenido}
      </p>

      {/* Pie de tarjeta con autor / departamento y curso */}
      <div className={styles.footer}>
        <div className={styles.authorGroup}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.authorIcon}
          >
            <path d="M3 21h18M3 7v14M21 7v14M6 7V3h12v4M9 11h2M13 11h2M9 15h2M13 15h2" />
          </svg>
          <span className={styles.authorText}>
            {aviso.autor?.nombre_completo || 'Secretaría Académica'}
          </span>
        </div>

        {aviso.curso_nombre && (
          <div className={styles.cursoTag}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.cursoIcon}
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{aviso.curso_nombre}</span>
          </div>
        )}
      </div>
    </article>
  );
}
