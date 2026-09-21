import { useEffect, useState } from "react";
import { historialApi } from "../../api/notificacionesApi";
import type { RegistroHistorial } from "../../types";
import { formatoConHora } from "../../utils/dates";
import { PriorityBadge, StatusBadge } from "../common/Badges";

export default function TrackingView() {
  const [historial, setHistorial] = useState<RegistroHistorial[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    historialApi.usuario().then(setHistorial).finally(() => setCargando(false));
  }, []);

  const total = historial.length;
  const terminadas = historial.filter((h) => h.estado === "terminada").length;
  const enProceso = historial.filter((h) => h.estado === "en_proceso").length;

  if (cargando) {
    return <div className="empty"><div className="empty-icon">⏳</div><div className="empty-title">Cargando seguimiento...</div></div>;
  }

  return (
    <div className="view">
      <div className="tracking-grid">
        <div className="track-card">
          <div className="track-title">Registros de historial</div>
          <div className="track-pct">{total}</div>
          <div className="track-lbl">Eventos registrados</div>
        </div>
        <div className="track-card">
          <div className="track-title">Cambios a "En proceso"</div>
          <div className="track-pct">{enProceso}</div>
          <div className="track-lbl">Tareas trabajadas activamente</div>
        </div>
        <div className="track-card">
          <div className="track-title">Cambios a "Terminada"</div>
          <div className="track-pct">{terminadas}</div>
          <div className="track-lbl">Tareas completadas en total</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr"><div className="card-ttl">Bitácora de cambios (más reciente primero)</div></div>
        {historial.length === 0 ? (
          <div className="empty"><div className="empty-icon">📊</div><div className="empty-title">Aún no hay historial.</div></div>
        ) : (
          historial.map((h) => (
            <div className="activity-item" key={h.id_historial}>
              <div className="activity-icon" style={{ background: "var(--ind-l)", color: "var(--ind)" }}>📝</div>
              <div style={{ flex: 1 }}>
                <div className="task-name">{h.titulo_tarea}</div>
                <div className="task-meta">{h.observacion} · {formatoConHora(h.fecha)}</div>
              </div>
              <PriorityBadge prioridad={h.prioridad} />
              <StatusBadge estado={h.estado} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
