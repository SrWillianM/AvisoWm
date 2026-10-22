import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Cartelera from './pages/Cartelera';
import GestionAvisos from './pages/GestionAvisos';
import Directorio from './pages/Directorio';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './store/authStore';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-root">
      {isAuthenticated && <Navbar />}

      <main>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/cartelera"
            element={
              <ProtectedRoute>
                <Cartelera />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-avisos"
            element={
              <ProtectedRoute roles={['Administrador', 'Profesor']}>
                <GestionAvisos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contactos-y-soporte"
            element={
              <ProtectedRoute>
                <Directorio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['Administrador']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/cartelera" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
