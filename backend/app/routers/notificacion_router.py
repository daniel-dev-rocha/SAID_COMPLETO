"""Endpoints de Notificaciones e Historial (módulo de seguimiento)."""
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.schemas.notificacion_schema import (
    HistorialRespuesta,
    NotificacionActualizar,
    NotificacionCrear,
    NotificacionRespuesta,
)
from app.services import notificacion_service

router = APIRouter(prefix="/api/notificaciones", tags=["Notificaciones"])
router_historial = APIRouter(prefix="/api/historial", tags=["Historial / Seguimiento"])


@router.post("", response_model=NotificacionRespuesta, status_code=status.HTTP_201_CREATED)
def crear_notificacion(datos: NotificacionCrear, usuario_actual: dict = Depends(get_current_user)):
    return notificacion_service.crear(usuario_actual["id_usuario"], datos)


@router.get("", response_model=list[NotificacionRespuesta])
def listar_notificaciones(
    solo_activas: bool = Query(True),
    usuario_actual: dict = Depends(get_current_user),
):
    return notificacion_service.listar(usuario_actual["id_usuario"], solo_activas)


@router.put("/{id_notificacion}", response_model=NotificacionRespuesta)
def actualizar_notificacion(id_notificacion: int, datos: NotificacionActualizar,
                             usuario_actual: dict = Depends(get_current_user)):
    return notificacion_service.actualizar(usuario_actual["id_usuario"], id_notificacion, datos)


@router.delete("/{id_notificacion}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_notificacion(id_notificacion: int, usuario_actual: dict = Depends(get_current_user)):
    notificacion_service.eliminar(usuario_actual["id_usuario"], id_notificacion)


@router_historial.get("", response_model=list[HistorialRespuesta])
def historial_usuario(usuario_actual: dict = Depends(get_current_user)):
    return notificacion_service.historial_usuario(usuario_actual["id_usuario"])


@router_historial.get("/tarea/{id_tarea}", response_model=list[HistorialRespuesta])
def historial_tarea(id_tarea: int, usuario_actual: dict = Depends(get_current_user)):
    return notificacion_service.historial_tarea(usuario_actual["id_usuario"], id_tarea)
