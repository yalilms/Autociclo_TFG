-- ============================================================
-- AUTOCICLO DB v2 — Esquema completo (11 tablas)
-- Ampliación del esquema original (3 tablas) con 8 tablas nuevas
-- que cubren usuarios, roles, clientes, solicitudes, QR,
-- movimientos de stock y notificaciones.
--
-- Autor: Yalil Musa Talhaoui
-- TFG · 2º DAM · IES P. Hermenegildo Lanz, Granada
-- Servidor destino: Ubuntu Server IONOS (MySQL 8.0)
-- Generado: 2026-03-08
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

-- ------------------------------------------------------------
-- Base de datos
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `autociclo_db`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `autociclo_db`;

-- ============================================================
-- ORDEN DE DROP (inverso a las FK)
-- ============================================================
DROP TABLE IF EXISTS `NOTIFICACIONES`;
DROP TABLE IF EXISTS `MOVIMIENTOS_STOCK`;
DROP TABLE IF EXISTS `CODIGOS_QR`;
DROP TABLE IF EXISTS `DETALLE_SOLICITUD`;
DROP TABLE IF EXISTS `SOLICITUDES_PRESUPUESTO`;
DROP TABLE IF EXISTS `INVENTARIO_PIEZAS`;
DROP TABLE IF EXISTS `CLIENTES`;
DROP TABLE IF EXISTS `USUARIOS`;
DROP TABLE IF EXISTS `ROLES`;
DROP TABLE IF EXISTS `PIEZAS`;
DROP TABLE IF EXISTS `VEHICULOS`;

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE `ROLES` (
    `id_rol`      INT          NOT NULL AUTO_INCREMENT,
    `nombre`      VARCHAR(50)  NOT NULL,
    `descripcion` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id_rol`),
    UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ROLES` (`nombre`, `descripcion`) VALUES
    ('ADMIN',     'Administrador del sistema con acceso total'),
    ('EMPLEADO',  'Empleado del desguace, gestiona piezas y vehículos'),
    ('CLIENTE',   'Cliente registrado que realiza solicitudes de presupuesto');

-- ============================================================
-- 2. VEHICULOS  (tabla original)
-- ============================================================
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
    (3, '9012GHI', 'Renault', 'Clio',    2012, 'Negro mate',     '2024-03-10', 'desguazando', 2000.00,  220000, 'Estantería B, nivel 2',   'Accidente frontal'),
    (4, '3456JKL', 'Ford',    'Focus',   2016, 'Blanco',         '2024-03-25', 'completo',   12000.00,  150000, 'Zona motores, pasillo 3', 'Uso comercial'),
    (5, '7890MNO', 'Honda',   'CBR',     2019, 'Azul metalizado','2024-04-05', 'desguazado',  3500.00,   25000, NULL,                      'Moto deportiva'),
    (6, '2345PQR', 'Toyota',  'Corolla', 2017, 'Gris',           '2024-04-12', 'desguazando', 7500.00,  120000, 'Patio principal',         'Motor funcional'),
    (7, '6789STU', 'Peugeot', '308',     2014, 'Azul',           '2024-04-20', 'completo',    4500.00,  160000, NULL,                      'Falta rueda delantera');

-- ============================================================
-- 3. PIEZAS  (tabla original)
-- ============================================================
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
    (1,  'MOT-001', 'Motor 1.6 TDI',              'motor',      2500.00, 0, 1,  'Estantería A, nivel 2',    'Volkswagen Golf 2015-2020, Audi A3 2014-2019', '/imagenes/piezas/motor123.png', 'Motor diésel en perfecto estado, 80.000 km reales'),
    (2,  'MOT-002', 'Motor 2.0 HDI',              'motor',      1800.00, 0, 1,  'Zona motores, pasillo 3',  'Peugeot 308 2012-2018, Citroën C4',            NULL,                           'Motor diésel 120CV, revisado y garantizado'),
    (3,  'CAR-025', 'Puerta delantera izquierda', 'carroceria',  200.00, 0, 2,  'Estantería A, nivel 2',    'Renault Clio III generación',                  '/img/MOT001.jpg',              'Puerta completa con cristal y mecanismos'),
    (4,  'CAR-026', 'Capó delantero',             'carroceria',  150.00, 0, 2,  'Zona carrocería, pasillo 1','Seat Ibiza 2012-2016',                         NULL,                           'Capó en buen estado, sin golpes'),
    (5,  'CAR-027', 'Parachoques trasero',        'carroceria',  120.00, 0, 3,  'Estantería C, nivel 1',    'Ford Focus 2010-2015, Seat León 2012-2016',    NULL,                           'Parachoques original, con enganche'),
    (6,  'INT-340', 'Volante multifunción',       'interior',     80.00, 0, 5,  'Zona motores, pasillo 3',  'Universal (adaptable)',                        NULL,                           'Volante con controles de audio y crucero'),
    (7,  'INT-341', 'Asientos delanteros',        'interior',    120.00, 0, 2,  'Zona interior, pasillo 2', 'Seat Ibiza FR, León FR',                       NULL,                           'Par de asientos deportivos, tapicería en buen estado'),
    (8,  'ELE-455', 'Faro delantero LED',         'electronica', 450.00, 0, 1,  'Estantería D, nivel 3',    'Ford Transit 2016-2020',                       NULL,                           'Faro con tecnología LED, lado derecho'),
    (9,  'ELE-456', 'Alternador 120A',            'electronica',  90.00, 0, 3,  'Zona electrónica, pasillo 4','Universal (Bosch)',                           NULL,                           'Alternador 14V 120A, funciona perfectamente'),
    (10, 'RUE-550', 'Disco de freno ventilado 280mm','ruedas',   150.00, 0, 5,  'Zona frenos, estante bajo','Universal deportivo',                          NULL,                           'Disco de competición Brembo'),
    (11, 'RUE-551', 'Neumático 205/55 R16',       'ruedas',       85.00, 0, 10, 'Almacén exterior',         'Universal',                                    NULL,                           'Neumático seminuevo con 6mm de profundidad'),
    (12, 'OTR-700', 'Turbocompresor',             'otros',       800.00, 0, 1,  'Caja fuerte, estante especial','Honda CBR 600-1000',                        NULL,                           'Turbo reparado y certificado, garantía 6 meses');

-- ============================================================
-- 4. INVENTARIO_PIEZAS  (tabla original)
-- ============================================================
CREATE TABLE `INVENTARIO_PIEZAS` (
    `id_vehiculo`     INT            NOT NULL,
    `id_pieza`        INT            NOT NULL,
    `cantidad`        INT            NOT NULL,
    `estado_pieza`    ENUM('nueva','usada','reparada') NOT NULL,
    `fecha_extraccion` DATE          NOT NULL,
    `precio_unitario` DECIMAL(10,2)  NOT NULL,
    `notas`           VARCHAR(255)   DEFAULT NULL,
    PRIMARY KEY (`id_vehiculo`, `id_pieza`),
    KEY `fk_inv_pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `INVENTARIO_PIEZAS`
    (`id_vehiculo`,`id_pieza`,`cantidad`,`estado_pieza`,`fecha_extraccion`,`precio_unitario`,`notas`)
VALUES
    (3, 6,  1, 'usada',    '2024-03-15', 80.00,   'Volante multifunción'),
    (4, 5,  1, 'usada',    '2024-04-01', 120.00,  'Parachoques con enganche'),
    (4, 8,  2, 'nueva',    '2024-04-01', 450.00,  'Par de faros LED nuevos'),
    (5, 10, 2, 'nueva',    '2024-04-10', 150.00,  'Discos Brembo nuevos'),
    (5, 11, 1, 'reparada', '2024-04-10', 800.00,  'Turbo certificado con garantía'),
    (6, 2,  1, 'usada',    '2024-04-15', 1800.00, 'Motor HDI en buen estado'),
    (6, 12, 1, 'usada',    '2024-04-15', 350.00,  'Escape original completo');

-- ============================================================
-- 5. USUARIOS  (nueva)
-- ============================================================
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

-- Contraseñas de prueba: todas son "Autociclo2026!" hasheadas con BCrypt
INSERT INTO `USUARIOS` (`nombre`, `email`, `password_hash`, `id_rol`, `activo`) VALUES
    ('Admin AutoCiclo',  'admin@autociclo.es',    '$2a$12$Qn9X8fTmWkZvL3pUoY1sGeKjHdNb5cRiVwAx7yEz0qIuPsTlMrOF2', 1, 1),
    ('Pedro Empleado',   'pedro@autociclo.es',    '$2a$12$Qn9X8fTmWkZvL3pUoY1sGeKjHdNb5cRiVwAx7yEz0qIuPsTlMrOF2', 2, 1),
    ('María García',     'maria.garcia@email.com','$2a$12$Qn9X8fTmWkZvL3pUoY1sGeKjHdNb5cRiVwAx7yEz0qIuPsTlMrOF2', 3, 1);

-- ============================================================
-- 6. CLIENTES  (nueva)
-- ============================================================
CREATE TABLE `CLIENTES` (
    `id_cliente`  INT          NOT NULL AUTO_INCREMENT,
    `id_usuario`  INT          NOT NULL,
    `telefono`    VARCHAR(20)  DEFAULT NULL,
    `direccion`   VARCHAR(255) DEFAULT NULL,
    `nif`         VARCHAR(15)  DEFAULT NULL,
    PRIMARY KEY (`id_cliente`),
    UNIQUE KEY `uq_clientes_nif` (`nif`),
    UNIQUE KEY `uq_clientes_usuario` (`id_usuario`),
    KEY `fk_clientes_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- El usuario con rol CLIENTE (id=3) tiene su perfil de cliente
INSERT INTO `CLIENTES` (`id_usuario`, `telefono`, `direccion`, `nif`) VALUES
    (3, '611223344', 'Calle Gran Vía 12, Granada', '12345678A');

-- ============================================================
-- 7. SOLICITUDES_PRESUPUESTO  (nueva)
-- ============================================================
CREATE TABLE `SOLICITUDES_PRESUPUESTO` (
    `id_solicitud`    INT           NOT NULL AUTO_INCREMENT,
    `id_cliente`      INT           NOT NULL,
    `fecha_solicitud` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `estado`          ENUM('pendiente','en_revision','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    `respuesta_admin` TEXT          DEFAULT NULL,
    `precio_total`    DECIMAL(10,2) DEFAULT NULL,
    PRIMARY KEY (`id_solicitud`),
    KEY `fk_solicitudes_cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Solicitud de prueba
INSERT INTO `SOLICITUDES_PRESUPUESTO` (`id_cliente`, `fecha_solicitud`, `estado`) VALUES
    (1, '2026-03-08 10:00:00', 'pendiente');

-- ============================================================
-- 8. DETALLE_SOLICITUD  (nueva)
-- ============================================================
CREATE TABLE `DETALLE_SOLICITUD` (
    `id_solicitud` INT          NOT NULL,
    `id_pieza`     INT          NOT NULL,
    `cantidad`     INT          NOT NULL DEFAULT 1,
    `notas`        VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id_solicitud`, `id_pieza`),
    KEY `fk_detalle_pieza` (`id_pieza`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Detalle de la solicitud de prueba
INSERT INTO `DETALLE_SOLICITUD` (`id_solicitud`, `id_pieza`, `cantidad`, `notas`) VALUES
    (1, 2, 1, 'Motor para Peugeot 308 2014'),
    (1, 5, 1, NULL);

-- ============================================================
-- 9. CODIGOS_QR  (nueva)
-- ============================================================
CREATE TABLE `CODIGOS_QR` (
    `id_qr`            INT          NOT NULL AUTO_INCREMENT,
    `codigo_unico`     VARCHAR(100) NOT NULL,
    `tipo`             ENUM('pieza','vehiculo') NOT NULL,
    `id_referencia`    INT          NOT NULL,
    `fecha_generacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_qr`),
    UNIQUE KEY `uq_codigos_qr_codigo` (`codigo_unico`),
    KEY `idx_codigos_qr_tipo_ref` (`tipo`, `id_referencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QR de prueba para un vehículo y una pieza
INSERT INTO `CODIGOS_QR` (`codigo_unico`, `tipo`, `id_referencia`) VALUES
    ('QR-VEH-00003', 'vehiculo', 3),
    ('QR-PIE-00001', 'pieza',    1);

-- ============================================================
-- 10. MOVIMIENTOS_STOCK  (nueva)
-- ============================================================
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

-- Movimiento de prueba: entrada de stock registrada por el admin
INSERT INTO `MOVIMIENTOS_STOCK` (`id_pieza`, `tipo`, `cantidad`, `id_usuario`, `notas`) VALUES
    (1, 'entrada', 2, 1, 'Entrada inicial de motores 1.6 TDI');

-- ============================================================
-- 11. NOTIFICACIONES  (nueva)
-- ============================================================
CREATE TABLE `NOTIFICACIONES` (
    `id_notif`       INT          NOT NULL AUTO_INCREMENT,
    `id_usuario`     INT          NOT NULL,
    `tipo`           ENUM('stock_bajo','solicitud_nueva','solicitud_actualizada','general') NOT NULL,
    `mensaje`        TEXT         NOT NULL,
    `leida`          TINYINT(1)   NOT NULL DEFAULT 0,
    `fecha_creacion` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id_notif`),
    KEY `fk_notif_usuario` (`id_usuario`),
    KEY `idx_notif_leida` (`leida`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificación de prueba para el admin
INSERT INTO `NOTIFICACIONES` (`id_usuario`, `tipo`, `mensaje`) VALUES
    (1, 'solicitud_nueva',     'Nueva solicitud de presupuesto recibida de María García'),
    (2, 'stock_bajo',          'Stock del Motor 1.6 TDI (MOT-001) por debajo del mínimo');

-- ============================================================
-- CLAVES FORÁNEAS
-- ============================================================

-- USUARIOS → ROLES
ALTER TABLE `USUARIOS`
    ADD CONSTRAINT `fk_usuarios_rol`
        FOREIGN KEY (`id_rol`) REFERENCES `ROLES` (`id_rol`)
        ON UPDATE CASCADE;

-- CLIENTES → USUARIOS
ALTER TABLE `CLIENTES`
    ADD CONSTRAINT `fk_clientes_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- SOLICITUDES_PRESUPUESTO → CLIENTES
ALTER TABLE `SOLICITUDES_PRESUPUESTO`
    ADD CONSTRAINT `fk_solicitudes_cliente`
        FOREIGN KEY (`id_cliente`) REFERENCES `CLIENTES` (`id_cliente`)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- DETALLE_SOLICITUD → SOLICITUDES_PRESUPUESTO y PIEZAS
ALTER TABLE `DETALLE_SOLICITUD`
    ADD CONSTRAINT `fk_detalle_solicitud`
        FOREIGN KEY (`id_solicitud`) REFERENCES `SOLICITUDES_PRESUPUESTO` (`id_solicitud`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_detalle_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`)
        ON UPDATE CASCADE;

-- MOVIMIENTOS_STOCK → PIEZAS y USUARIOS
ALTER TABLE `MOVIMIENTOS_STOCK`
    ADD CONSTRAINT `fk_movstock_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`)
        ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_movstock_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`)
        ON UPDATE CASCADE;

-- NOTIFICACIONES → USUARIOS
ALTER TABLE `NOTIFICACIONES`
    ADD CONSTRAINT `fk_notif_usuario`
        FOREIGN KEY (`id_usuario`) REFERENCES `USUARIOS` (`id_usuario`)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- INVENTARIO_PIEZAS → VEHICULOS y PIEZAS (tabla original)
ALTER TABLE `INVENTARIO_PIEZAS`
    ADD CONSTRAINT `fk_inv_vehiculo`
        FOREIGN KEY (`id_vehiculo`) REFERENCES `VEHICULOS` (`id_vehiculo`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `fk_inv_pieza`
        FOREIGN KEY (`id_pieza`) REFERENCES `PIEZAS` (`id_pieza`)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- AUTO_INCREMENT explícito (por si se reimporta)
-- ============================================================
ALTER TABLE `VEHICULOS`  MODIFY `id_vehiculo`    INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `PIEZAS`     MODIFY `id_pieza`       INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
ALTER TABLE `ROLES`      MODIFY `id_rol`         INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `USUARIOS`   MODIFY `id_usuario`     INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `CLIENTES`   MODIFY `id_cliente`     INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `SOLICITUDES_PRESUPUESTO` MODIFY `id_solicitud` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `CODIGOS_QR` MODIFY `id_qr`          INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `MOVIMIENTOS_STOCK` MODIFY `id_movimiento` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `NOTIFICACIONES`    MODIFY `id_notif`      INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
