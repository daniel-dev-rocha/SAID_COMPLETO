import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TasksContext";

const NAV_MAIN = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/calendar", icon: "📅", label: "Calendario" },
  { to: "/tasks", icon: "✅", label: "Tareas", badge: "tasks" as const },
];
const NAV_TOOLS = [
  { to: "/reminders", icon: "🔔", label: "Recordatorios", badge: "reminders" as const },
  { to: "/notifications", icon: "📨", label: "Notificaciones", badge: "notif" as const },
  { to: "/tracking", icon: "📊", label: "Seguimiento" },
];
const NAV_ACCOUNT = [
  { to: "/profile", icon: "👤", label: "Perfil" },
  { to: "/settings", icon: "⚙️", label: "Configuración" },
];

interface NavItem {
  to: string;
  icon: string;
  label: string;
  badge?: "tasks" | "reminders" | "notif";
}

function NavButton({ item, pendCount }: { item: NavItem; pendCount: number }) {
  const badgeValue = item.badge === "tasks" ? pendCount : null;
  return (
    <NavLink to={item.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
      <span className="nav-icon">{item.icon}</span>
      {item.label}
      {badgeValue ? <span className="nav-badge">{badgeValue}</span> : null}
    </NavLink>
  );
}

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const pendCount = tasks.filter((t) => t.estado !== "terminada").length;
  const initials = usuario ? `${usuario.nombre_usuario[0]}${usuario.apellido_usuario[0]}` : "SA";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-wrap">
          <div className="logo-icon">📘</div>
          <div>
            <div className="logo-text">SAID</div>
            <div className="logo-sub">Aprendizaje Interactivo Digital</div>
          </div>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="avatar">{initials.toUpperCase()}</div>
        <div>
          <div className="user-name">
            {usuario ? `${usuario.nombre_usuario} ${usuario.apellido_usuario}` : "Usuario"}
          </div>
          <div className="user-role">{usuario?.rol === "administrador" ? "Administrador" : "Estudiante"}</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-sec">Principal</div>
        {NAV_MAIN.map((item) => (
          <NavButton key={item.to} item={item} pendCount={pendCount} />
        ))}
        <div className="nav-sec">Herramientas</div>
        {NAV_TOOLS.map((item) => (
          <NavButton key={item.to} item={item} pendCount={pendCount} />
        ))}
        <div className="nav-sec">Cuenta</div>
        {NAV_ACCOUNT.map((item) => (
          <NavButton key={item.to} item={item} pendCount={pendCount} />
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
