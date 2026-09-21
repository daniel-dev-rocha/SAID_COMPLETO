"""
Capa de acceso a datos (repository) para la tabla `usuario`.

Cada función recibe/devuelve tipos simples (dict, str, int) y ejecuta
SQL parametrizado (nunca se concatenan strings) para evitar inyección
SQL. Esta capa no conoce nada de FastAPI ni de reglas de negocio: solo
sabe hablar con la base de datos.
"""
from typing import Optional

from app.core.database import get_cursor


def crear(nombre_usuario: str, apellido_usuario: str, correo_usuario: str,
          contrasena_hash: str) -> dict:
    with get_cursor(commit=True) as cur:
        cur.execute(
            """
            INSERT INTO usuario (nombre_usuario, apellido_usuario, correo_usuario, contrasena_hash)
            VALUES (%s, %s, %s, %s)
            RETURNING id_usuario, rol, nombre_usuario, apellido_usuario,
                      correo_usuario, fecha_registro, estado, contrasena_hash
            """,
            (nombre_usuario, apellido_usuario, correo_usuario, contrasena_hash),
        )
        return cur.fetchone()


def obtener_por_correo(correo_usuario: str) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM usuario WHERE correo_usuario = %s", (correo_usuario,))
        return cur.fetchone()


def obtener_por_id(id_usuario: int) -> Optional[dict]:
    with get_cursor() as cur:
        cur.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
        return cur.fetchone()


def actualizar(id_usuario: int, campos: dict) -> Optional[dict]:
    """Actualiza dinámicamente solo los campos presentes en `campos`."""
    if not campos:
        return obtener_por_id(id_usuario)

    columnas = ", ".join(f"{clave} = %s" for clave in campos)
    valores = list(campos.values()) + [id_usuario]

    with get_cursor(commit=True) as cur:
        cur.execute(
            f"UPDATE usuario SET {columnas} WHERE id_usuario = %s RETURNING *",
            valores,
        )
        return cur.fetchone()
