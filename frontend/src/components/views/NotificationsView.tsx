import { useEffect, useState } from "react";
import { notificacionesApi } from "../../api/notificacionesApi";
import { useToast } from "../../context/ToastContext";
import type { Notificacion } from "../../types";
import { formatoConHora } from "../../utils/dates";

export default function NotificationsView() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const { showToast } = useToast();

  const cargar = () => {
    setCargando(true);
    notificacionesApi.listar(false).then(setNotificaciones).finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const marcarComoLeida = async (id: number) => {
    try {
      await notificacionesApi.actualizar(id, { activa: false });
      setNotificaciones((prev) => prev.map((n) => (n.id_notificacion === id ? { ...n, activa: false } : n)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo actualizar la notificación.");
    }
  };

  const eliminar = async (id: number) => {
    try {
      await notificacionesApi.eliminar(id);
      setNotificaciones((prev) => prev.filter((n) => n.id_notificacion !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo eliminar la notificación.");
    }
  };

  if (cargando) {
    return <div className="empty"><div className="empty-icon">⏳</div><div className="empty-title">Cargando notificaciones...</div></div>;
  }

  if (notificaciones.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No tienes notificaciones.</div>
        <div className="empty-sub">Se crean automáticamente al programar avisos sobre tus tareas.</div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="notifs-list">
        {notificaciones.map((n) => (
          <div className={`notif-card${n.activa ? " unread" : ""}`} key={n.id_notificacion}>
            <div className="notif-icon2" style={{ background: "var(--ind-l)", color: "var(--ind)" }}>📨</div>
            <div className="notif-body">
              <div className="notif-title">{n.titulo_tarea || "Tarea"}</div>
              <div className="notif-desc">{n.texto}</div>
              <div className="notif-ts">{formatoConHora(n.fecha)} · {n.periodicidad}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {n.activa && (
                <button className="act-btn" title="Marcar como leída" onClick={() => marcarComoLeida(n.id_notificacion)}>✓</button>
              )}
              <button className="act-btn" title="Eliminar" onClick={() => eliminar(n.id_notificacion)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
