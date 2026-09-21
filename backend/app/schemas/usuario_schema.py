"""Esquemas Pydantic para el módulo Usuario (registro, login, perfil)."""
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RolUsuario(str, Enum):
    estudiante = "estudiante"
    administrador = "administrador"


class EstadoUsuario(str, Enum):
    activo = "activo"
    inactivo = "inactivo"


class UsuarioRegistro(BaseModel):
    nombre_usuario: str = Field(..., min_length=1, max_length=100)
    apellido_usuario: str = Field(..., min_length=1, max_length=100)
    correo_usuario: EmailStr
    contrasena: str = Field(..., min_length=6, max_length=100)


class UsuarioLogin(BaseModel):
    correo_usuario: EmailStr
    contrasena: str


class UsuarioActualizar(BaseModel):
    """Todos los campos son opcionales: se usa para editar el perfil."""
    nombre_usuario: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido_usuario: Optional[str] = Field(None, min_length=1, max_length=100)
    correo_usuario: Optional[EmailStr] = None


class UsuarioRespuesta(BaseModel):
    id_usuario: int
    rol: RolUsuario
    nombre_usuario: str
    apellido_usuario: str
    correo_usuario: str
    fecha_registro: datetime
    estado: EstadoUsuario


class TokenRespuesta(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuesta
