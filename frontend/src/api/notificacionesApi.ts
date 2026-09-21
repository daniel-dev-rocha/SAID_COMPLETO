import { apiClient } from "./client";
import type { Notificacion, RegistroHistorial } from "../types";

export const notificacionesApi = {
  listar: (soloActivas = true) =>
    apiClient
      .get<Notificacion[]>("/api/notificaciones", { params: { solo_activas: soloActivas } })
      .then((r) => r.data),

  crear: (datos: { id_tarea: number; fecha: string; texto: string; periodicidad?: string }) =>
    apiClient.post<Notificacion>("/api/notificaciones", datos).then((r) => r.data),

  actualizar: (id: number, datos: Partial<{ texto: string; activa: boolean }>) =>
    apiClient.put<Notificacion>(`/api/notificaciones/${id}`, datos).then((r) => r.data),

  eliminar: (id: number) => apiClient.delete(`/api/notificaciones/${id}`).then(() => undefined),
};

export const historialApi = {
  usuario: () => apiClient.get<RegistroHistorial[]>("/api/historial").then((r) => r.data),
  tarea: (idTarea: number) =>
    apiClient.get<RegistroHistorial[]>(`/api/historial/tarea/${idTarea}`).then((r) => r.data),
};
