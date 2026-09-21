"""Endpoints del módulo Categoría (clasificación temática de tareas)."""
from fastapi import APIRouter, Depends, status

from app.core.dependencies import get_current_user
from app.schemas.categoria_schema import CategoriaActualizar, CategoriaCrear, CategoriaRespuesta
from app.services import categoria_service

router = APIRouter(prefix="/api/categorias", tags=["Categorías"])


@router.post("", response_model=CategoriaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCrear, usuario_actual: dict = Depends(get_current_user)):
    return categoria_service.crear(usuario_actual["id_usuario"], datos)


@router.get("", response_model=list[CategoriaRespuesta])
def listar_categorias(usuario_actual: dict = Depends(get_current_user)):
    return categoria_service.listar(usuario_actual["id_usuario"])


@router.put("/{id_tipo_tarea}", response_model=CategoriaRespuesta)
def actualizar_categoria(id_tipo_tarea: int, datos: CategoriaActualizar,
                          usuario_actual: dict = Depends(get_current_user)):
    return categoria_service.actualizar(usuario_actual["id_usuario"], id_tipo_tarea, datos)


@router.delete("/{id_tipo_tarea}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id_tipo_tarea: int, usuario_actual: dict = Depends(get_current_user)):
    categoria_service.eliminar(usuario_actual["id_usuario"], id_tipo_tarea)
