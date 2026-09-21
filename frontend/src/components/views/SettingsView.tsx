import { useState } from "react";
import { categoriasApi } from "../../api/categoriasApi";
import { useTasks } from "../../context/TasksContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";

const COLORES_SUGERIDOS = ["#0001F0", "#FF0000", "#FFF251", "#0F9D58", "#4D4DF5", "#828282"];

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const { categorias, refresh } = useTasks();
  const { showToast } = useToast();

  const [nombreCategoria, setNombreCategoria] = useState("");
  const [color, setColor] = useState(COLORES_SUGERIDOS[0]);

  const crearCategoria = async () => {
    if (!nombreCategoria.trim()) return;
    try {
      await categoriasApi.crear({ descripcion: nombreCategoria.trim(), color_categoria: color });
      setNombreCategoria("");
      await refresh();
      showToast("Categoría creada.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    }
  };

  const eliminarCategoria = async (id: number) => {
    if (!confirm("¿Eliminar esta categoría? También se eliminarán sus tareas asociadas.")) return;
    try {
      await categoriasApi.eliminar(id);
      await refresh();
      showToast("Categoría eliminada.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
    }
  };

  return (
    <div className="view">
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-hdr"><div className="card-ttl">Apariencia</div></div>
        <div style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--g900)" }}>Modo oscuro</div>
            <div style={{ fontSize: 12, color: "var(--g500)" }}>Cambia la apariencia de toda la aplicación.</div>
          </div>
          <button className={`toggle ${theme === "dark" ? "on" : "off"}`} onClick={toggleTheme} />
        </div>
      </div>

      <div className="card">
        <div className="card-hdr"><div className="card-ttl">Categorías</div></div>
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              className="form-input"
              style={{ maxWidth: 220 }}
              placeholder="Nombre de la categoría"
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
            />
            <div className="color-row">
              {COLORES_SUGERIDOS.map((c) => (
                <div key={c} className={`c-dot${color === c ? " selected" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: "auto" }} onClick={crearCategoria}>+ Crear</button>
          </div>

          {categorias.length === 0 ? (
            <div className="empty-sub">Aún no has creado categorías.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categorias.map((c) => (
                <div key={c.id_tipo_tarea} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--g50)", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: c.color_categoria, display: "inline-block" }} />
                    <span style={{ fontSize: 13 }}>{c.descripcion}</span>
                    <span style={{ fontSize: 11, color: "var(--g400)" }}>({c.total_tareas ?? 0} tareas)</span>
                  </div>
                  <button className="act-btn" onClick={() => eliminarCategoria(c.id_tipo_tarea)}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
