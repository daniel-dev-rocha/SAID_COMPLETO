import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const TITULOS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendario",
  "/tasks": "Tareas",
  "/reminders": "Recordatorios",
  "/notifications": "Notificaciones",
  "/tracking": "Seguimiento académico",
  "/profile": "Perfil",
  "/settings": "Configuración",
};

export default function Topbar({ onNewTask }: { onNewTask: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const titulo = TITULOS[location.pathname] || "SAID";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="page-title">{titulo}</span>
      </div>
      <div className="topbar-right">
        <div className="icon-btn" title="Buscar tareas" onClick={() => navigate("/tasks")}>🔍</div>
        <div
          className="icon-btn"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </div>
        <div className="icon-btn" title="Notificaciones" onClick={() => navigate("/notifications")}>🔔</div>
        <div className="icon-btn" title="Perfil" onClick={() => navigate("/profile")}>👤</div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "8px 16px" }} onClick={onNewTask}>
          + Nueva tarea
        </button>
      </div>
    </header>
  );
}
