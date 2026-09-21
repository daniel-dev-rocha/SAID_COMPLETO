"""Endpoints del módulo Usuario: registro, login y perfil."""
from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user
from app.schemas.usuario_schema import (
    TokenRespuesta,
    UsuarioActualizar,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioRespuesta,
)
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Usuario / Autenticación"])


@router.post("/registro", response_model=TokenRespuesta, status_code=201)
def registrar(datos: UsuarioRegistro):
    return auth_service.registrar(datos)


@router.post("/login", response_model=TokenRespuesta)
def iniciar_sesion(datos: UsuarioLogin):
    return auth_service.iniciar_sesion(datos)


@router.get("/perfil", response_model=UsuarioRespuesta)
def obtener_perfil(usuario_actual: dict = Depends(get_current_user)):
    return usuario_actual


@router.put("/perfil", response_model=UsuarioRespuesta)
def actualizar_perfil(datos: UsuarioActualizar, usuario_actual: dict = Depends(get_current_user)):
    return auth_service.actualizar_perfil(usuario_actual["id_usuario"], datos)
