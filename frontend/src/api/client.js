/**
 * client.js — Cliente HTTP Centralizado (Axios) con Gestión Automática de Tokens JWT.
 * 
 * Funcionalidades Clave de Arquitectura:
 * 1. Base URL configurable mediante variables de entorno Vite (`VITE_API_URL`).
 * 2. Interceptor de Peticiones (Request Interceptor):
 *    - Inyecta automáticamente el token de acceso JWT en el encabezado `Authorization: Bearer <token>`.
 * 3. Interceptor de Respuestas (Response Interceptor):
 *    - Detección reactiva de errores HTTP 401 Unauthorized (token de acceso expirado).
 *    - Manejo de Cola de Espera (`failedQueue`): evita solicitudes de refresco duplicadas cuando
 *      múltiples componentes realizan peticiones concurrentes.
 *    - Renovación silenciosa con el Refresh Token en `/api/auth/refresh/`.
 *    - Redirección forzosa al Login si el Refresh Token también expiró.
 */

import axios from 'axios';

// URL base de la API REST (por defecto '/api' bajo Nginx en Docker)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── 1. Interceptor de Peticiones: Adjunta el Bearer Token ──
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 2. Interceptor de Respuestas: Auto-Refresh Silencioso en caso de 401 ──
let isRefreshing = false;
let failedQueue = [];

// Función para reanudar todas las peticiones que quedaron pausadas esperando el nuevo token
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si recibimos 401 y la solicitud no ha sido reintentada previamente
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si ya hay un refresco de token en curso, encolamos esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Sin token de refresco: sesión expirada definitivamente
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Solicitamos un nuevo token de acceso a Django SimpleJWT
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        
        // Guardamos el nuevo access token
        localStorage.setItem('access_token', data.access);
        
        // Despachamos la cola pendiente con el nuevo token
        processQueue(null, data.access);
        
        // Reintentamos la petición original que había fallado con 401
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Si el refresh token también expiró o fue revocado
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
