import { Outlet } from "react-router-dom";
import { useTasks } from "../../context/TasksContext";
import { useModal } from "../../context/ModalContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import TaskModal from "../modals/TaskModal";
import EventDetailModal from "../modals/EventDetailModal";

export default function AppLayout() {
  const { loading, error } = useTasks();
  const { openNewTask } = useModal();

  return (
    <div className="app-layout active">
      <Sidebar />
      <main className="main">
        <Topbar onNewTask={() => openNewTask()} />
        <div className="content">
          {error && (
            <div
              style={{
                background: "var(--red-l)",
                color: "var(--red)",
                padding: "12px 16px",
                borderRadius: 10,
                marginBottom: 14,
                fontSize: 13,
              }}
            >
              ⚠️ No se pudo conectar con el backend de SAID ({error}). Verifica que el servidor esté
              corriendo en la URL configurada en VITE_API_URL.
            </div>
          )}
          {loading ? (
            <div className="empty">
              <div className="empty-icon">⏳</div>
              <div className="empty-title">Cargando datos de SAID...</div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      <TaskModal />
      <EventDetailModal />
    </div>
  );
}
