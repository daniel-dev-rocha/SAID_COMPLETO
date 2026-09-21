// Tipos que reflejan exactamente los esquemas Pydantic del backend
// (ver backend/app/schemas/*.py), para que el frontend y el backend
// nunca se desincronicen sobre la forma de los datos.

export type Rol = "estudiante" | "administrador";
export type EstadoUsuario = "activo" | "inactivo";
export type Prioridad = "alta" | "media" | "baja";
export type EstadoTarea = "pendiente" | "en_proceso" | "terminada";

export interface Usuario {
  id_usuario: number;
  rol: Rol;
  nombre_usuario: string;
  apellido_usuario: string;
  correo_usuario: string;
  fecha_registro: string;
  estado: EstadoUsuario;
}

export interface SesionRespuesta {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Categoria {
  id_tipo_tarea: number;
  descripcion: string;
  color_categoria: string;
  fecha_creacion: string;
  id_usuario: number;
  total_tareas?: number;
}

export interface Tarea {
  id_tarea: number;
  id_usuario: number;
  id_tipo_tarea: number;
  categoria?: string;
  color_categoria?: string;
  titulo: string;
  descripcion?: string | null;
  fecha_hora: string;
  fecha_vencimiento: string;
  fecha_actualizacion: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
}

export interface Nota {
  id_nota: number;
  id_tarea: number;
  nota: string;
  fecha_creacion: string;
}

export interface Notificacion {
  id_notificacion: number;
  id_tarea: number;
  titulo_tarea?: string;
  fecha: string;
  texto: string;
  activa: boolean;
  periodicidad: "una_vez" | "diaria" | "semanal";
}

export interface RegistroHistorial {
  id_historial: number;
  id_tarea: number;
  titulo_tarea?: string;
  prioridad: Prioridad;
  estado: EstadoTarea;
  fecha: string;
  observacion?: string | null;
}

export interface ResumenDashboard {
  pendientes: number;
  en_proceso: number;
  terminadas: number;
  proximas_3_dias: number;
  total: number;
}

export interface TareaFormValues {
  id_tipo_tarea: number;
  titulo: string;
  descripcion: string;
  fecha_vencimiento: string; // formato datetime-local del input HTML
  prioridad: Prioridad;
  estado: EstadoTarea;
}
