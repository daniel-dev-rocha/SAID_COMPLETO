"""Esquemas Pydantic para el módulo Gestión de Tareas (núcleo del MVP)."""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Prioridad(str, Enum):
    alta = "alta"
    media = "media"
    baja = "baja"


class EstadoTarea(str, Enum):
    pendiente = "pendiente"
    en_proceso = "en_proceso"
    terminada = "terminada"


class TareaCrear(BaseModel):
    id_tipo_tarea: int
    titulo: str = Field(..., min_length=1, max_length=150, description="Obligatorio (HU01)")
    descripcion: Optional[str] = Field(None, max_length=500)
    fecha_vencimiento: datetime = Field(..., description="Obligatoria (HU01)")
    prioridad: Prioridad = Prioridad.media
    estado: EstadoTarea = EstadoTarea.pendiente


class TareaActualizar(BaseModel):
    """Todos los campos opcionales: soporta HU06 (edición parcial)."""
    id_tipo_tarea: Optional[int] = None
    titulo: Optional[str] = Field(None, min_length=1, max_length=150)
    descripcion: Optional[str] = Field(None, max_length=500)
    fecha_vencimiento: Optional[datetime] = None
    prioridad: Optional[Prioridad] = None
    estado: Optional[EstadoTarea] = None


class CambiarEstado(BaseModel):
    """Cuerpo de PATCH /tareas/{id}/estado (HU08)."""
    estado: EstadoTarea
    observacion: Optional[str] = Field(None, max_length=255)


class TareaRespuesta(BaseModel):
    id_tarea: int
    id_usuario: int
    id_tipo_tarea: int
    categoria: Optional[str] = None
    color_categoria: Optional[str] = None
    titulo: str
    descripcion: Optional[str] = None
    fecha_hora: datetime
    fecha_vencimiento: datetime
    fecha_actualizacion: datetime
    prioridad: Prioridad
    estado: EstadoTarea


class NotaCrear(BaseModel):
    nota: str = Field(..., min_length=1, max_length=500)


class NotaRespuesta(BaseModel):
    id_nota: int
    id_tarea: int
    nota: str
    fecha_creacion: datetime
