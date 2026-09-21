import { useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useTasks } from "../../context/TasksContext";
import { DIAS_SEMANA, MESES, diasEnMes, esMismoDia, primerDiaSemana } from "../../utils/dates";

export default function CalendarView() {
  const { tasks } = useTasks();
  const { openNewTask, openDetail } = useModal();

  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1); // 1-12

  const totalDias = diasEnMes(anio, mes);
  const primerDia = primerDiaSemana(anio, mes); // 0=domingo

  const celdas = useMemo(() => {
    const arr: { dia: number; delMes: boolean }[] = [];
    const diasMesAnterior = diasEnMes(mes === 1 ? anio - 1 : anio, mes === 1 ? 12 : mes - 1);
    for (let i = primerDia - 1; i >= 0; i--) arr.push({ dia: diasMesAnterior - i, delMes: false });
    for (let d = 1; d <= totalDias; d++) arr.push({ dia: d, delMes: true });
    while (arr.length % 7 !== 0) arr.push({ dia: arr.length - totalDias - primerDia + 1, delMes: false });
    return arr;
  }, [anio, mes, primerDia, totalDias]);

  const tareasDelDia = (dia: number) =>
    tasks.filter((t) => esMismoDia(t.fecha_vencimiento, anio, mes, dia));

  const cambiarMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes > 12) { nuevoMes = 1; nuevoAnio++; }
    if (nuevoMes < 1) { nuevoMes = 12; nuevoAnio--; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const esHoy = (dia: number, delMes: boolean) =>
    delMes && dia === hoy.getDate() && mes === hoy.getMonth() + 1 && anio === hoy.getFullYear();

  return (
    <div className="view">
      <div className="cal-main">
        <div className="cal-hdr">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => cambiarMes(-1)}>‹</button>
            <div className="cal-month">{MESES[mes - 1]} {anio}</div>
            <button className="cal-nav-btn" onClick={() => cambiarMes(1)}>›</button>
          </div>
          <button className="btn btn-primary" style={{ width: "auto" }} onClick={() => openNewTask()}>
            + Nueva tarea
          </button>
        </div>
        <div className="cal-dow-row">
          {DIAS_SEMANA.map((d) => <div className="cal-dow" key={d}>{d}</div>)}
        </div>
        <div className="cal-grid">
          {celdas.map((celda, idx) => {
            const eventos = celda.delMes ? tareasDelDia(celda.dia) : [];
            return (
              <div
                key={idx}
                className={`cal-cell${esHoy(celda.dia, celda.delMes) ? " today" : ""}${!celda.delMes ? " other-month" : ""}`}
                onClick={() => celda.delMes && openNewTask(`${anio}-${String(mes).padStart(2, "0")}-${String(celda.dia).padStart(2, "0")}`)}
              >
                <div className="day-num">{celda.dia}</div>
                {eventos.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id_tarea}
                    className="ev-chip"
                    style={{ background: `${ev.color_categoria || "#0001F0"}22`, color: ev.color_categoria || "#0001F0" }}
                    onClick={(e) => { e.stopPropagation(); openDetail(ev.id_tarea); }}
                  >
                    {ev.titulo}
                  </span>
                ))}
                {eventos.length > 3 && <span className="more-ev">+{eventos.length - 3} más</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
