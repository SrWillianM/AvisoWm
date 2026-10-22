/**
 * store/authStore.js — Context API + useReducer para autenticación.
 */

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import client from '../api/client';

// ── State ──
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// ── Actions ──
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
};

// ── Reducer ──
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

// ── Context ──
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al montar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: JSON.parse(user) });
      } catch {
        localStorage.clear();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  const login = async (cedula, password) => {
    const { data } = await client.post('/auth/login/', { cedula, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
    return data.user;
  };

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
