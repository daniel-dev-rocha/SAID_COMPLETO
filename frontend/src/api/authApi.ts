import { apiClient } from "./client";
import type { SesionRespuesta, Usuario } from "../types";

export const authApi = {
  registrar: (datos: {
    nombre_usuario: string;
    apellido_usuario: string;
    correo_usuario: string;
    contrasena: string;
  }) => apiClient.post<SesionRespuesta>("/api/auth/registro", datos).then((r) => r.data),

  login: (datos: { correo_usuario: string; contrasena: string }) =>
    apiClient.post<SesionRespuesta>("/api/auth/login", datos).then((r) => r.data),

  perfil: () => apiClient.get<Usuario>("/api/auth/perfil").then((r) => r.data),

  actualizarPerfil: (datos: Partial<Pick<Usuario, "nombre_usuario" | "apellido_usuario" | "correo_usuario">>) =>
    apiClient.put<Usuario>("/api/auth/perfil", datos).then((r) => r.data),
};
