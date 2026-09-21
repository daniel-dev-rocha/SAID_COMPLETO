"""
Reglas de negocio del módulo Gestión de Tareas (núcleo del MVP).

Aquí viven las validaciones de las historias de usuario HU01-HU09,
manteniendo los routers (capa HTTP) libres de lógica de negocio.
"""
from fastapi import HTTPException, status

from app.repositories import categoria_repository, tarea_repository
from app.schemas.tarea_schema import CambiarEstado, TareaActualizar, TareaCrear


def _validar_categoria_del_usuario(id_usuario: int, id_tipo_tarea: int) -> None:
    categoria = categoria_repository.obtener_por_id(id_tipo_tarea)
    if categoria is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                             detail="La categoría indicada no existe.")
    if categoria["id_usuario"] != id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                             detail="Esa categoría no pertenece al usuario autenticado.")


def obtener_validando_dueno(id_usuario: int, id_tarea: int) -> dict:
    tarea = tarea_repository.obtener_por_id(id_tarea)
    if tarea is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La tarea no existe.")
    if tarea["id_usuario"] != id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Esta tarea no te pertenece.")
    return tarea


def crear(id_usuario: int, datos: TareaCrear) -> dict:
    """HU01: título y fecha de vencimiento son obligatorios (garantizado
    por Pydantic); estado y prioridad usan valores por defecto si se
    omiten (también garantizado por el schema)."""
    _validar_categoria_del_usuario(id_usuario, datos.id_tipo_tarea)
    return tarea_repository.crear(
        id_usuario=id_usuario,
        id_tipo_tarea=datos.id_tipo_tarea,
        titulo=datos.titulo,
        descripcion=datos.descripcion,
        fecha_vencimiento=datos.fecha_vencimiento,
        prioridad=datos.prioridad.value,
        estado=datos.estado.value,
    )


def listar(id_usuario: int, estado: str | None, prioridad: str | None,
           id_tipo_tarea: int | None, buscar: str | None) -> list[dict]:
    """HU02, HU04, HU05."""
    return tarea_repository.listar_por_usuario(id_usuario, estado, prioridad, id_tipo_tarea, buscar)


def obtener_detalle(id_usuario: int, id_tarea: int) -> dict:
    """HU03."""
    return obtener_validando_dueno(id_usuario, id_tarea)


def actualizar(id_usuario: int, id_tarea: int, datos: TareaActualizar) -> dict:
    """HU06."""
    obtener_validando_dueno(id_usuario, id_tarea)

    if datos.id_tipo_tarea is not None:
        _validar_categoria_del_usuario(id_usuario, datos.id_tipo_tarea)

    campos = {}
    for clave, valor in datos.model_dump(exclude_unset=True).items():
        if valor is None:
            continue
        campos[clave] = valor.value if hasattr(valor, "value") else valor

    actualizada = tarea_repository.actualizar(id_tarea, campos)

    if "estado" in campos or "prioridad" in campos:
        tarea_repository.registrar_historial(
            id_tarea, actualizada["prioridad"], actualizada["estado"], "Tarea editada"
        )
    return actualizada


def cambiar_estado(id_usuario: int, id_tarea: int, datos: CambiarEstado) -> dict:
    """HU08: marcar una tarea como completada (o cambiar su estado)."""
    obtener_validando_dueno(id_usuario, id_tarea)
    actualizada = tarea_repository.actualizar(id_tarea, {"estado": datos.estado.value})
    tarea_repository.registrar_historial(
        id_tarea, actualizada["prioridad"], actualizada["estado"],
        datos.observacion or f"Estado cambiado a {datos.estado.value}",
    )
    return actualizada


def eliminar(id_usuario: int, id_tarea: int) -> None:
    """HU07."""
    obtener_validando_dueno(id_usuario, id_tarea)
    tarea_repository.eliminar(id_tarea)


def calendario(id_usuario: int, anio: int, mes: int) -> list[dict]:
    """HU09."""
    return tarea_repository.calendario(id_usuario, anio, mes)


def resumen_dashboard(id_usuario: int) -> dict:
    return tarea_repository.resumen_dashboard(id_usuario)


def proximas_a_vencer(id_usuario: int, dias: int = 3) -> list[dict]:
    return tarea_repository.proximas_a_vencer(id_usuario, dias)
