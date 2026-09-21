import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// URL base del backend de SAID (FastAPI). Se toma de la variable de
// entorno VITE_API_URL (ver .env.example); si no está definida, se
// asume que el backend corre en localhost:8000.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_STORAGE_KEY = "said_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Agrega automáticamente el token JWT (si existe) a cada petición.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza los mensajes de error que vienen del backend (FastAPI
// devuelve { detail: "..." }) para mostrarlos directamente en la UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail;
    const mensaje = typeof detail === "string" ? detail : "Ocurrió un error al conectar con el servidor de SAID.";
    return Promise.reject(new Error(mensaje));
  }
);
