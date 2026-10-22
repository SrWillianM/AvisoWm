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
      // Redirigir según rol
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
        <div className={styles.logo}>📋</div>
        <h1 className={styles.title}>Avisos Institucionales</h1>
        <p className={styles.subtitle}>Obligado — Sistema de Comunicación</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label" htmlFor="cedula">Cédula de Identidad</label>
          <input
            id="cedula"
            type="text"
            className="form-input"
            placeholder="Ej: 1234567"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
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
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}
