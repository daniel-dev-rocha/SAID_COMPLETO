import type { EstadoTarea, Prioridad } from "../../types";

export function PriorityBadge({ prioridad }: { prioridad: Prioridad }) {
  const clase = prioridad === "alta" ? "p-alta" : prioridad === "media" ? "p-media" : "p-baja";
  const texto = prioridad === "alta" ? "Alta" : prioridad === "media" ? "Media" : "Baja";
  return <span className={`pbadge ${clase}`}>{texto}</span>;
}

export function StatusBadge({ estado, vencida }: { estado: EstadoTarea; vencida?: boolean }) {
  if (vencida) return <span className="status-badge s-venc">Vencida</span>;
  const map: Record<EstadoTarea, { clase: string; texto: string }> = {
    pendiente: { clase: "s-pend", texto: "Pendiente" },
    en_proceso: { clase: "s-prog", texto: "En proceso" },
    terminada: { clase: "s-done", texto: "Terminada" },
  };
  const { clase, texto } = map[estado];
  return <span className={`status-badge ${clase}`}>{texto}</span>;
}

export function CategoryChip({ nombre, color }: { nombre: string; color?: string }) {
  return (
    <span
      className="task-card-subject"
      style={color ? { color, background: `${color}22` } : undefined}
    >
      {nombre}
    </span>
  );
}
