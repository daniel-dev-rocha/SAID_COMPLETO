import { apiClient } from "./client";
import type { Categoria } from "../types";

export const categoriasApi = {
  listar: () => apiClient.get<Categoria[]>("/api/categorias").then((r) => r.data),

  crear: (datos: { descripcion: string; color_categoria: string }) =>
    apiClient.post<Categoria>("/api/categorias", datos).then((r) => r.data),

  actualizar: (id: number, datos: Partial<{ descripcion: string; color_categoria: string }>) =>
    apiClient.put<Categoria>(`/api/categorias/${id}`, datos).then((r) => r.data),

  eliminar: (id: number) => apiClient.delete(`/api/categorias/${id}`).then(() => undefined),
};
