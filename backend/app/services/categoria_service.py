"""Reglas de negocio del módulo Categoría (tipo_tarea)."""
from fastapi import HTTPException, status

from app.repositories import categoria_repository
from app.schemas.categoria_schema import CategoriaActualizar, CategoriaCrear


def crear(id_usuario: int, datos: CategoriaCrear) -> dict:
    return categoria_repository.crear(datos.descripcion, datos.color_categoria, id_usuario)


def listar(id_usuario: int) -> list[dict]:
    return categoria_repository.listar_por_usuario(id_usuario)


def actualizar(id_usuario: int, id_tipo_tarea: int, datos: CategoriaActualizar) -> dict:
    categoria = _obtener_validando_dueno(id_usuario, id_tipo_tarea)
    campos = {clave: valor for clave, valor in datos.model_dump().items() if valor is not None}
    return categoria_repository.actualizar(id_tipo_tarea, campos) or categoria


def eliminar(id_usuario: int, id_tipo_tarea: int) -> None:
    _obtener_validando_dueno(id_usuario, id_tipo_tarea)
    categoria_repository.eliminar(id_tipo_tarea)


def _obtener_validando_dueno(id_usuario: int, id_tipo_tarea: int) -> dict:
    categoria = categoria_repository.obtener_por_id(id_tipo_tarea)
    if categoria is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada.")
    if categoria["id_usuario"] != id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Esta categoría no te pertenece.")
    return categoria
