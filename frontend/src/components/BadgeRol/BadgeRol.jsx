import React from 'react';

/**
 * BadgeRol — Badge visual del rol del usuario.
 */
export default function BadgeRol({ rol }) {
  const badgeClass =
    rol === 'Administrador' ? 'badge-primary' :
    rol === 'Profesor' ? 'badge-success' : 'badge-warning';

  return <span className={`badge ${badgeClass}`}>{rol}</span>;
}
