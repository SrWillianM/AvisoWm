import React from 'react';
import styles from './AvisoCard.module.css';

/**
 * AvisoCard — Tarjeta de aviso con borde izquierdo colorizado.
 * General → azul, Específico → verde.
 */
export default function AvisoCard({ aviso }) {
  const isGeneral = aviso.tipo_aviso === 'General';

  return (
    <article className={`${styles.card} ${isGeneral ? styles.general : styles.especifico}`}>
      <div className={styles.header}>
        <span className={`badge ${isGeneral ? 'badge-primary' : 'badge-success'}`}>
          {isGeneral ? 'GENERAL' : 'ESPECÍFICO'}
        </span>
        <time className={styles.date}>
          {new Date(aviso.fecha_publicacion).toLocaleDateString('es-PY', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </time>
      </div>

      <h3 className={styles.title}>{aviso.titulo}</h3>
      <p className={styles.content}>{aviso.contenido}</p>

      <div className={styles.footer}>
        <span className={styles.author}>
          {aviso.autor?.nombre_completo || 'Autor'}
        </span>
        {aviso.curso_nombre && (
          <span className={styles.curso}>{aviso.curso_nombre}</span>
        )}
      </div>
    </article>
  );
}
