import { createContext, useContext, useState, type ReactNode } from "react";

interface ModalContextValue {
  taskModalOpen: boolean;
  prefillDate: string | null;
  editingTaskId: number | null;
  openNewTask: (date?: string | null) => void;
  openEditTask: (id: number) => void;
  closeTaskModal: () => void;

  detailOpen: boolean;
  detailTaskId: number | null;
  openDetail: (id: number) => void;
  closeDetail: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);

  const openNewTask = (date: string | null = null) => {
    setEditingTaskId(null);
    setPrefillDate(date);
    setTaskModalOpen(true);
  };

  const openEditTask = (id: number) => {
    setEditingTaskId(id);
    setPrefillDate(null);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => setTaskModalOpen(false);

  const openDetail = (id: number) => {
    setDetailTaskId(id);
    setDetailOpen(true);
  };

  const closeDetail = () => setDetailOpen(false);

  const value: ModalContextValue = {
    taskModalOpen,
    prefillDate,
    editingTaskId,
    openNewTask,
    openEditTask,
    closeTaskModal,
    detailOpen,
    detailTaskId,
    openDetail,
    closeDetail,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider>");
  return ctx;
}
