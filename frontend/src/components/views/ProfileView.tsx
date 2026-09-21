import { useState, type FormEvent } from "react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TasksContext";
import { useToast } from "../../context/ToastContext";

export default function ProfileView() {
  const { usuario, actualizarUsuario } = useAuth();
  const { tasks, categorias } = useTasks();
  const { showToast } = useToast();

  const [nombre, setNombre] = useState(usuario?.nombre_usuario || "");
  const [apellido, setApellido] = useState(usuario?.apellido_usuario || "");
  const [correo, setCorreo] = useState(usuario?.correo_usuario || "");
  const [guardando, setGuardando] = useState(false);

  if (!usuario) return null;

  const terminadas = tasks.filter((t) => t.estado === "terminada").length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const actualizado = await authApi.actualizarPerfil({
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        correo_usuario: correo,
      });
      actualizarUsuario(actualizado);
      showToast("Perfil actualizado correctamente.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="view">
      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-banner" />
          <div className="profile-av">{nombre[0]}{apellido[0]}</div>
          <div className="profile-info">
            <div className="profile-name">{nombre} {apellido}</div>
            <div className="profile-role">{usuario.rol === "administrador" ? "Administrador" : "Estudiante"}</div>
            <div className="profile-stats">
              <div className="p-stat">
                <div className="p-stat-num">{tasks.length}</div>
                <div className="p-stat-lbl">Tareas</div>
              </div>
              <div className="p-stat">
                <div className="p-stat-num">{categorias.length}</div>
                <div className="p-stat-lbl">Categorías</div>
              </div>
              <div className="p-stat">
                <div className="p-stat-num">{terminadas}</div>
                <div className="p-stat-lbl">Completadas</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr"><div className="card-ttl">Editar información</div></div>
          <form onSubmit={handleSubmit} style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input className="form-input" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Correo</label>
              <input className="form-input" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: "auto", alignSelf: "flex-start" }} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
