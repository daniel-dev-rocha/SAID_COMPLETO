import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { clearToken, getToken, setToken } from "../api/client";
import type { Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  cargandoSesion: boolean;
  login: (correo_usuario: string, contrasena: string) => Promise<void>;
  registrar: (datos: {
    nombre_usuario: string;
    apellido_usuario: string;
    correo_usuario: string;
    contrasena: string;
  }) => Promise<void>;
  logout: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargandoSesion(false);
      return;
    }
    authApi
      .perfil()
      .then(setUsuario)
      .catch(() => clearToken())
      .finally(() => setCargandoSesion(false));
  }, []);

  const login = useCallback(async (correo_usuario: string, contrasena: string) => {
    const respuesta = await authApi.login({ correo_usuario, contrasena });
    setToken(respuesta.access_token);
    setUsuario(respuesta.usuario);
  }, []);

  const registrar = useCallback(
    async (datos: {
      nombre_usuario: string;
      apellido_usuario: string;
      correo_usuario: string;
      contrasena: string;
    }) => {
      const respuesta = await authApi.registrar(datos);
      setToken(respuesta.access_token);
      setUsuario(respuesta.usuario);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
  }, []);

  const value: AuthContextValue = {
    usuario,
    isAuthenticated: !!usuario,
    cargandoSesion,
    login,
    registrar,
    logout,
    actualizarUsuario: setUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
