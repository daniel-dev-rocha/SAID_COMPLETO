import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { categoriasApi } from "../api/categoriasApi";
import { tareasApi } from "../api/tareasApi";
import type { Categoria, EstadoTarea, Tarea } from "../types";

interface TasksContextValue {
  tasks: Tarea[];
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  crearTarea: (datos: {
    id_tipo_tarea: number;
    titulo: string;
    descripcion?: string;
    fecha_vencimiento: string;
    prioridad: string;
    estado?: string;
  }) => Promise<void>;
  editarTarea: (id: number, datos: Partial<Tarea>) => Promise<void>;
  cambiarEstado: (id: number, estado: EstadoTarea) => Promise<void>;
  eliminarTarea: (id: number) => Promise<void>;
  crearCategoria: (descripcion: string, color: string) => Promise<Categoria>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tareasData, categoriasData] = await Promise.all([
        tareasApi.listar(),
        categoriasApi.listar(),
      ]);
      setTasks(tareasData);
      setCategorias(categoriasData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con el backend de SAID.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const crearTarea: TasksContextValue["crearTarea"] = useCallback(
    async (datos) => {
      await tareasApi.crear(datos);
      await refresh();
    },
    [refresh]
  );

  const editarTarea = useCallback(
    async (id: number, datos: Partial<Tarea>) => {
      await tareasApi.actualizar(id, datos);
      await refresh();
    },
    [refresh]
  );

  const cambiarEstado = useCallback(
    async (id: number, estado: EstadoTarea) => {
      await tareasApi.cambiarEstado(id, estado);
      await refresh();
    },
    [refresh]
  );

  const eliminarTarea = useCallback(
    async (id: number) => {
      await tareasApi.eliminar(id);
      await refresh();
    },
    [refresh]
  );

  const crearCategoria = useCallback(
    async (descripcion: string, color: string) => {
      const nueva = await categoriasApi.crear({ descripcion, color_categoria: color });
      await refresh();
      return nueva;
    },
    [refresh]
  );

  const value: TasksContextValue = {
    tasks,
    categorias,
    loading,
    error,
    refresh,
    crearTarea,
    editarTarea,
    cambiarEstado,
    eliminarTarea,
    crearCategoria,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks debe usarse dentro de <TasksProvider>");
  return ctx;
}
