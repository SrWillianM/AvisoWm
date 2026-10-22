import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

/**
 * ProtectedRoute — Protege rutas por autenticación y roles.
 * @param {string[]} roles — Roles permitidos (vacío = todos los autenticados).
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <Navigate to="/cartelera" replace />;
  }

  return children;
}
