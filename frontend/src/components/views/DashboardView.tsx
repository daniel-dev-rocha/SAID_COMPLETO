import { useEffect, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useTasks } from "../../context/TasksContext";
import { tareasApi } from "../../api/tareasApi";
import type { ResumenDashboard, Tarea } from "../../types";
import TaskRow from "../common/TaskRow";

export default function DashboardView() {
  const { tasks, cambiarEstado } = useTasks();
  const { openDetail } = useModal();
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [proximas, setProximas] = useState<Tarea[]>([]);

  useEffect(() => {
    tareasApi.resumenDashboard().then(setResumen).catch(() => setResumen(null));
    tareasApi.proximasAVencer(3).then(setProximas).catch(() => setProximas([]));
  }, [tasks]);

  const pendientes = tasks.filter((t) => t.estado === "pendiente").slice(0, 6);
  const total = resumen?.total || 0;
  const terminadas = resumen?.terminadas || 0;
  const progreso = total > 0 ? Math.round((terminadas / total) * 100) : 0;

  return (
    <div className="view">
      <div className="dash-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--ind-l)", color: "var(--ind)" }}>📋</div>
          </div>
          <div className="stat-num">{resumen?.pendientes ?? "—"}</div>
          <div className="stat-lbl">Tareas pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--amb-l)", color: "var(--amb)" }}>⏳</div>
          </div>
          <div className="stat-num">{resumen?.en_proceso ?? "—"}</div>
          <div className="stat-lbl">En proceso</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "var(--red-l)", color: "var(--red)" }}>⚠️</div>
          </div>
          <div className="stat-num">{resumen?.proximas_3_dias ?? "—"}</div>
          <div className="stat-lbl">Vencen en 3 días</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: "rgba(255,255,255,.2)" }}>🏆</div>
          </div>
          <div className="stat-num">{terminadas}</div>
          <div className="stat-lbl">Tareas terminadas</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progreso}%`, background: "#fff" }} />
          </div>
        </div>
      </div>

      <div className="dash-row">
        <div className="card">
          <div className="card-hdr">
            <div className="card-ttl">Tareas pendientes</div>
          </div>
          {pendientes.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🎉</div>
              <div className="empty-title">¡No tienes tareas pendientes!</div>
            </div>
          ) : (
            pendientes.map((t) => (
              <TaskRow
                key={t.id_tarea}
                tarea={t}
                onClick={() => openDetail(t.id_tarea)}
                onToggle={() => cambiarEstado(t.id_tarea, "terminada")}
              />
            ))
          )}
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-ttl">Próximas a vencer</div>
          </div>
          {proximas.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✅</div>
              <div className="empty-sub">Nada vence en los próximos 3 días.</div>
            </div>
          ) : (
            proximas.map((t) => (
              <div className="upcoming-item" key={t.id_tarea} onClick={() => openDetail(t.id_tarea)}>
                <div className="up-dot" style={{ background: t.color_categoria || "var(--ind)" }} />
                <div className="up-info">
                  <div className="up-name">{t.titulo}</div>
                  <div className="up-meta">{t.categoria}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
