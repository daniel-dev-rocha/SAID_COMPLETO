"""
Punto de entrada de la API de SAID (Sistema de Aprendizaje Interactivo
Digital).

Ejecutar en desarrollo con:
    uvicorn main:app --reload

La documentación interactiva queda disponible en /docs (Swagger) y
/redoc.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import close_pool, init_pool
from app.routers import auth_router, categoria_router, notificacion_router, tarea_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Se ejecuta al iniciar el servidor
    init_pool()
    yield
    # Se ejecuta al apagar el servidor
    close_pool()


app = FastAPI(
    title="SAID API",
    description="API REST del Sistema de Aprendizaje Interactivo Digital (SAID).",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(categoria_router.router)
app.include_router(tarea_router.router)
app.include_router(notificacion_router.router)
app.include_router(notificacion_router.router_historial)


@app.get("/", tags=["Estado"])
def raiz():
    return {"mensaje": "API de SAID funcionando correctamente.", "docs": "/docs"}


@app.get("/api/salud", tags=["Estado"])
def salud():
    return {"status": "ok"}
