"""Repositorio de acceso a datos para `notificaciones` e `historial`."""
from typing import Optional

from app.core.database import get_cursor

_SELECT_NOTIFICACIONES = """
    SELECT n.id_notificacion, n.id_tarea, t.titulo AS titulo_tarea,
           n.fecha, n.texto, n.activa, n.periodicidad
    FROM notificaciones n
    JOIN tareas t ON t.id_tarea = n.id_tarea
"""


def crear(id_tarea: int, fecha, texto: str, periodicidad: str) -> dict:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO notificaciones (id_tarea, fecha, texto, periodicidad)
            VALUES (%s, %s, %s, %s)
            RETURNING id_notificacion
            """,
            (id_tarea, fecha, texto, periodicidad),
        )
        nueva_id = cur.fetchone()["id_notificacion"]
        cur.execute(_SELECT_NOTIFICACIONES + " WHERE n.id_notificacion = %s", (nueva_id,))
        return cur.fetchone()


def listar_por_usuario(id_usuario: int, solo_activas: bool = True) -> list[dict]:
    """Consulta multitabla: notificaciones + tareas + usuario."""
    condicion_activa = "AND n.activa = TRUE" if solo_activas else ""
    with get_cursor() as cur:
        cur.execute(
            _SELECT_NOTIFICACIONES
            + f"""
            JOIN usuario u ON u.id_usuario = t.id_usuario
            WHERE u.id_usuario = %s {condicion_activa}
            ORDER BY n.fecha ASC
            """,
            (id_usuario,),
        )
        return cur.fetchall()


def actualizar(id_notificacion: int, campos: dict) -> Optional[dict]:
    if not campos:
        with get_cursor() as cur:
            cur.execute(_SELECT_NOTIFICACIONES + " WHERE n.id_notificacion = %s", (id_notificacion,))
            return cur.fetchone()

    columnas = ", ".join(f"{clave} = %s" for clave in campos)
    valores = list(campos.values()) + [id_notificacion]

    with get_cursor(commit=True) as cur:
        cur.execute(f"UPDATE notificaciones SET {columnas} WHERE id_notificacion = %s", valores)
        cur.execute(_SELECT_NOTIFICACIONES + " WHERE n.id_notificacion = %s", (id_notificacion,))
        return cur.fetchone()


def eliminar(id_notificacion: int) -> bool:
    with get_cursor(commit=True) as cur:
        cur.execute("DELETE FROM notificaciones WHERE id_notificacion = %s", (id_notificacion,))
        return cur.rowcount > 0


def historial_por_usuario(id_usuario: int) -> list[dict]:
    """Módulo de seguimiento: historial de todas las tareas del usuario,
    consulta multitabla (historial + tareas + usuario)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT h.id_historial, h.id_tarea, t.titulo AS titulo_tarea,
                   h.prioridad, h.estado, h.fecha, h.observacion
            FROM historial h
            JOIN tareas t ON t.id_tarea = h.id_tarea
            JOIN usuario u ON u.id_usuario = t.id_usuario
            WHERE u.id_usuario = %s
            ORDER BY h.fecha DESC
            """,
            (id_usuario,),
        )
        return cur.fetchall()


def historial_por_tarea(id_tarea: int) -> list[dict]:
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT h.id_historial, h.id_tarea, t.titulo AS titulo_tarea,
                   h.prioridad, h.estado, h.fecha, h.observacion
            FROM historial h
            JOIN tareas t ON t.id_tarea = h.id_tarea
            WHERE h.id_tarea = %s
            ORDER BY h.fecha DESC
            """,
            (id_tarea,),
        )
        return cur.fetchall()
