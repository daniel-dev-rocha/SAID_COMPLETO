"""Reglas de negocio de Notificaciones e Historial (seguimiento)."""
from fastapi import HTTPException, status

from app.repositories import notificacion_repository
from app.schemas.notificacion_schema import NotificacionActualizar, NotificacionCrear
from app.services.tarea_service import obtener_validando_dueno


def crear(id_usuario: int, datos: NotificacionCrear) -> dict:
    obtener_validando_dueno(id_usuario, datos.id_tarea)
    return notificacion_repository.crear(datos.id_tarea, datos.fecha, datos.texto, datos.periodicidad)


def listar(id_usuario: int, solo_activas: bool = True) -> list[dict]:
    return notificacion_repository.listar_por_usuario(id_usuario, solo_activas)


def actualizar(id_usuario: int, id_notificacion: int, datos: NotificacionActualizar) -> dict:
    notificaciones = notificacion_repository.listar_por_usuario(id_usuario, solo_activas=False)
    if not any(n["id_notificacion"] == id_notificacion for n in notificaciones):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada.")

    campos = {clave: valor for clave, valor in datos.model_dump().items() if valor is not None}
    return notificacion_repository.actualizar(id_notificacion, campos)


def eliminar(id_usuario: int, id_notificacion: int) -> None:
    notificaciones = notificacion_repository.listar_por_usuario(id_usuario, solo_activas=False)
    if not any(n["id_notificacion"] == id_notificacion for n in notificaciones):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificación no encontrada.")
    notificacion_repository.eliminar(id_notificacion)


def historial_usuario(id_usuario: int) -> list[dict]:
    return notificacion_repository.historial_por_usuario(id_usuario)


def historial_tarea(id_usuario: int, id_tarea: int) -> list[dict]:
    obtener_validando_dueno(id_usuario, id_tarea)
    return notificacion_repository.historial_por_tarea(id_tarea)
