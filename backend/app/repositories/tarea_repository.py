"""
Repositorio de acceso a datos para `tareas` (núcleo del MVP).

Todas las consultas de lectura hacen JOIN con `tipo_tarea` para poder
devolver el nombre y color de la categoría en una sola consulta
(evitando el problema N+1).
"""
from typing import Optional

from app.core.database import get_cursor

_SELECT_BASE = """
    SELECT t.id_tarea, t.id_usuario, t.id_tipo_tarea,
           c.descripcion AS categoria, c.color_categoria,
           t.titulo, t.descripcion, t.fecha_hora, t.fecha_vencimiento,
           t.fecha_actualizacion, t.prioridad, t.estado
    FROM tareas t
    JOIN tipo_tarea c ON c.id_tipo_tarea = t.id_tipo_tarea
"""


def crear(id_usuario: int, id_tipo_tarea: int, titulo: str, descripcion: Optional[str],
          fecha_vencimiento, prioridad: str, estado: str) -> dict:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO tareas (id_usuario, id_tipo_tarea, titulo, descripcion,
                                 fecha_vencimiento, prioridad, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id_tarea
            """,
            (id_usuario, id_tipo_tarea, titulo, descripcion, fecha_vencimiento, prioridad, estado),
        )
        nueva_id = cur.fetchone()["id_tarea"]

        # Primer registro de historial (auditoría desde la creación)
        cur.execute(
            """
            INSERT INTO historial (id_tarea, prioridad, estado, observacion)
            VALUES (%s, %s, %s, 'Tarea creada')
            """,
            (nueva_id, prioridad, estado),
        )
        cur.execute(_SELECT_BASE + " WHERE t.id_tarea = %s", (nueva_id,))
        return cur.fetchone()


def listar_por_usuario(id_usuario: int, estado: Optional[str] = None,
                        prioridad: Optional[str] = None, id_tipo_tarea: Optional[int] = None,
                        buscar: Optional[str] = None) -> list[dict]:
    """HU02, HU04, HU05: listar tareas del usuario logueado, con filtros
    dinámicos y opcionales de estado/prioridad/categoría/texto."""
    condiciones = ["t.id_usuario = %s"]
    parametros: list = [id_usuario]

    if estado:
        condiciones.append("t.estado = %s")
        parametros.append(estado)
    if prioridad:
        condiciones.append("t.prioridad = %s")
        parametros.append(prioridad)
    if id_tipo_tarea:
        condiciones.append("t.id_tipo_tarea = %s")
        parametros.append(id_tipo_tarea)
    if buscar:
        condiciones.append("t.titulo ILIKE %s")
        parametros.append(f"%{buscar}%")

    query = _SELECT_BASE + " WHERE " + " AND ".join(condiciones) + " ORDER BY t.fecha_vencimiento ASC"

    with get_cursor() as cur:
        cur.execute(query, parametros)
        return cur.fetchall()


def obtener_por_id(id_tarea: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute(_SELECT_BASE + " WHERE t.id_tarea = %s", (id_tarea,))
        return cur.fetchone()


def actualizar(id_tarea: int, campos: dict) -> Optional[dict]:
    """HU06: actualiza dinámicamente solo los campos enviados."""
    if not campos:
        return obtener_por_id(id_tarea)

    columnas = ", ".join(f"{clave} = %s" for clave in campos)
    valores = list(campos.values()) + [id_tarea]

    with get_cursor(commit=True) as cur:
        cur.execute(f"UPDATE tareas SET {columnas} WHERE id_tarea = %s", valores)
        cur.execute(_SELECT_BASE + " WHERE t.id_tarea = %s", (id_tarea,))
        return cur.fetchone()


def registrar_historial(id_tarea: int, prioridad: str, estado: str, observacion: Optional[str]) -> None:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO historial (id_tarea, prioridad, estado, observacion)
            VALUES (%s, %s, %s, %s)
            """,
            (id_tarea, prioridad, estado, observacion),
        )


def eliminar(id_tarea: int) -> bool:
    """HU07: elimina la tarea (notas, notificaciones e historial se
    eliminan en cascada por las llaves foráneas ON DELETE CASCADE)."""
    with get_cursor(commit=True) as cur:
        cur.execute("DELETE FROM tareas WHERE id_tarea = %s", (id_tarea,))
        return cur.rowcount > 0


def calendario(id_usuario: int, anio: int, mes: int) -> list[dict]:
    """HU09: tareas del usuario dentro de un mes/año dado, para pintarlas
    en el calendario."""
    with get_cursor() as cur:
        cur.execute(
            _SELECT_BASE
            + """
            WHERE t.id_usuario = %s
              AND EXTRACT(YEAR FROM t.fecha_vencimiento) = %s
              AND EXTRACT(MONTH FROM t.fecha_vencimiento) = %s
            ORDER BY t.fecha_vencimiento ASC
            """,
            (id_usuario, anio, mes),
        )
        return cur.fetchall()


def resumen_dashboard(id_usuario: int) -> dict:
    """Consulta agregada usada por el Dashboard (multitabla + agregación)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE estado = 'pendiente')  AS pendientes,
                COUNT(*) FILTER (WHERE estado = 'en_proceso') AS en_proceso,
                COUNT(*) FILTER (WHERE estado = 'terminada')  AS terminadas,
                COUNT(*) FILTER (
                    WHERE fecha_vencimiento BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 day'
                    AND estado <> 'terminada'
                ) AS proximas_3_dias,
                COUNT(*) AS total
            FROM tareas
            WHERE id_usuario = %s
            """,
            (id_usuario,),
        )
        return cur.fetchone()


def proximas_a_vencer(id_usuario: int, dias: int = 3) -> list[dict]:
    """Módulo Recordatorios: tareas no terminadas próximas a vencer."""
    with get_cursor() as cur:
        cur.execute(
            _SELECT_BASE
            + """
            WHERE t.id_usuario = %s
              AND t.estado <> 'terminada'
              AND t.fecha_vencimiento BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + (%s || ' day')::interval
            ORDER BY t.fecha_vencimiento ASC
            """,
            (id_usuario, dias),
        )
        return cur.fetchall()
