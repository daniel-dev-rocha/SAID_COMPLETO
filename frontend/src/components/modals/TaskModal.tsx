import { useEffect, useState, type FormEvent } from "react";
import { useModal } from "../../context/ModalContext";
import { useTasks } from "../../context/TasksContext";
import { useToast } from "../../context/ToastContext";
import type { EstadoTarea, Prioridad } from "../../types";
import { aDatetimeLocal } from "../../utils/dates";

const COLORES_SUGERIDOS = ["#0001F0", "#FF0000", "#FFF251", "#0F9D58", "#4D4DF5", "#828282"];

export default function TaskModal() {
  const { taskModalOpen, editingTaskId, prefillDate, closeTaskModal } = useModal();
  const { tasks, categorias, crearTarea, editarTarea, crearCategoria } = useTasks();
  const { showToast } = useToast();

  const editingTask = editingTaskId ? tasks.find((t) => t.id_tarea === editingTaskId) : null;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [estado, setEstado] = useState<EstadoTarea>("pendiente");
  const [idCategoria, setIdCategoria] = useState<number | "nueva">("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [colorNuevaCategoria, setColorNuevaCategoria] = useState(COLORES_SUGERIDOS[0]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskModalOpen) return;
    if (editingTask) {
      setTitulo(editingTask.titulo);
      setDescripcion(editingTask.descripcion || "");
      setFecha(aDatetimeLocal(editingTask.fecha_vencimiento));
      setPrioridad(editingTask.prioridad);
      setEstado(editingTask.estado);
      setIdCategoria(editingTask.id_tipo_tarea);
    } else {
      setTitulo("");
      setDescripcion("");
      setFecha(prefillDate ? `${prefillDate}T08:00` : "");
      setPrioridad("media");
      setEstado("pendiente");
      setIdCategoria(categorias[0]?.id_tipo_tarea ?? "");
    }
    setNuevaCategoria("");
    setError(null);
  }, [taskModalOpen, editingTaskId, prefillDate]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!taskModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !fecha) {
      setError("El título y la fecha de vencimiento son obligatorios.");
      return;
    }

    setGuardando(true);
    try {
      let categoriaId = idCategoria;

      if (categoriaId === "nueva") {
        if (!nuevaCategoria.trim()) {
          setError("Escribe el nombre de la nueva categoría.");
          setGuardando(false);
          return;
        }
        const nueva = await crearCategoria(nuevaCategoria.trim(), colorNuevaCategoria);
        categoriaId = nueva.id_tipo_tarea;
      }

      if (!categoriaId) {
        setError("Selecciona o crea una categoría.");
        setGuardando(false);
        return;
      }

      const fechaISO = new Date(fecha).toISOString();

      if (editingTask) {
        await editarTarea(editingTask.id_tarea, {
          id_tipo_tarea: categoriaId as number,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          fecha_vencimiento: fechaISO,
          prioridad,
          estado,
        });
        showToast("Tarea actualizada correctamente.");
      } else {
        await crearTarea({
          id_tipo_tarea: categoriaId as number,
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || undefined,
          fecha_vencimiento: fechaISO,
          prioridad,
        });
        showToast("Tarea creada correctamente.");
      }
      closeTaskModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la tarea.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={closeTaskModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hdr">
          <div className="modal-ttl">{editingTask ? "Editar tarea" : "Nueva tarea"}</div>
          <button className="modal-close" onClick={closeTaskModal}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: "var(--red-l)", color: "var(--red)", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Título *</label>
              <input className="form-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha y hora de vencimiento *</label>
                <input
                  className="form-input"
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="form-select" value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value === "nueva" ? "nueva" : Number(e.target.value))}
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id_tipo_tarea} value={c.id_tipo_tarea}>{c.descripcion}</option>
                  ))}
                  <option value="nueva">+ Crear nueva categoría</option>
                </select>
              </div>
              {editingTask && (
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value as EstadoTarea)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="terminada">Terminada</option>
                  </select>
                </div>
              )}
            </div>

            {idCategoria === "nueva" && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre de la nueva categoría</label>
                  <input className="form-input" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="color-row">
                    {COLORES_SUGERIDOS.map((c) => (
                      <div
                        key={c}
                        className={`c-dot${colorNuevaCategoria === c ? " selected" : ""}`}
                        style={{ background: c }}
                        onClick={() => setColorNuevaCategoria(c)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeTaskModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ width: "auto" }} disabled={guardando}>
              {guardando ? "Guardando..." : editingTask ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
