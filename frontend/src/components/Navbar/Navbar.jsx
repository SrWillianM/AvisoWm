import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/cartelera" className={styles.brand}>
          📋 Avisos Obligado
        </Link>

        <div className={styles.links}>
          <Link to="/cartelera" className={styles.link}>Cartelera</Link>

          {(user.rol === 'Administrador' || user.rol === 'Profesor') && (
            <Link to="/gestion-avisos" className={styles.link}>Gestión Avisos</Link>
          )}

          <Link to="/contactos-y-soporte" className={styles.link}>Directorio</Link>

          {user.rol === 'Administrador' && (
            <Link to="/admin" className={styles.link}>Admin</Link>
          )}
        </div>

        <div className={styles.userSection}>
          <span className={`badge ${user.rol === 'Administrador' ? 'badge-primary' : user.rol === 'Profesor' ? 'badge-success' : 'badge-warning'}`}>
            {user.rol}
          </span>
          <span className={styles.userName}>{user.nombre_completo}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
