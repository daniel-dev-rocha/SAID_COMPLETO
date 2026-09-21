"""Endpoints del módulo Gestión de Tareas (núcleo del MVP) + Dashboard."""
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import get_current_user
from app.schemas.notificacion_schema import ResumenDashboard
from app.schemas.tarea_schema import (
    CambiarEstado,
    NotaCrear,
    NotaRespuesta,
    TareaActualizar,
    TareaCrear,
    TareaRespuesta,
)
from app.services import nota_service, tarea_service

router = APIRouter(prefix="/api/tareas", tags=["Tareas"])


@router.post("", response_model=TareaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_tarea(datos: TareaCrear, usuario_actual: dict = Depends(get_current_user)):
    """HU01 — Registrar una tarea con su información principal."""
    return tarea_service.crear(usuario_actual["id_usuario"], datos)


@router.get("", response_model=list[TareaRespuesta])
def listar_tareas(
    estado: Optional[str] = Query(None, description="pendiente | en_proceso | terminada"),
    prioridad: Optional[str] = Query(None, description="alta | media | baja"),
    id_tipo_tarea: Optional[int] = Query(None, description="Filtrar por categoría"),
    buscar: Optional[str] = Query(None, description="Texto a buscar en el título"),
    usuario_actual: dict = Depends(get_current_user),
):
    """HU02, HU04, HU05 — Consultar, filtrar y buscar tareas."""
    return tarea_service.listar(usuario_actual["id_usuario"], estado, prioridad, id_tipo_tarea, buscar)


@router.get("/calendario", response_model=list[TareaRespuesta])
def calendario(
    anio: int = Query(..., description="Año, ej: 2026"),
    mes: int = Query(..., ge=1, le=12, description="Mes 1-12"),
    usuario_actual: dict = Depends(get_current_user),
):
    """HU09 — Visualizar tareas en el calendario."""
    return tarea_service.calendario(usuario_actual["id_usuario"], anio, mes)


@router.get("/dashboard/resumen", response_model=ResumenDashboard)
def resumen_dashboard(usuario_actual: dict = Depends(get_current_user)):
    return tarea_service.resumen_dashboard(usuario_actual["id_usuario"])


@router.get("/recordatorios/proximos", response_model=list[TareaRespuesta])
def recordatorios_proximos(
    dias: int = Query(3, ge=1, le=30),
    usuario_actual: dict = Depends(get_current_user),
):
    """Módulo Recordatorios — avisos de tareas próximas a vencer."""
    return tarea_service.proximas_a_vencer(usuario_actual["id_usuario"], dias)


@router.get("/{id_tarea}", response_model=TareaRespuesta)
def detalle_tarea(id_tarea: int, usuario_actual: dict = Depends(get_current_user)):
    """HU03 — Consultar el detalle completo de una tarea."""
    return tarea_service.obtener_detalle(usuario_actual["id_usuario"], id_tarea)


@router.put("/{id_tarea}", response_model=TareaRespuesta)
def actualizar_tarea(id_tarea: int, datos: TareaActualizar, usuario_actual: dict = Depends(get_current_user)):
    """HU06 — Editar una tarea."""
    return tarea_service.actualizar(usuario_actual["id_usuario"], id_tarea, datos)


@router.patch("/{id_tarea}/estado", response_model=TareaRespuesta)
def cambiar_estado(id_tarea: int, datos: CambiarEstado, usuario_actual: dict = Depends(get_current_user)):
    """HU08 — Cambiar/marcar el estado de una tarea (ej: Completada)."""
    return tarea_service.cambiar_estado(usuario_actual["id_usuario"], id_tarea, datos)


@router.delete("/{id_tarea}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_tarea(id_tarea: int, usuario_actual: dict = Depends(get_current_user)):
    """HU07 — Eliminar una tarea."""
    tarea_service.eliminar(usuario_actual["id_usuario"], id_tarea)


# --- Notas de una tarea ---

@router.post("/{id_tarea}/notas", response_model=NotaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_nota(id_tarea: int, datos: NotaCrear, usuario_actual: dict = Depends(get_current_user)):
    return nota_service.crear(usuario_actual["id_usuario"], id_tarea, datos.nota)


@router.get("/{id_tarea}/notas", response_model=list[NotaRespuesta])
def listar_notas(id_tarea: int, usuario_actual: dict = Depends(get_current_user)):
    return nota_service.listar(usuario_actual["id_usuario"], id_tarea)


@router.delete("/{id_tarea}/notas/{id_nota}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_nota(id_tarea: int, id_nota: int, usuario_actual: dict = Depends(get_current_user)):
    nota_service.eliminar(usuario_actual["id_usuario"], id_tarea, id_nota)
