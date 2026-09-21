"""
Capa de acceso a la conexión de PostgreSQL usando psycopg2.

Se usa un pool de conexiones (ThreadedConnectionPool) para no abrir/cerrar
una conexión TCP en cada request, y un context manager (`get_cursor`) que
garantiza que la conexión siempre se devuelva al pool -incluso si ocurre
un error- y que los cambios se confirmen (commit) o se reviertan
(rollback) de forma consistente.
"""
from contextlib import contextmanager

import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool

from app.core.config import get_settings

settings = get_settings()

_pool: ThreadedConnectionPool | None = None


def init_pool(minconn: int = 1, maxconn: int = 10) -> None:
    """Crea el pool de conexiones. Se llama una vez al iniciar la app."""
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            minconn,
            maxconn,
            host=settings.db_host,
            port=settings.db_port,
            dbname=settings.db_name,
            user=settings.db_user,
            password=settings.db_password,
        )


def close_pool() -> None:
    """Cierra todas las conexiones del pool. Se llama al apagar la app."""
    global _pool
    if _pool is not None:
        _pool.closeall()
        _pool = None


@contextmanager
def get_cursor(commit: bool = False):
    """
    Entrega un cursor tipo diccionario (cada fila se puede leer como
    fila["columna"]) tomado del pool de conexiones.

    Uso:
        with get_cursor(commit=True) as cur:
            cur.execute("INSERT INTO ...")
    """
    if _pool is None:
        init_pool()

    conn = _pool.getconn()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
    finally:
        _pool.putconn(conn)
