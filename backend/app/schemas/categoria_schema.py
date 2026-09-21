"""Esquemas Pydantic para el módulo Categoría (tabla tipo_tarea)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class CategoriaCrear(BaseModel):
    descripcion: str = Field(..., min_length=1, max_length=150)
    color_categoria: str = Field(default="#0001F0", max_length=7)


class CategoriaActualizar(BaseModel):
    descripcion: Optional[str] = Field(None, min_length=1, max_length=150)
    color_categoria: Optional[str] = Field(None, max_length=7)


class CategoriaRespuesta(BaseModel):
    id_tipo_tarea: int
    descripcion: str
    color_categoria: str
    fecha_creacion: datetime
    id_usuario: int
    total_tareas: Optional[int] = None
