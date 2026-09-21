import type { Tarea } from "../../types";
import { estaVencida, formatoConHora } from "../../utils/dates";
import { PriorityBadge } from "./Badges";

interface Props {
  tarea: Tarea;
  onToggle: () => void;
  onClick: () => void;
}

export default function TaskRow({ tarea, onToggle, onClick }: Props) {
  const done = tarea.estado === "terminada";
  const vencida = estaVencida(tarea.fecha_vencimiento, tarea.estado);

  return (
    <div className="task-row" onClick={onClick}>
      <div
        className={`task-check${done ? " done" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {done ? "✓" : ""}
      </div>
      <div className="task-text">
        <div className={`task-name${done ? " done" : ""}`}>{tarea.titulo}</div>
        <div className="task-meta">
          {tarea.categoria || "Sin categoría"} · {formatoConHora(tarea.fecha_vencimiento)}
          {vencida ? " · Vencida" : ""}
        </div>
      </div>
      <PriorityBadge prioridad={tarea.prioridad} />
    </div>
  );
}
