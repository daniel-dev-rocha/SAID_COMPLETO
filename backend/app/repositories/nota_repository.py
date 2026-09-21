"""Repositorio de acceso a datos para `notas`."""
from app.core.database import get_cursor


def crear(id_tarea: int, nota: str) -> dict:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO notas (id_tarea, nota)
            VALUES (%s, %s)
            RETURNING id_nota, id_tarea, nota, fecha_creacion
            """,
            (id_tarea, nota),
        )
        return cur.fetchone()


def listar_por_tarea(id_tarea: int) -> list[dict]:
    with get_cursor() as cur:
        cur.execute(
            "SELECT * FROM notas WHERE id_tarea = %s ORDER BY fecha_creacion DESC",
            (id_tarea,),
        )
        return cur.fetchall()


def eliminar(id_nota: int) -> bool:
    with get_cursor(commit=True) as cur:
        cur.execute("DELETE FROM notas WHERE id_nota = %s", (id_nota,))
        return cur.rowcount > 0
