import { useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useTasks } from "../../context/TasksContext";
import { CategoryChip, PriorityBadge, StatusBadge } from "../common/Badges";
import { estaVencida, formatoConHora } from "../../utils/dates";
import type { EstadoTarea, Prioridad } from "../../types";

export default function TasksView() {
  const { tasks, categorias, cambiarEstado, eliminarTarea } = useTasks();
  const { openDetail, openEditTask, openNewTask } = useModal();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | "todas">("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState<Prioridad | "todas">("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<number | "todas">("todas");

  const tareasFiltradas = useMemo(() => {
    return tasks.filter((t) => {
      if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (filtroEstado !== "todas" && t.estado !== filtroEstado) return false;
      if (filtroPrioridad !== "todas" && t.prioridad !== filtroPrioridad) return false;
      if (filtroCategoria !== "todas" && t.id_tipo_tarea !== filtroCategoria) return false;
      return true;
    });
  }, [tasks, busqueda, filtroEstado, filtroPrioridad, filtroCategoria]);

  return (
    <div className="view">
      <div className="tasks-toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            placeholder="Buscar tareas por título..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <select className="filter-btn" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoTarea | "todas")}>
          <option value="todas">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En proceso</option>
          <option value="terminada">Terminada</option>
        </select>

        <select className="filter-btn" value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value as Prioridad | "todas")}>
          <option value="todas">Toda prioridad</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <select
          className="filter-btn"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value === "todas" ? "todas" : Number(e.target.value))}
        >
          <option value="todas">Toda categoría</option>
          {categorias.map((c) => (
            <option key={c.id_tipo_tarea} value={c.id_tipo_tarea}>{c.descripcion}</option>
          ))}
        </select>

        <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => openNewTask()}>
          + Nueva tarea
        </button>
      </div>

      {tareasFiltradas.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🗒️</div>
          <div className="empty-title">No hay tareas que coincidan con estos filtros.</div>
        </div>
      ) : (
        <div className="tasks-grid">
          {tareasFiltradas.map((t) => {
            const vencida = estaVencida(t.fecha_vencimiento, t.estado);
            return (
              <div className="task-card" key={t.id_tarea}>
                <div className="color-bar" style={{ background: t.color_categoria || "var(--ind)" }} />
                <div className="task-card-top">
                  <div className="task-card-header">
                    <div className="task-card-title" onClick={() => openDetail(t.id_tarea)} style={{ cursor: "pointer" }}>
                      {t.titulo}
                    </div>
                    <PriorityBadge prioridad={t.prioridad} />
                  </div>
                  <div className="task-card-body">{t.descripcion || "Sin descripción."}</div>
                  <StatusBadge estado={t.estado} vencida={vencida} />
                </div>
                <div className="task-card-footer">
                  <div className="task-card-date">📅 {formatoConHora(t.fecha_vencimiento)}</div>
                  <CategoryChip nombre={t.categoria || "—"} color={t.color_categoria} />
                </div>
                <div className="task-card-footer">
                  <div className="task-actions">
                    <button className="act-btn" title="Editar" onClick={() => openEditTask(t.id_tarea)}>✏️</button>
                    <button
                      className="act-btn"
                      title={t.estado === "terminada" ? "Marcar pendiente" : "Marcar completada"}
                      onClick={() => cambiarEstado(t.id_tarea, t.estado === "terminada" ? "pendiente" : "terminada")}
                    >
                      ✅
                    </button>
                    <button
                      className="act-btn"
                      title="Eliminar"
                      onClick={() => {
                        if (confirm("¿Eliminar esta tarea?")) eliminarTarea(t.id_tarea);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
