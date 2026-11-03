import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import styles from './Login.module.css';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(cedula, password);
      if (user.rol === 'Administrador') navigate('/admin');
      else if (user.rol === 'Profesor') navigate('/gestion-avisos');
      else navigate('/cartelera');
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        'Cédula o contraseña incorrecta.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.brandRow}>
          <div className={styles.logoBadge}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.capIcon}
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <h1 className={styles.title}>SCAU</h1>
          <p className={styles.subtitle}>Sistema Centralizado de Avisos</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="cedula">
            Cédula de Identidad
          </label>
          <input
            id="cedula"
            type="text"
            className="form-input"
            placeholder="Ej: 3000001"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg mt-4"
          style={{ width: '100%', minHeight: '46px' }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
