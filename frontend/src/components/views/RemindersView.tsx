import { useEffect, useState } from "react";
import { tareasApi } from "../../api/tareasApi";
import { useModal } from "../../context/ModalContext";
import type { Tarea } from "../../types";
import { formatoConHora } from "../../utils/dates";

export default function RemindersView() {
  const [dias, setDias] = useState(3);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const { openDetail } = useModal();

  useEffect(() => {
    setCargando(true);
    tareasApi.proximasAVencer(dias).then(setTareas).finally(() => setCargando(false));
  }, [dias]);

  return (
    <div className="view">
      <div className="tasks-toolbar">
        <span style={{ fontSize: 13, color: "var(--g600)" }}>Mostrar tareas que vencen en los próximos:</span>
        {[1, 3, 7, 15].map((d) => (
          <button
            key={d}
            className={`filter-btn${dias === d ? " active" : ""}`}
            onClick={() => setDias(d)}
          >
            {d} día{d > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="empty"><div className="empty-icon">⏳</div><div className="empty-title">Cargando recordatorios...</div></div>
      ) : tareas.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎉</div>
          <div className="empty-title">No tienes tareas próximas a vencer.</div>
        </div>
      ) : (
        <div className="reminders-grid">
          {tareas.map((t) => (
            <div className="reminder-card" key={t.id_tarea} onClick={() => openDetail(t.id_tarea)} style={{ cursor: "pointer" }}>
              <div className="rem-icon" style={{ background: `${t.color_categoria || "#0001F0"}22`, color: t.color_categoria || "#0001F0" }}>
                🔔
              </div>
              <div className="rem-info">
                <div className="rem-title">{t.titulo}</div>
                <div className="rem-sub">{t.categoria || "Sin categoría"}</div>
                <span className="rem-time">{formatoConHora(t.fecha_vencimiento)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
