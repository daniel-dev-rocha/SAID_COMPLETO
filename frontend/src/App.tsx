import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { TasksProvider } from "./context/TasksContext";
import { ModalProvider } from "./context/ModalContext";

import LoginScreen from "./components/auth/LoginScreen";
import RegisterScreen from "./components/auth/RegisterScreen";
import AppLayout from "./components/layout/AppLayout";

import DashboardView from "./components/views/DashboardView";
import TasksView from "./components/views/TasksView";
import CalendarView from "./components/views/CalendarView";
import RemindersView from "./components/views/RemindersView";
import NotificationsView from "./components/views/NotificationsView";
import TrackingView from "./components/views/TrackingView";
import ProfileView from "./components/views/ProfileView";
import SettingsView from "./components/views/SettingsView";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, cargandoSesion } = useAuth();
  if (cargandoSesion) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        Cargando SAID...
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <TasksProvider>
              <ModalProvider>
                <AppLayout />
              </ModalProvider>
            </TasksProvider>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardView />} />
        <Route path="tasks" element={<TasksView />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="reminders" element={<RemindersView />} />
        <Route path="notifications" element={<NotificationsView />} />
        <Route path="tracking" element={<TrackingView />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="settings" element={<SettingsView />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
