"""Esquemas Pydantic para Notificaciones e Historial (seguimiento)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificacionCrear(BaseModel):
    id_tarea: int
    fecha: datetime
    texto: str = Field(..., min_length=1, max_length=255)
    periodicidad: str = Field(default="una_vez", pattern="^(una_vez|diaria|semanal)$")


class NotificacionActualizar(BaseModel):
    texto: Optional[str] = Field(None, max_length=255)
    activa: Optional[bool] = None


class NotificacionRespuesta(BaseModel):
    id_notificacion: int
    id_tarea: int
    titulo_tarea: Optional[str] = None
    fecha: datetime
    texto: str
    activa: bool
    periodicidad: str


class HistorialRespuesta(BaseModel):
    id_historial: int
    id_tarea: int
    titulo_tarea: Optional[str] = None
    prioridad: str
    estado: str
    fecha: datetime
    observacion: Optional[str] = None


class ResumenDashboard(BaseModel):
    pendientes: int
    en_proceso: int
    terminadas: int
    proximas_3_dias: int
    total: int
