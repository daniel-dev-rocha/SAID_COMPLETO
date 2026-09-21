-- =====================================================================
--  SAID · Sistema de Aprendizaje Interactivo Digital
--  Script de base de datos (PostgreSQL) - VERSIÓN CORREGIDA Y ADAPTADA
--  Basado en coreccion_DB.sql, corrigiendo tipografía, agregando
--  columnas necesarias para el frontend/backend, y garantizando que
--  el script se pueda volver a ejecutar sin errores (IF NOT EXISTS /
--  bloques DO para los tipos ENUM).
-- =====================================================================

-- Ejecutar una sola vez, fuera de una transacción:
-- CREATE DATABASE said;
-- \c said

-- ---------------------------------------------------------------------
-- 1. TIPOS ENUM
--    Postgres no soporta "CREATE TYPE IF NOT EXISTS", por lo que se
--    envuelve cada creación en un bloque DO que verifica su existencia.
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('estudiante', 'administrador');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_usuario AS ENUM ('activo', 'inactivo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE prioridad_tarea AS ENUM ('alta', 'media', 'baja');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_tarea AS ENUM ('pendiente', 'en_proceso', 'terminada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- 2. Tabla: usuario
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario          SERIAL PRIMARY KEY,
    rol                 rol_usuario NOT NULL DEFAULT 'estudiante',
    nombre_usuario      VARCHAR(100) NOT NULL,
    apellido_usuario    VARCHAR(100) NOT NULL,
    correo_usuario      VARCHAR(150) NOT NULL UNIQUE,
    contrasena_hash     VARCHAR(255) NOT NULL,
    fecha_registro      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado              estado_usuario NOT NULL DEFAULT 'activo'
);

-- ---------------------------------------------------------------------
-- 3. Tabla: tipo_tarea  (módulo "Categoría" del sustento del proyecto:
--    clasificación temática de la tarea, creada por el propio usuario)
--    CORRECCIÓN: se agrega "color_categoria" para que el frontend pueda
--    pintar cada categoría con un color distinto (uno de los requisitos
--    de UI), y "fecha_creacion" para auditoría.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipo_tarea (
    id_tipo_tarea    SERIAL PRIMARY KEY,
    descripcion      VARCHAR(150) NOT NULL,
    color_categoria  VARCHAR(7)   NOT NULL DEFAULT '#0001F0', -- color SAID por defecto
    fecha_creacion   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario       INT NOT NULL,
    CONSTRAINT fk_tipotarea_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_categoria_por_usuario UNIQUE (id_usuario, descripcion)
);

-- ---------------------------------------------------------------------
-- 4. Tabla: tareas
--    CORRECCIÓN: se agrega id_usuario directo (además de id_tipo_tarea)
--    porque HU02/HU03 exigen "mostrar solo tareas del usuario logueado"
--    y no se puede garantizar eso recorriendo tipo_tarea si en el futuro
--    se permiten categorías compartidas. También se agrega
--    "titulo" (obligatorio, requerido explícitamente por HU01) separado
--    de la descripción larga, y "fecha_actualizacion" para HU06 (editar).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tareas (
    id_tarea              SERIAL PRIMARY KEY,
    id_usuario            INT NOT NULL,
    id_tipo_tarea         INT NOT NULL,
    titulo                VARCHAR(150) NOT NULL,
    descripcion           VARCHAR(500),
    fecha_hora            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- creación (automática)
    fecha_vencimiento     TIMESTAMP NOT NULL,
    prioridad             prioridad_tarea NOT NULL DEFAULT 'media',
    estado                estado_tarea NOT NULL DEFAULT 'pendiente',
    fecha_actualizacion   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tareas_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_tareas_tipotarea FOREIGN KEY (id_tipo_tarea)
        REFERENCES tipo_tarea(id_tipo_tarea)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 5. Tabla: notas
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notas (
    id_nota        SERIAL PRIMARY KEY,
    id_tarea       INT NOT NULL,
    nota           VARCHAR(500) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notas_tarea FOREIGN KEY (id_tarea)
        REFERENCES tareas(id_tarea)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 6. Tabla: notificaciones
--    CORRECCIÓN: se corrige la columna mal escrita "periosidad" ->
--    "periodicidad", y se restringe a un conjunto de valores válidos.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion  SERIAL PRIMARY KEY,
    id_tarea         INT NOT NULL,
    fecha            TIMESTAMP NOT NULL,
    texto            VARCHAR(255) NOT NULL,
    activa           BOOLEAN NOT NULL DEFAULT TRUE,
    periodicidad     VARCHAR(20) NOT NULL DEFAULT 'una_vez'
        CHECK (periodicidad IN ('una_vez', 'diaria', 'semanal')),
    CONSTRAINT fk_notificaciones_tarea FOREIGN KEY (id_tarea)
        REFERENCES tareas(id_tarea)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 7. Tabla: historial
--    (bitácora de cambios de estado/prioridad de cada tarea, usada por
--    el módulo de seguimiento / tracking)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial (
    id_historial  SERIAL PRIMARY KEY,
    id_tarea      INT NOT NULL,
    prioridad     prioridad_tarea NOT NULL,
    estado        estado_tarea NOT NULL,
    fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacion   VARCHAR(255),
    CONSTRAINT fk_historial_tarea FOREIGN KEY (id_tarea)
        REFERENCES tareas(id_tarea)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 8. Índices adicionales recomendados
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuario_rol            ON usuario(rol);
CREATE INDEX IF NOT EXISTS idx_tareas_estado           ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_vencimiento      ON tareas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_usuario          ON tareas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_tareas_tipotarea        ON tareas(id_tipo_tarea);
CREATE INDEX IF NOT EXISTS idx_notificaciones_activa   ON notificaciones(activa);
CREATE INDEX IF NOT EXISTS idx_notas_tarea             ON notas(id_tarea);
CREATE INDEX IF NOT EXISTS idx_historial_tarea         ON historial(id_tarea);

-- ---------------------------------------------------------------------
-- 9. Trigger para mantener "fecha_actualizacion" al editar una tarea
--    (soporta HU06 - Editar tarea)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_fecha_tarea()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tareas_actualizacion ON tareas;
CREATE TRIGGER trg_tareas_actualizacion
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION fn_actualizar_fecha_tarea();

-- =====================================================================
-- 10. DATOS DE PRUEBA (seed) — útiles para probar el backend/frontend
--     y para ejecutar las consultas multitabla de verificación.
-- =====================================================================
INSERT INTO usuario (rol, nombre_usuario, apellido_usuario, correo_usuario, contrasena_hash)
VALUES
    ('estudiante', 'Leider', 'Rincones', 'leider@said.edu', '$2b$12$0000000000000000000000000000000000000000000000000000'),
    ('estudiante', 'Emily', 'Miranda', 'emily@said.edu', '$2b$12$0000000000000000000000000000000000000000000000000000'),
    ('administrador', 'Axel', 'Cortes', 'axel@said.edu', '$2b$12$0000000000000000000000000000000000000000000000000000')
ON CONFLICT (correo_usuario) DO NOTHING;

INSERT INTO tipo_tarea (descripcion, color_categoria, id_usuario)
VALUES
    ('Programación', '#0001F0', 1),
    ('Base de datos', '#FF0000', 1),
    ('Inglés', '#FFF251', 1)
ON CONFLICT (id_usuario, descripcion) DO NOTHING;

INSERT INTO tareas (id_usuario, id_tipo_tarea, titulo, descripcion, fecha_vencimiento, prioridad, estado)
VALUES
    (1, 1, 'Entregar proyecto SAID', 'Terminar el CRUD de tareas y conectar el frontend.', CURRENT_TIMESTAMP + INTERVAL '2 day', 'alta', 'en_proceso'),
    (1, 2, 'Modelo relacional', 'Revisar llaves foráneas del script SQL.', CURRENT_TIMESTAMP + INTERVAL '5 day', 'media', 'pendiente'),
    (1, 3, 'Examen de inglés', 'Repasar vocabulario técnico.', CURRENT_TIMESTAMP + INTERVAL '1 day', 'alta', 'pendiente');

INSERT INTO notas (id_tarea, nota) VALUES
    (1, 'Falta conectar el backend con la base de datos real.'),
    (1, 'Revisar validaciones de fecha en el formulario.');

INSERT INTO notificaciones (id_tarea, fecha, texto, periodicidad) VALUES
    (1, CURRENT_TIMESTAMP + INTERVAL '1 day', 'Recuerda entregar el proyecto SAID mañana', 'una_vez'),
    (3, CURRENT_TIMESTAMP + INTERVAL '12 hour', 'Tu examen de inglés es pronto', 'una_vez');

INSERT INTO historial (id_tarea, prioridad, estado, observacion) VALUES
    (1, 'media', 'pendiente', 'Tarea creada'),
    (1, 'alta', 'en_proceso', 'Se subió la prioridad y se inició el desarrollo');
