import { apiClient } from "./client";
import type { EstadoTarea, Nota, ResumenDashboard, Tarea } from "../types";

export interface FiltrosTareas {
  estado?: string;
  prioridad?: string;
  id_tipo_tarea?: number;
  buscar?: string;
}

export const tareasApi = {
  listar: (filtros: FiltrosTareas = {}) =>
    apiClient.get<Tarea[]>("/api/tareas", { params: filtros }).then((r) => r.data),

  consultar: (id: number) => apiClient.get<Tarea>(`/api/tareas/${id}`).then((r) => r.data),

  crear: (datos: {
    id_tipo_tarea: number;
    titulo: string;
    descripcion?: string;
    fecha_vencimiento: string;
    prioridad: string;
    estado?: string;
  }) => apiClient.post<Tarea>("/api/tareas", datos).then((r) => r.data),

  actualizar: (id: number, datos: Partial<Tarea>) =>
    apiClient.put<Tarea>(`/api/tareas/${id}`, datos).then((r) => r.data),

  cambiarEstado: (id: number, estado: EstadoTarea, observacion?: string) =>
    apiClient.patch<Tarea>(`/api/tareas/${id}/estado`, { estado, observacion }).then((r) => r.data),

  eliminar: (id: number) => apiClient.delete(`/api/tareas/${id}`).then(() => undefined),

  calendario: (anio: number, mes: number) =>
    apiClient.get<Tarea[]>("/api/tareas/calendario", { params: { anio, mes } }).then((r) => r.data),

  resumenDashboard: () =>
    apiClient.get<ResumenDashboard>("/api/tareas/dashboard/resumen").then((r) => r.data),

  proximasAVencer: (dias = 3) =>
    apiClient.get<Tarea[]>("/api/tareas/recordatorios/proximos", { params: { dias } }).then((r) => r.data),

  listarNotas: (idTarea: number) => apiClient.get<Nota[]>(`/api/tareas/${idTarea}/notas`).then((r) => r.data),

  crearNota: (idTarea: number, nota: string) =>
    apiClient.post<Nota>(`/api/tareas/${idTarea}/notas`, { nota }).then((r) => r.data),

  eliminarNota: (idTarea: number, idNota: number) =>
    apiClient.delete(`/api/tareas/${idTarea}/notas/${idNota}`).then(() => undefined),
};
