-- ============================================================
-- AutoCiclo DB — DATOS DE DEMO (E6)
-- Ejecutar DESPUÉS de autociclo_db_v2.sql
-- Añade: QR codes para todas las piezas y vehículos,
--        solicitudes de demo, movimientos de stock, notificaciones
-- ============================================================

USE `autociclo_db`;

-- ── QR CODES ─────────────────────────────────────────────────
-- Un código QR por cada pieza y por cada vehículo.
-- El texto impreso en cada QR es exactamente el valor de codigo_unico.

INSERT IGNORE INTO `CODIGOS_QR` (`codigo_unico`, `tipo`, `id_referencia`, `fecha_generacion`) VALUES
    -- Piezas
    ('QR-PIE-00001', 'pieza',    1,  '2026-01-15 09:00:00'),
    ('QR-PIE-00002', 'pieza',    2,  '2026-01-15 09:01:00'),
    ('QR-PIE-00003', 'pieza',    3,  '2026-01-15 09:02:00'),
    ('QR-PIE-00004', 'pieza',    4,  '2026-01-15 09:03:00'),
    ('QR-PIE-00005', 'pieza',    5,  '2026-01-15 09:04:00'),
    ('QR-PIE-00006', 'pieza',    6,  '2026-01-15 09:05:00'),
    ('QR-PIE-00007', 'pieza',    7,  '2026-01-15 09:06:00'),
    ('QR-PIE-00008', 'pieza',    8,  '2026-01-15 09:07:00'),
    ('QR-PIE-00009', 'pieza',    9,  '2026-01-15 09:08:00'),
    ('QR-PIE-00010', 'pieza',   10,  '2026-01-15 09:09:00'),
    ('QR-PIE-00011', 'pieza',   11,  '2026-01-15 09:10:00'),
    ('QR-PIE-00012', 'pieza',   12,  '2026-01-15 09:11:00'),
    -- Vehículos
    ('QR-VEH-00003', 'vehiculo', 3,  '2026-01-15 09:20:00'),
    ('QR-VEH-00004', 'vehiculo', 4,  '2026-01-15 09:21:00'),
    ('QR-VEH-00005', 'vehiculo', 5,  '2026-01-15 09:22:00'),
    ('QR-VEH-00006', 'vehiculo', 6,  '2026-01-15 09:23:00'),
    ('QR-VEH-00007', 'vehiculo', 7,  '2026-01-15 09:24:00');

-- ── SOLICITUDES DE DEMO ──────────────────────────────────────
-- Solicitud aprobada (para mostrar flujo completo con Odoo)
INSERT IGNORE INTO `SOLICITUDES_PRESUPUESTO`
    (`id_solicitud`, `id_cliente`, `fecha_solicitud`, `estado`, `respuesta_admin`, `precio_total`, `referencia_odoo`)
VALUES
    (2, 1, '2026-04-10 11:30:00', 'aprobada',
     'Presupuesto aprobado. Motor en perfecto estado, garantía 3 meses.',
     2700.00, 'SO/2026/0001'),
    (3, 2, '2026-04-20 16:45:00', 'en_revision',
     NULL, NULL, NULL),
    (4, 1, '2026-04-28 09:15:00', 'rechazada',
     'Lo sentimos, la pieza solicitada ya no está disponible.', NULL, NULL);

INSERT IGNORE INTO `DETALLE_SOLICITUD` (`id_solicitud`, `id_pieza`, `cantidad`, `notas`) VALUES
    (2, 1, 1, 'Motor para sustitución en VW Golf 2016'),
    (3, 8, 2, 'Par de faros, lado derecho e izquierdo'),
    (3, 7, 1, NULL),
    (4, 6, 1, 'Volante para Clio 2012');

-- ── MOVIMIENTOS DE STOCK DE DEMO ─────────────────────────────
INSERT IGNORE INTO `MOVIMIENTOS_STOCK`
    (`id_pieza`, `tipo`, `cantidad`, `id_usuario`, `fecha`, `notas`)
VALUES
    (1,  'entrada', 2, 1, '2026-01-20 08:00:00', 'Entrada inicial de motores 1.6 TDI'),
    (1,  'salida',  1, 2, '2026-04-10 12:00:00', 'Venta solicitud SO/2026/0001'),
    (2,  'entrada', 1, 1, '2026-02-05 10:30:00', 'Extracción de Peugeot 308'),
    (3,  'entrada', 3, 2, '2026-02-10 09:15:00', 'Extracción de Renault Clio'),
    (9,  'entrada', 5, 2, '2026-03-01 11:00:00', 'Lote de alternadores recibido'),
    (11, 'entrada',12, 1, '2026-03-15 08:30:00', 'Lote de neumáticos seminuevos'),
    (6,  'salida',  1, 2, '2026-04-22 14:00:00', 'Devolución por defecto'),
    (10, 'salida',  1, 2, '2026-04-25 10:00:00', 'Salida a taller externo');

-- ── NOTIFICACIONES DE DEMO ───────────────────────────────────
INSERT IGNORE INTO `NOTIFICACIONES`
    (`id_usuario`, `tipo`, `mensaje`, `leida`, `fecha_creacion`)
VALUES
    (1, 'solicitud_nueva',       'Nueva solicitud #3 de Cliente Demo — 2 faros LED',            0, '2026-04-20 16:45:00'),
    (1, 'solicitud_nueva',       'Nueva solicitud #4 de María García — volante multifunción',   0, '2026-04-28 09:15:00'),
    (2, 'stock_bajo',            'Stock de Parachoques trasero (CAR-027) por debajo del mínimo',0, '2026-04-22 14:01:00'),
    (2, 'stock_bajo',            'Stock de Volante multifunción (INT-340) por debajo del mínimo',0,'2026-04-22 14:02:00'),
    (2, 'stock_bajo',            'Stock de Disco de freno (RUE-550) por debajo del mínimo',    0, '2026-04-25 10:01:00'),
    (1, 'solicitud_actualizada', 'Solicitud #2 aprobada — pedido Odoo SO/2026/0001 creado',     1, '2026-04-10 12:05:00'),
    (3, 'solicitud_actualizada', 'Tu solicitud #2 ha sido aprobada. Total: 2.700,00 €',         1, '2026-04-10 12:05:00'),
    (3, 'solicitud_actualizada', 'Tu solicitud #4 ha sido rechazada',                           0, '2026-04-28 09:20:00');

COMMIT;
