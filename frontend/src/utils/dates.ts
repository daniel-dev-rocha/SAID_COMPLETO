// Utilidades de fecha compartidas por Calendario, Tareas y Dashboard.

export const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Convierte un ISO string del backend a formato legible corto: "12 sep 2026". */
export function formatoCorto(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

/** Convierte un ISO string a formato legible con hora: "12 sep, 3:30 p. m." */
export function formatoConHora(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Convierte un ISO string a formato aceptado por <input type="datetime-local">. */
export function aDatetimeLocal(iso: string): string {
  const fecha = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(
    fecha.getHours()
  )}:${pad(fecha.getMinutes())}`;
}

/** true si la fecha de vencimiento ya pasó y la tarea no está terminada. */
export function estaVencida(fechaVencimiento: string, estado: string): boolean {
  return estado !== "terminada" && new Date(fechaVencimiento).getTime() < Date.now();
}

export function diasEnMes(anio: number, mes: number): number {
  return new Date(anio, mes, 0).getDate();
}

export function primerDiaSemana(anio: number, mes: number): number {
  return new Date(anio, mes - 1, 1).getDay();
}

export function esMismoDia(iso: string, anio: number, mes: number, dia: number): boolean {
  const fecha = new Date(iso);
  return fecha.getFullYear() === anio && fecha.getMonth() + 1 === mes && fecha.getDate() === dia;
}
