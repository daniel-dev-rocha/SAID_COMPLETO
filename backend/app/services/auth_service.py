"""Reglas de negocio del módulo Usuario: registro, login y perfil."""
from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import usuario_repository
from app.schemas.usuario_schema import UsuarioActualizar, UsuarioLogin, UsuarioRegistro


def registrar(datos: UsuarioRegistro) -> dict:
    if usuario_repository.obtener_por_correo(datos.correo_usuario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta registrada con ese correo.",
        )

    usuario = usuario_repository.crear(
        nombre_usuario=datos.nombre_usuario,
        apellido_usuario=datos.apellido_usuario,
        correo_usuario=datos.correo_usuario,
        contrasena_hash=hash_password(datos.contrasena),
    )
    return _generar_respuesta_token(usuario)


def iniciar_sesion(datos: UsuarioLogin) -> dict:
    usuario = usuario_repository.obtener_por_correo(datos.correo_usuario)
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Correo o contraseña incorrectos.",
    )

    if not usuario or not verify_password(datos.contrasena, usuario["contrasena_hash"]):
        raise credenciales_invalidas

    if usuario["estado"] == "inactivo":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cuenta inactiva.")

    return _generar_respuesta_token(usuario)


def actualizar_perfil(id_usuario: int, datos: UsuarioActualizar) -> dict:
    campos = {clave: valor for clave, valor in datos.model_dump().items() if valor is not None}
    usuario = usuario_repository.actualizar(id_usuario, campos)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")
    return usuario


def _generar_respuesta_token(usuario: dict) -> dict:
    token = create_access_token({"sub": str(usuario["id_usuario"])})
    return {"access_token": token, "token_type": "bearer", "usuario": usuario}
