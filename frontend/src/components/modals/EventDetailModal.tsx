import { useEffect, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useTasks } from "../../context/TasksContext";
import { useToast } from "../../context/ToastContext";
import { tareasApi } from "../../api/tareasApi";
import type { Nota } from "../../types";
import { formatoConHora } from "../../utils/dates";
import { PriorityBadge, StatusBadge } from "../common/Badges";
import { estaVencida } from "../../utils/dates";

export default function EventDetailModal() {
  const { detailOpen, detailTaskId, closeDetail, openEditTask } = useModal();
  const { tasks, cambiarEstado, eliminarTarea } = useTasks();
  const { showToast } = useToast();

  const tarea = detailTaskId ? tasks.find((t) => t.id_tarea === detailTaskId) : null;

  const [notas, setNotas] = useState<Nota[]>([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const [cargandoNotas, setCargandoNotas] = useState(false);

  useEffect(() => {
    if (!detailOpen || !detailTaskId) return;
    setCargandoNotas(true);
    tareasApi
      .listarNotas(detailTaskId)
      .then(setNotas)
      .catch(() => setNotas([]))
      .finally(() => setCargandoNotas(false));
  }, [detailOpen, detailTaskId]);

  if (!detailOpen || !tarea) return null;

  const vencida = estaVencida(tarea.fecha_vencimiento, tarea.estado);

  const handleAgregarNota = async () => {
    if (!nuevaNota.trim() || !detailTaskId) return;
    try {
      const nota = await tareasApi.crearNota(detailTaskId, nuevaNota.trim());
      setNotas((prev) => [nota, ...prev]);
      setNuevaNota("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo agregar la nota.");
    }
  };

  const handleEliminar = async () => {
    if (!confirm("¿Eliminar esta tarea? Esta acción no se puede deshacer.")) return;
    await eliminarTarea(tarea.id_tarea);
    showToast("Tarea eliminada.");
    closeDetail();
  };

  const handleCompletar = async () => {
    await cambiarEstado(tarea.id_tarea, tarea.estado === "terminada" ? "pendiente" : "terminada");
  };

  return (
    <div className="modal-overlay open" onClick={closeDetail}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="ev-detail-hdr">
          <span
            className="ev-type-badge"
            style={{ background: `${tarea.color_categoria || "#0001F0"}22`, color: tarea.color_categoria || "#0001F0" }}
          >
            {tarea.categoria || "Sin categoría"}
          </span>
          <div className="ev-detail-title">{tarea.titulo}</div>
          <div className="ev-meta-row">
            <PriorityBadge prioridad={tarea.prioridad} />
            <StatusBadge estado={tarea.estado} vencida={vencida} />
          </div>
        </div>
        <div className="ev-detail-body">
          <div>
            <div className="d-lbl">Descripción</div>
            <div className="d-val">{tarea.descripcion || "Sin descripción."}</div>
          </div>
          <div>
            <div className="d-lbl">Fecha de vencimiento</div>
            <div className="d-val">{formatoConHora(tarea.fecha_vencimiento)}</div>
          </div>

          <div>
            <div className="d-lbl">Notas</div>
            {cargandoNotas ? (
              <div className="d-val">Cargando notas...</div>
            ) : notas.length === 0 ? (
              <div className="d-val">Aún no hay notas para esta tarea.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {notas.map((n) => (
                  <div key={n.id_nota} style={{ background: "var(--g50)", borderRadius: 8, padding: "8px 10px", fontSize: 12 }}>
                    {n.nota}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <input
                className="form-input"
                placeholder="Escribe una nota..."
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAgregarNota()}
              />
              <button type="button" className="btn btn-ghost" onClick={handleAgregarNota}>Agregar</button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleEliminar}>Eliminar</button>
          <button className="btn btn-ghost" onClick={() => { closeDetail(); openEditTask(tarea.id_tarea); }}>Editar</button>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={handleCompletar}>
            {tarea.estado === "terminada" ? "Marcar pendiente" : "Marcar completada"}
          </button>
        </div>
      </div>
    </div>
  );
}
