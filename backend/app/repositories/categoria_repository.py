"""Repositorio de acceso a datos para `tipo_tarea` (módulo Categoría)."""
from typing import Optional

from app.core.database import get_cursor


def crear(descripcion: str, color_categoria: str, id_usuario: int) -> dict:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO tipo_tarea (descripcion, color_categoria, id_usuario)
            VALUES (%s, %s, %s)
            RETURNING id_tipo_tarea, descripcion, color_categoria, fecha_creacion, id_usuario
            """,
            (descripcion, color_categoria, id_usuario),
        )
        return cur.fetchone()


def listar_por_usuario(id_usuario: int) -> list[dict]:
    """Lista las categorías del usuario junto con la cantidad de tareas
    que tiene cada una (consulta multitabla: tipo_tarea + tareas)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT c.id_tipo_tarea, c.descripcion, c.color_categoria,
                   c.fecha_creacion, c.id_usuario,
                   COUNT(t.id_tarea) AS total_tareas
            FROM tipo_tarea c
            LEFT JOIN tareas t ON t.id_tipo_tarea = c.id_tipo_tarea
            WHERE c.id_usuario = %s
            GROUP BY c.id_tipo_tarea
            ORDER BY c.descripcion ASC
            """,
            (id_usuario,),
        )
        return cur.fetchall()


def obtener_por_id(id_tipo_tarea: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM tipo_tarea WHERE id_tipo_tarea = %s", (id_tipo_tarea,))
        return cur.fetchone()


def actualizar(id_tipo_tarea: int, campos: dict) -> Optional[dict]:
    if not campos:
        return obtener_por_id(id_tipo_tarea)

    columnas = ", ".join(f"{clave} = %s" for clave in campos)
    valores = list(campos.values()) + [id_tipo_tarea]

    with get_cursor(commit=True) as cur:
        cur.execute(
            f"UPDATE tipo_tarea SET {columnas} WHERE id_tipo_tarea = %s RETURNING *",
            valores,
        )
        return cur.fetchone()


def eliminar(id_tipo_tarea: int) -> bool:
    with get_cursor(commit=True) as cur:
        cur.execute("DELETE FROM tipo_tarea WHERE id_tipo_tarea = %s", (id_tipo_tarea,))
        return cur.rowcount > 0
