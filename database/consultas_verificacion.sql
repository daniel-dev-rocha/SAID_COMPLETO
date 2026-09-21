-- =====================================================================
--  SAID · Consultas de verificación (MULTITABLA)
--  Ejecutar después de correr said_db.sql (incluye datos de prueba).
--  Cada consulta demuestra que las relaciones usuario -> tipo_tarea ->
--  tareas -> notas / notificaciones / historial funcionan correctamente.
-- =====================================================================

-- 1) Listado completo de tareas con el nombre del usuario dueño y su
--    categoría (3 tablas: tareas + usuario + tipo_tarea)
SELECT
    t.id_tarea,
    t.titulo,
    t.estado,
    t.prioridad,
    t.fecha_vencimiento,
    u.nombre_usuario || ' ' || u.apellido_usuario AS propietario,
    c.descripcion AS categoria,
    c.color_categoria
FROM tareas t
JOIN usuario u    ON u.id_usuario = t.id_usuario
JOIN tipo_tarea c ON c.id_tipo_tarea = t.id_tipo_tarea
ORDER BY t.fecha_vencimiento ASC;

-- 2) Detalle de una tarea con todas sus notas (tareas + notas + usuario)
SELECT
    t.id_tarea,
    t.titulo,
    u.correo_usuario,
    n.id_nota,
    n.nota,
    n.fecha_creacion AS fecha_nota
FROM tareas t
JOIN usuario u ON u.id_usuario = t.id_usuario
LEFT JOIN notas n ON n.id_tarea = t.id_tarea
WHERE t.id_tarea = 1
ORDER BY n.fecha_creacion ASC;

-- 3) Notificaciones activas de un usuario, con el título de la tarea que
--    las origina (notificaciones + tareas + usuario)
SELECT
    us.nombre_usuario,
    no.texto,
    no.fecha,
    no.periodicidad,
    t.titulo AS tarea_relacionada,
    t.estado
FROM notificaciones no
JOIN tareas t   ON t.id_tarea = no.id_tarea
JOIN usuario us ON us.id_usuario = t.id_usuario
WHERE no.activa = TRUE
  AND us.id_usuario = 1
ORDER BY no.fecha ASC;

-- 4) Historial completo (seguimiento) de cada tarea, con categoría y
--    propietario (historial + tareas + tipo_tarea + usuario)
SELECT
    h.id_historial,
    t.titulo,
    c.descripcion AS categoria,
    u.nombre_usuario,
    h.estado,
    h.prioridad,
    h.fecha,
    h.observacion
FROM historial h
JOIN tareas t      ON t.id_tarea = h.id_tarea
JOIN tipo_tarea c  ON c.id_tipo_tarea = t.id_tipo_tarea
JOIN usuario u     ON u.id_usuario = t.id_usuario
ORDER BY t.id_tarea, h.fecha ASC;

-- 5) Resumen tipo "dashboard": cantidad de tareas por estado y prioridad
--    para cada usuario (usuario + tareas, con agregación)
SELECT
    u.id_usuario,
    u.nombre_usuario,
    COUNT(*) FILTER (WHERE t.estado = 'pendiente')    AS pendientes,
    COUNT(*) FILTER (WHERE t.estado = 'en_proceso')   AS en_proceso,
    COUNT(*) FILTER (WHERE t.estado = 'terminada')    AS terminadas,
    COUNT(*) FILTER (WHERE t.prioridad = 'alta')      AS prioridad_alta,
    COUNT(*)                                           AS total_tareas
FROM usuario u
LEFT JOIN tareas t ON t.id_usuario = u.id_usuario
GROUP BY u.id_usuario, u.nombre_usuario
ORDER BY u.id_usuario;

-- 6) Tareas "próximas a vencer" (siguientes 3 días) con datos de
--    categoría y usuario, útil para el módulo de Recordatorios
--    (tareas + tipo_tarea + usuario, con filtro de fecha)
SELECT
    t.id_tarea,
    t.titulo,
    t.fecha_vencimiento,
    c.descripcion AS categoria,
    u.correo_usuario
FROM tareas t
JOIN tipo_tarea c ON c.id_tipo_tarea = t.id_tipo_tarea
JOIN usuario u    ON u.id_usuario = t.id_usuario
WHERE t.fecha_vencimiento BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 day'
  AND t.estado <> 'terminada'
ORDER BY t.fecha_vencimiento ASC;

-- 7) Categorías más usadas por usuario, con conteo de tareas
--    (tipo_tarea + tareas + usuario, agregación + JOIN)
SELECT
    u.nombre_usuario,
    c.descripcion AS categoria,
    c.color_categoria,
    COUNT(t.id_tarea) AS total_tareas
FROM tipo_tarea c
JOIN usuario u ON u.id_usuario = c.id_usuario
LEFT JOIN tareas t ON t.id_tipo_tarea = c.id_tipo_tarea
GROUP BY u.nombre_usuario, c.descripcion, c.color_categoria
ORDER BY total_tareas DESC;
