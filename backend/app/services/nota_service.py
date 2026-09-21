"""Reglas de negocio del módulo Notas (comentarios dentro de una tarea)."""
from app.repositories import nota_repository
from app.services.tarea_service import obtener_validando_dueno


def crear(id_usuario: int, id_tarea: int, nota: str) -> dict:
    obtener_validando_dueno(id_usuario, id_tarea)
    return nota_repository.crear(id_tarea, nota)


def listar(id_usuario: int, id_tarea: int) -> list[dict]:
    obtener_validando_dueno(id_usuario, id_tarea)
    return nota_repository.listar_por_tarea(id_tarea)


def eliminar(id_usuario: int, id_tarea: int, id_nota: int) -> None:
    obtener_validando_dueno(id_usuario, id_tarea)
    nota_repository.eliminar(id_nota)
