-- AutoCiclo DB v3 — Yalil Musa Talhaoui · TFG 2º DAM · IES P. Hermenegildo Lanz
-- 12 tablas: ROLES, VEHICULOS, PIEZAS, INVENTARIO_PIEZAS, USUARIOS, CLIENTES,
--            SOLICITUDES_PRESUPUESTO, DETALLE_SOLICITUD, NEGOCIACION_HISTORIAL,
--            CODIGOS_QR, MOVIMIENTOS_STOCK, NOTIFICACIONES
-- Datos de demo: 8 vehículos · 15 piezas · 3 usuarios por rol · 4 solicitudes · 2 rondas negociación · 20 códigos QR

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `autociclo_db`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `autociclo_db`;

-- Drop en orden inverso a las FK
DROP TABLE IF EXISTS `NOTIFICACIONES`;
DROP TABLE IF EXISTS `MOVIMIENTOS_STOCK`;
DROP TABLE IF EXISTS `CODIGOS_QR`;
DROP TABLE IF EXISTS `NEGOCIACION_HISTORIAL`;
DROP TABLE IF EXISTS `DETALLE_SOLICITUD`;
DROP TABLE IF EXISTS `SOLICITUDES_PRESUPUESTO`;
DROP TABLE IF EXISTS `INVENTARIO_PIEZAS`;
DROP TABLE IF EXISTS `CLIENTES`;
DROP TABLE IF EXISTS `USUARIOS`;
DROP TABLE IF EXISTS `ROLES`;
DROP TABLE IF EXISTS `PIEZAS`;
DROP TABLE IF EXISTS `VEHICULOS`;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ROLES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `ROLES` (
    `id_rol`      INT          NOT NULL AUTO_INCREMENT,
    `nombre`      VARCHAR(50)  NOT NULL,
    `descripcion` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id_rol`),
    UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ROLES` (`nombre`, `descripcion`) VALUES
    ('ADMIN',    'Administrador del sistema con acceso total'),
    ('EMPLEADO', 'Empleado del desguace, gestiona piezas y vehículos'),
    ('CLIENTE',  'Cliente registrado que realiza solicitudes de presupuesto');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. VEHICULOS  (8 vehículos de demo)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `VEHICULOS` (
    `id_vehiculo`    INT            NOT NULL AUTO_INCREMENT,
    `matricula`      VARCHAR(10)    NOT NULL,
    `marca`          VARCHAR(50)    NOT NULL,
    `modelo`         VARCHAR(50)    NOT NULL,
    `anio`           INT            NOT NULL,
    `color`          VARCHAR(30)    DEFAULT NULL,
    `fecha_entrada`  DATE           NOT NULL,
    `estado`         ENUM('completo','desguazando','desguazado') NOT NULL,
    `precio_compra`  DECIMAL(10,2)  NOT NULL,
    `kilometraje`    INT            DEFAULT NULL,
    `ubicacion_gps`  VARCHAR(50)    DEFAULT NULL,
    `observaciones`  TEXT,
    PRIMARY KEY (`id_vehiculo`),
    UNIQUE KEY `uq_vehiculos_matricula` (`matricula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `VEHICULOS`
    (`id_vehiculo`,`matricula`,`marca`,`modelo`,`anio`,`color`,`fecha_entrada`,`estado`,`precio_compra`,`kilometraje`,`ubicacion_gps`,`observaciones`)
VALUES
    (3,  '9012GHI', 'Renault',    'Clio',      2012, 'Negro mate',      '2024-03-10', 'desguazando', 2000.00,  220000, 'Patio principal, zona A',   'Accidente frontal'),
    (4,  '3456JKL', 'Ford',       'Focus',     2016, 'Blanco',          '2024-03-25', 'completo',   12000.00,  150000, 'Parking exterior, fila 1',  'Uso comercial'),
    (5,  '7890MNO', 'Honda',      'CBR 600',   2019, 'Azul metalizado', '2024-04-05', 'desguazado',  3500.00,   25000, 'Nave 1, pasillo central',   'Moto deportiva, turbo extraído'),
    (6,  '2345PQR', 'Toyota',     'Corolla',   2017, 'Gris plata',      '2024-04-12', 'desguazando', 7500.00,  120000, 'Patio principal, zona B',   'Motor funcional'),
    (7,  '6789STU', 'Peugeot',    '308',       2014, 'Azul noche',      '2024-04-20', 'completo',    4500.00,  160000, 'Parking exterior, fila 2',  'Falta rueda delantera derecha'),
    (8,  '1234VWX', 'Volkswagen', 'Golf VII',  2018, 'Gris oscuro',     '2024-05-03', 'desguazando', 9500.00,   98000, 'Zona de desguace activo',   'Motor TDI en perfecto estado'),
    (9,  '5678YZA', 'Seat',       'Ibiza',     2015, 'Rojo',            '2024-05-10', 'desguazado',  2800.00,  185000, 'Patio principal, zona C',   'Carrocería dañada, piezas internas OK'),
    (10, '9012BCD', 'BMW',        'Serie 3',   2020, 'Negro brillante', '2024-05-18', 'completo',   18000.00,   62000, 'Nave 2, entrada',           'Entrada reciente, inspección pendiente');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PIEZAS  (15 piezas de demo)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `PIEZAS` (
    `id_pieza`          INT            NOT NULL AUTO_INCREMENT,
    `codigo_pieza`      VARCHAR(20)    NOT NULL,
    `nombre`            VARCHAR(100)   NOT NULL,
    `categoria`         ENUM('motor','carroceria','interior','electronica','ruedas','otros') NOT NULL,
    `precio_venta`      DECIMAL(10,2)  NOT NULL,
    `stock_disponible`  INT            NOT NULL DEFAULT 0,
    `stock_minimo`      INT            NOT NULL DEFAULT 1,
    `ubicacion_almacen` VARCHAR(50)    DEFAULT NULL,
    `compatible_marcas` TEXT,
    `imagen`            LONGTEXT,
    `descripcion`       TEXT,
    PRIMARY KEY (`id_pieza`),
    UNIQUE KEY `uq_piezas_codigo` (`codigo_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `PIEZAS`
    (`id_pieza`,`codigo_pieza`,`nombre`,`categoria`,`precio_venta`,`stock_disponible`,`stock_minimo`,`ubicacion_almacen`,`compatible_marcas`,`imagen`,`descripcion`)
VALUES
    (1,  'MOT-001', 'Motor 1.6 TDI 105CV',          'motor',      2500.00,  2, 1, 'Estantería A, nivel 2',      'Volkswagen Golf VI/VII 2008-2020, Audi A3 2008-2019',      '/imagenes/piezas/motor_tdi.png', 'Motor diésel en perfecto estado, 80.000 km reales. Compresión verificada.'),
    (2,  'MOT-002', 'Motor 2.0 HDI 120CV',           'motor',      1800.00,  1, 1, 'Zona motores, pasillo 3',    'Peugeot 308 2012-2018, Citroën C4 2010-2016',              NULL,                             'Motor diésel 120CV, revisado y garantizado. Incluye árbol de levas.'),
    (3,  'CAR-025', 'Puerta delantera izquierda',    'carroceria',  200.00,  3, 2, 'Estantería A, nivel 2',      'Renault Clio III generación 2006-2012',                    '/img/MOT001.jpg',                'Puerta completa con cristal, elevalunas y mecanismos de cierre.'),
    (4,  'CAR-026', 'Capó delantero',                'carroceria',  150.00,  4, 2, 'Zona carrocería, pasillo 1', 'Seat Ibiza 6J 2012-2016',                                  NULL,                             'Capó en buen estado, sin golpes ni abolladuras. Color rojo original.'),
    (5,  'CAR-027', 'Parachoques trasero completo',  'carroceria',  120.00,  1, 3, 'Estantería C, nivel 1',      'Ford Focus MK3 2010-2015, Seat León 5F 2012-2016',        NULL,                             'Parachoques original con enganche de remolque. Listo para pintar.'),
    (6,  'INT-340', 'Volante multifunción',          'interior',     80.00,  1, 5, 'Zona interior, pasillo 2',   'Universal (adaptable con kit)',                            NULL,                             'Volante con controles integrados de audio, teléfono y crucero.'),
    (7,  'INT-341', 'Asientos delanteros deportivos','interior',    120.00,  2, 2, 'Zona interior, pasillo 2',   'Seat Ibiza FR, León FR 2012-2018',                         NULL,                             'Par de asientos sport con soporte lateral. Tapicería en buen estado.'),
    (8,  'ELE-455', 'Faro delantero LED derecho',    'electronica', 450.00,  2, 1, 'Estantería D, nivel 3',      'Ford Transit Custom 2016-2020',                            NULL,                             'Faro con tecnología LED, lado derecho. Incluye módulo de control.'),
    (9,  'ELE-456', 'Alternador 120A Bosch',         'electronica',  90.00,  5, 3, 'Zona electrónica, pasillo 4','Universal (compatible Bosch B14R048, 14V)',                NULL,                             'Alternador 14V 120A reconstruido. Funciona perfectamente, testado en banco.'),
    (10, 'RUE-550', 'Disco de freno ventilado 280mm','ruedas',      150.00,  2, 5, 'Zona frenos, estante bajo',  'Universal deportivo (5x112)',                               NULL,                             'Disco Brembo de competición. Par de 2 unidades disponible.'),
    (11, 'RUE-551', 'Neumático 205/55 R16',          'ruedas',       85.00, 12,10, 'Almacén exterior, estante 3','Universal — llanta 16"',                                   NULL,                             'Neumático Continental seminuevo con 6mm de profundidad. Dot 2022.'),
    (12, 'OTR-700', 'Turbocompresor Honda CBR',      'otros',       800.00,  1, 1, 'Caja fuerte, estante especial','Honda CBR 600RR / CBR 1000RR 2006-2020',                NULL,                             'Turbo reparado y certificado, garantía 6 meses. Presión verificada.'),
    (13, 'MOT-003', 'Motor 2.0 TDI 150CV',           'motor',      3200.00,  1, 1, 'Zona motores, pasillo 1',    'Volkswagen Golf VII, Audi A3 2013-2020, Skoda Octavia',    NULL,                             'Motor diésel 150CV completo. 62.000 km. Cadena de distribución revisada.'),
    (14, 'ELE-457', 'Centralita de motor (ECU)',     'electronica', 320.00,  2, 1, 'Estantería D, nivel 2',      'BMW Serie 3 F30/F31 2012-2019',                            NULL,                             'Módulo de control del motor BMW. Incluye programación original. Plug & play.'),
    (15, 'CAR-028', 'Guardabarros delantero derecho','carroceria',   95.00,  3, 2, 'Zona carrocería, pasillo 2', 'Seat Ibiza 6J 2012-2016, Ibiza 6F 2017-2021',             NULL,                             'Guardabarros original, color rojo. Sin golpes. Listo para montar.');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INVENTARIO_PIEZAS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `INVENTARIO_PIEZAS` (
    `id_vehiculo`      INT            NOT NULL,
    `id_pieza`         INT            NOT NULL,
    `cantidad`         INT            NOT NULL,
    `estado_pieza`     ENUM('nueva','usada','reparada') NOT NULL,
    `fecha_extraccion` DATE           NOT NULL,
    `precio_unitario`  DECIMAL(10,2)  NOT NULL,
    `notas`            VARCHAR(255)   DEFAULT NULL,
    PRIMARY KEY (`id_vehiculo`, `id_pieza`),
    KEY `fk_inv_pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `INVENTARIO_PIEZAS`
    (`id_vehiculo`,`id_pieza`,`cantidad`,`estado_pieza`,`fecha_extraccion`,`precio_unitario`,`notas`)
VALUES
    (3,  6,  1, 'usada',    '2024-03-15',    80.00, 'Volante extraído del Renault Clio'),
    (3,  3,  1, 'usada',    '2024-03-20',   200.00, 'Puerta izq. Renault Clio, cristal intacto'),
    (4,  5,  1, 'usada',    '2024-04-01',   120.00, 'Parachoques Ford Focus con enganche'),
    (4,  8,  2, 'nueva',    '2024-04-01',   450.00, 'Par de faros LED Ford Transit nuevos'),
    (5,  10, 2, 'nueva',    '2024-04-10',   150.00, 'Discos Brembo nuevos extraídos de la moto'),
    (5,  12, 1, 'reparada', '2024-04-10',   800.00, 'Turbo Honda CBR certificado con garantía'),
    (6,  2,  1, 'usada',    '2024-04-15',  1800.00, 'Motor Toyota Corolla HDI, funcional'),
    (7,  4,  1, 'usada',    '2024-04-22',   150.00, 'Capó Peugeot 308, color azul, sin golpes'),
    (7,  7,  1, 'usada',    '2024-04-22',   120.00, 'Asientos FR Peugeot 308, tapicería OK'),
    (8,  1,  1, 'usada',    '2024-05-05',  2500.00, 'Motor Golf VII TDI 105CV, 80k km'),
    (8, 13,  1, 'usada',    '2024-05-05',  3200.00, 'Motor 2.0 TDI 150CV, Golf VII'),
    (9,  4,  1, 'usada',    '2024-05-12',    95.00, 'Capó Seat Ibiza rojo'),
    (9, 15,  2, 'usada',    '2024-05-12',    95.00, 'Guardabarros Ibiza, par delantero'),
    (10,14,  1, 'nueva',    '2024-05-20',   320.00, 'ECU BMW Serie 3, programación original'),
    (10,11,  4, 'usada',    '2024-05-20',    85.00, 'Neumáticos BMW 205/55 R16, dot 2022');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. USUARIOS  (3 por rol: 3 admin, 3 empleado, 3 cliente)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `USUARIOS` (
    `id_usuario`    INT          NOT NULL AUTO_INCREMENT,
    `nombre`        VARCHAR(100) NOT NULL,
    `email`         VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `id_rol`        INT          NOT NULL,
    `activo`        TINYINT(1)   NOT NULL DEFAULT 1,
    `fecha_alta`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_usuario`),
    UNIQUE KEY `uq_usuarios_email` (`email`),
    KEY `fk_usuarios_rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contraseña de todos los usuarios: Autociclo2026!
-- Hash BCrypt verificado en servidor el 29/04/2026
INSERT INTO `USUARIOS` (`nombre`, `email`, `password_hash`, `id_rol`, `activo`) VALUES
    ('Admin AutoCiclo',  'admin@autociclo.es',       '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 1, 1),
    ('Pedro Empleado',   'pedro@autociclo.es',       '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 2, 1),
    ('María García',     'maria.garcia@email.com',   '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 3, 1),
    ('Admin Sistema',    'admin@autociclo.com',      '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 1, 1),
    ('Operario Taller',  'operario@autociclo.com',   '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 2, 1),
    ('Cliente Demo',     'cliente@autociclo.com',    '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 3, 1),
    ('Supervisor Lanz',  'supervisor@autociclo.es',  '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 1, 1),
    ('Carlos Almacén',   'carlos@autociclo.es',      '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 2, 1),
    ('Juan Martínez',    'juan.martinez@email.com',  '$2b$12$ySLfFUnmv/ULlvtz.ZB.Zup1PqYC8sMdKP3t9qlQRrPWAeeY7uLcW', 3, 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CLIENTES  (perfil extendido de los 3 usuarios CLIENTE)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `CLIENTES` (
    `id_cliente`  INT          NOT NULL AUTO_INCREMENT,
    `id_usuario`  INT          NOT NULL,
    `telefono`    VARCHAR(20)  DEFAULT NULL,
    `direccion`   VARCHAR(255) DEFAULT NULL,
    `nif`         VARCHAR(15)  DEFAULT NULL,
    PRIMARY KEY (`id_cliente`),
    UNIQUE KEY `uq_clientes_nif`     (`nif`),
    UNIQUE KEY `uq_clientes_usuario` (`id_usuario`),
    KEY `fk_clientes_usuario`        (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `CLIENTES` (`id_usuario`, `telefono`, `direccion`, `nif`) VALUES
    (3, '611223344', 'Calle Gran Vía 12, 2ºA, Granada',       '12345678A'),
    (6, '699000001', 'Calle Recogidas 5, Granada',            '87654321B'),
    (9, '650987654', 'Av. de la Constitución 30, Granada',    '11223344C');

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. SOLICITUDES_PRESUPUESTO  (4 solicitudes en distintos estados)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `SOLICITUDES_PRESUPUESTO` (
    `id_solicitud`          INT           NOT NULL AUTO_INCREMENT,
    `id_cliente`            INT           NOT NULL,
    `fecha_solicitud`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `estado`                ENUM('pendiente','en_negociacion','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    `respuesta_admin`       TEXT          DEFAULT NULL,
    `precio_total`          DECIMAL(10,2) DEFAULT NULL,
    `precio_oferta_cliente` DECIMAL(10,2) DEFAULT NULL,
    `precio_contraoferta`   DECIMAL(10,2) DEFAULT NULL,
    `turno`                 ENUM('cliente','admin') NOT NULL DEFAULT 'admin',
    `referencia_odoo`       VARCHAR(50)   DEFAULT NULL,
    PRIMARY KEY (`id_solicitud`),
    KEY `fk_solicitudes_cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `SOLICITUDES_PRESUPUESTO`
    (`id_cliente`, `fecha_solicitud`, `estado`, `respuesta_admin`, `precio_total`, `precio_oferta_cliente`, `precio_contraoferta`, `turno`, `referencia_odoo`) VALUES
    (1, '2026-04-15 10:00:00', 'pendiente',      NULL,                                                                        NULL,    120.00,  NULL,   'admin',   NULL),
    (2, '2026-04-20 14:30:00', 'aprobada',        'Solicitud aprobada. Pedido generado en Odoo. Contactaremos para la entrega.', 500.00,  420.00,  NULL,   'admin',   'SO/2026/0042'),
    (3, '2026-04-28 09:15:00', 'rechazada',       'Lo sentimos, la pieza solicitada está dañada y no podemos garantizar su calidad.', NULL, 700.00, NULL, 'admin', NULL),
    (1, '2026-05-05 16:00:00', 'en_negociacion',  'He revisado el estado de las piezas. Le ofrezco 880€, son piezas en excelente estado.', NULL, 750.00, 880.00, 'cliente', NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. DETALLE_SOLICITUD
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE `DETALLE_SOLICITUD` (
    `id_solicitud` INT          NOT NULL,
    `id_pieza`     INT          NOT NULL,
    `cantidad`     INT          NOT NULL DEFAULT 1,
    `notas`        VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id_solicitud`, `id_pieza`),
    KEY `fk_detalle_pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `DETALLE_SOLICITUD` (`id_solicitud`, `id_pieza`, `cantidad`, `notas`) VALUES
    (1, 2,  1, 'Motor para Peugeot 308 2014 — necesito garantía'),
    (1, 5,  1, 'Parachoques trasero, color no importa'),
    (2, 8,  1, 'Faro LED derecho Ford Transit 2017'),
    (2, 9,  1, 'Alternador 120A compatible'),
    (3, 12, 1, 'Turbocompresor Honda CBR 2019'),
    (4, 11, 4, 'Cuatro neumáticos 205/55 R16, con más de 4mm'),
    (4, 10, 2, 'Par de discos de freno ventilados');

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. NEGOCIACION_HISTORIAL  (historial de rondas de negociación)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `NEGOCIACION_HISTORIAL` (
    `id`           INT            NOT NULL AUTO_INCREMENT,
    `id_solicitud` INT            NOT NULL,
    `ronda`        INT            NOT NULL,
    `autor`        ENUM('cliente','admin') NOT NULL,
    `precio`       DECIMAL(10,2)  NOT NULL,
    `mensaje`      TEXT           DEFAULT NULL,
    `fecha`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_historial_solicitud` (`id_solicitud`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo: 2 rondas de negociación para solicitud #4
INSERT INTO `NEGOCIACION_HISTORIAL` (`id_solicitud`, `ronda`, `autor`, `precio`, `mensaje`, `fecha`) VALUES
    (4, 1, 'cliente', 750.00, 'Me interesan los neumáticos y discos. Ofrezco 750€ por todo, incluido transporte.', '2026-05-05 16:00:00'),
    (4, 2, 'admin',   880.00, 'He revisado el estado de las piezas. Son de primera calidad, extraídas de un BMW 2020 con 62.000 km. Le ofrezco 880€.', '2026-05-06 09:00:00');

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. CODIGOS_QR  (QR para todos los vehículos y todas las piezas)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `CODIGOS_QR` (
    `id_qr`            INT          NOT NULL AUTO_INCREMENT,
    `codigo_unico`     VARCHAR(100) NOT NULL,
    `tipo`             ENUM('pieza','vehiculo') NOT NULL,
    `id_referencia`    INT          NOT NULL,
    `fecha_generacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_qr`),
    UNIQUE KEY `uq_codigos_qr_codigo`    (`codigo_unico`),
    KEY `idx_codigos_qr_tipo_ref`        (`tipo`, `id_referencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QR de vehículos (8)
INSERT INTO `CODIGOS_QR` (`codigo_unico`, `tipo`, `id_referencia`, `fecha_generacion`) VALUES
    ('QR-VEH-00003', 'vehiculo',  3, '2024-03-10 09:00:00'),
    ('QR-VEH-00004', 'vehiculo',  4, '2024-03-25 10:00:00'),
    ('QR-VEH-00005', 'vehiculo',  5, '2024-04-05 11:00:00'),
    ('QR-VEH-00006', 'vehiculo',  6, '2024-04-12 09:30:00'),
    ('QR-VEH-00007', 'vehiculo',  7, '2024-04-20 10:15:00'),
    ('QR-VEH-00008', 'vehiculo',  8, '2024-05-03 08:45:00'),
    ('QR-VEH-00009', 'vehiculo',  9, '2024-05-10 09:00:00'),
    ('QR-VEH-00010', 'vehiculo', 10, '2024-05-18 14:00:00');

-- QR de piezas (15)
INSERT INTO `CODIGOS_QR` (`codigo_unico`, `tipo`, `id_referencia`, `fecha_generacion`) VALUES
    ('QR-PIE-00001', 'pieza',  1, '2024-05-05 09:00:00'),
    ('QR-PIE-00002', 'pieza',  2, '2024-04-15 10:00:00'),
    ('QR-PIE-00003', 'pieza',  3, '2024-03-20 11:00:00'),
    ('QR-PIE-00004', 'pieza',  4, '2024-04-22 09:30:00'),
    ('QR-PIE-00005', 'pieza',  5, '2024-04-01 10:15:00'),
    ('QR-PIE-00006', 'pieza',  6, '2024-03-15 08:45:00'),
    ('QR-PIE-00007', 'pieza',  7, '2024-04-22 09:00:00'),
    ('QR-PIE-00008', 'pieza',  8, '2024-04-01 14:00:00'),
    ('QR-PIE-00009', 'pieza',  9, '2024-04-01 14:30:00'),
    ('QR-PIE-00010', 'pieza', 10, '2024-04-10 10:00:00'),
    ('QR-PIE-00011', 'pieza', 11, '2024-05-20 09:00:00'),
    ('QR-PIE-00012', 'pieza', 12, '2024-04-10 11:00:00'),
    ('QR-PIE-00013', 'pieza', 13, '2024-05-05 10:00:00'),
    ('QR-PIE-00014', 'pieza', 14, '2024-05-20 14:30:00'),
    ('QR-PIE-00015', 'pieza', 15, '2024-05-12 09:00:00');

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MOVIMIENTOS_STOCK
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `MOVIMIENTOS_STOCK` (
    `id_movimiento` INT          NOT NULL AUTO_INCREMENT,
    `id_pieza`      INT          NOT NULL,
    `tipo`          ENUM('entrada','salida') NOT NULL,
    `cantidad`      INT          NOT NULL,
    `id_usuario`    INT          NOT NULL,
    `fecha`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `notas`         VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id_movimiento`),
    KEY `fk_movstock_pieza`   (`id_pieza`),
    KEY `fk_movstock_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `MOVIMIENTOS_STOCK` (`id_pieza`, `tipo`, `cantidad`, `id_usuario`, `fecha`, `notas`) VALUES
    (1,  'entrada', 2, 1, '2024-05-05 09:00:00', 'Entrada inicial motores 1.6 TDI del Golf VII'),
    (13, 'entrada', 1, 1, '2024-05-05 09:30:00', 'Entrada motor 2.0 TDI 150CV del Golf VII'),
    (11, 'entrada', 4, 2, '2024-05-20 10:00:00', 'Entrada neumáticos BMW Serie 3'),
    (11, 'entrada', 8, 2, '2024-04-10 08:00:00', 'Entrada lote neumáticos 205/55 R16'),
    (9,  'entrada', 5, 2, '2024-04-01 14:00:00', 'Entrada lote alternadores Bosch'),
    (9,  'salida',  1, 5, '2024-04-25 11:00:00', 'Venta alternador — solicitud interna'),
    (10, 'entrada', 2, 2, '2024-04-10 10:00:00', 'Entrada discos Brembo moto Honda'),
    (8,  'entrada', 2, 2, '2024-04-01 14:30:00', 'Entrada faros LED Ford Transit'),
    (12, 'entrada', 1, 2, '2024-04-10 11:00:00', 'Entrada turbo Honda CBR certificado'),
    (3,  'entrada', 3, 5, '2024-03-20 11:00:00', 'Entrada puertas Renault Clio'),
    (4,  'entrada', 4, 8, '2024-04-22 09:30:00', 'Entrada capós Peugeot 308 y Seat Ibiza'),
    (14, 'entrada', 2, 8, '2024-05-20 14:30:00', 'Entrada centralitas BMW Serie 3');

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. NOTIFICACIONES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE `NOTIFICACIONES` (
    `id_notif`       INT          NOT NULL AUTO_INCREMENT,
    `id_usuario`     INT          NOT NULL,
    `tipo`           ENUM('stock_bajo','solicitud_nueva','solicitud_actualizada','odoo_pedido','negociacion_nueva','general') NOT NULL,
    `mensaje`        TEXT         NOT NULL,
    `leida`          TINYINT(1)   NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_notif`),
    KEY `fk_notif_usuario` (`id_usuario`),
    KEY `idx_notif_leida`  (`leida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `NOTIFICACIONES` (`id_usuario`, `tipo`, `mensaje`, `leida`, `fecha_creacion`) VALUES
    (1, 'solicitud_nueva',      'Nueva solicitud de presupuesto de María García (Motor 2.0 HDI + Parachoques)',            0, '2026-04-15 10:01:00'),
    (1, 'solicitud_nueva',      'Nueva solicitud de presupuesto de Juan Martínez (Turbocompresor Honda CBR)',              1, '2026-04-28 09:16:00'),
    (1, 'solicitud_nueva',      'Nueva solicitud de María García en revisión (Neumáticos + Discos)',                       0, '2026-05-05 16:01:00'),
    (2, 'stock_bajo',           'Stock del Volante multifunción (INT-340) por debajo del mínimo (1/5)',                    0, '2026-04-30 08:00:00'),
    (5, 'stock_bajo',           'Stock del Parachoques trasero (CAR-027) por debajo del mínimo (1/3)',                    1, '2026-04-01 10:05:00'),
    (3, 'solicitud_actualizada','Tu solicitud #1 sigue en estado pendiente. Revisaremos en breve.',                       1, '2026-04-16 09:00:00'),
    (6, 'odoo_pedido',          'Tu solicitud #2 ha sido aprobada. Pedido Odoo: SO/2026/0042. Importe: 500,00€',          0, '2026-04-20 15:00:00'),
    (9, 'solicitud_actualizada','Tu solicitud #3 ha sido rechazada. Motivo: pieza con daños. Lo sentimos.',               0, '2026-04-28 10:00:00'),
    (8, 'stock_bajo',           'Stock del Motor 1.6 TDI (MOT-001) por debajo del mínimo (2/1) — OK pero vigilar',       1, '2026-05-06 07:00:00');

-- ─────────────────────────────────────────────────────────────────────────────
-- Claves foráneas
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `USUARIOS`
    ADD CONSTRAINT `fk_usuarios_rol`
        FOREIGN KEY (`id_rol`) REFERENCES `ROLES` (`id_rol`) ON UPDATE CASCADE;

ALTER TABLE `CLIENTES`
    ADD CONSTRAINT `fk_clientes_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `SOLICITUDES_PRESUPUESTO`
    ADD CONSTRAINT `fk_solicitudes_cliente`
        FOREIGN KEY (`id_cliente`) REFERENCES `CLIENTES` (`id_cliente`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `DETALLE_SOLICITUD`
    ADD CONSTRAINT `fk_detalle_solicitud`
        FOREIGN KEY (`id_solicitud`) REFERENCES `SOLICITUDES_PRESUPUESTO` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_detalle_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`) ON UPDATE CASCADE;

ALTER TABLE `MOVIMIENTOS_STOCK`
    ADD CONSTRAINT `fk_movstock_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`) ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_movstock_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`) ON UPDATE CASCADE;

ALTER TABLE `NOTIFICACIONES`
    ADD CONSTRAINT `fk_notif_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `NEGOCIACION_HISTORIAL`
    ADD CONSTRAINT `fk_historial_solicitud`
        FOREIGN KEY (`id_solicitud`) REFERENCES `SOLICITUDES_PRESUPUESTO` (`id_solicitud`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `INVENTARIO_PIEZAS`
    ADD CONSTRAINT `fk_inv_vehiculo`
        FOREIGN KEY (`id_vehiculo`) REFERENCES `VEHICULOS` (`id_vehiculo`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_inv_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`) ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTO_INCREMENT
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `VEHICULOS`               MODIFY `id_vehiculo`  INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `PIEZAS`                  MODIFY `id_pieza`     INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
ALTER TABLE `ROLES`                   MODIFY `id_rol`       INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `USUARIOS`                MODIFY `id_usuario`   INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
ALTER TABLE `CLIENTES`                MODIFY `id_cliente`   INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `SOLICITUDES_PRESUPUESTO` MODIFY `id_solicitud` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `CODIGOS_QR`              MODIFY `id_qr`        INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
ALTER TABLE `MOVIMIENTOS_STOCK`       MODIFY `id_movimiento`INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
ALTER TABLE `NOTIFICACIONES`          MODIFY `id_notif`     INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
ALTER TABLE `NEGOCIACION_HISTORIAL`   MODIFY `id`           INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

COMMIT;
