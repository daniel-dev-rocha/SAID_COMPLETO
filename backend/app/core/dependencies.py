"""
Dependencias reutilizables de FastAPI, principalmente la que obtiene el
usuario autenticado a partir del token Bearer enviado en el header
Authorization.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.repositories import usuario_repository

_bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme)) -> dict:
    """
    Valida el token JWT y devuelve el registro del usuario autenticado.
    Se usa como dependencia en cada endpoint protegido:
        def endpoint(usuario_actual: dict = Depends(get_current_user)):
    """
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión. Inicia sesión nuevamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credenciales_invalidas

    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise credenciales_invalidas

    usuario = usuario_repository.obtener_por_id(int(payload["sub"]))
    if usuario is None:
        raise credenciales_invalidas

    return usuario
