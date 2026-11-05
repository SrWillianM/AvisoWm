/**
 * authStore.jsx — Gestión Centralizada del Estado de Autenticación y Sesión de Usuario.
 * 
 * Patrón de Arquitectura: Context API + useReducer (React 18).
 * Propósito:
 * 1. Proporciona un estado global reactivo (`user`, `isAuthenticated`, `loading`).
 * 2. Administra el ciclo de vida de la sesión (login, logout, hidratación desde localStorage).
 * 3. Expone el hook personalizado `useAuth()` para que cualquier componente acceda al usuario actual.
 */

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import client from '../api/client';

// ── 1. Estado Inicial de la Aplicación ──
const initialState = {
  user: null,              // Objeto con id_usuario, nombre_completo, rol
  isAuthenticated: false,  // Booleano para control de guardias de rutas protegidas
  loading: true,           // Flag para evitar parpadeos visuales durante la verificación inicial
};

// ── 2. Tipos de Acciones (Actions) ──
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
};

// ── 3. Reducer: Función pura que calcula el nuevo estado según la acción emitida ──
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, loading: false };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// ── 4. Creación del Contexto de React ──
const AuthContext = createContext(null);

/**
 * Proveedor del Contexto (AuthProvider):
 * Envuelve a toda la aplicación en `App.jsx` para distribuir el estado global.
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Efecto de Hidratación: al cargar la página o refrescar F5, recupera la sesión activa
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: JSON.parse(user) });
      } catch {
        // En caso de datos corruptos en el almacenamiento local, limpia y resetea
        localStorage.clear();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  /**
   * Acción de Login:
   * Envía cédula y contraseña al endpoint REST `/api/auth/login/`.
   * Al recibir 200 OK, almacena el par de tokens JWT y la identidad del usuario.
   */
  const login = async (cedula, password) => {
    const { data } = await client.post('/auth/login/', { cedula, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
    return data.user;
  };

  /**
   * Acción de Logout:
   * Destruye las credenciales y tokens locales, devolviendo el estado a no autenticado.
   */
  const logout = () => {
    localStorage.clear();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado useAuth:
 * Facilita el consumo del contexto en componentes funcionales (ej. `const { user, logout } = useAuth();`).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse obligatoriamente dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
