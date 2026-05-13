-- AutoCiclo — Migración v2 → v3 (Sistema de Negociación)
-- Ejecutar en el servidor: mysql -u root -p autociclo_db < migrar_v2_a_v3.sql

USE `autociclo_db`;

-- 1. Ampliar SOLICITUDES_PRESUPUESTO
ALTER TABLE `SOLICITUDES_PRESUPUESTO`
    MODIFY COLUMN `estado` ENUM('pendiente','en_negociacion','aprobada','rechazada') NOT NULL DEFAULT 'pendiente',
    ADD COLUMN `precio_oferta_cliente` DECIMAL(10,2) DEFAULT NULL AFTER `precio_total`,
    ADD COLUMN `precio_contraoferta`   DECIMAL(10,2) DEFAULT NULL AFTER `precio_oferta_cliente`,
    ADD COLUMN `turno`                 ENUM('cliente','admin') NOT NULL DEFAULT 'admin' AFTER `precio_contraoferta`;

-- Migrar estado antiguo en_revision → en_negociacion
UPDATE `SOLICITUDES_PRESUPUESTO` SET estado = 'en_negociacion' WHERE estado = 'en_revision';

-- 2. Ampliar ENUM de NOTIFICACIONES
ALTER TABLE `NOTIFICACIONES`
    MODIFY COLUMN `tipo` ENUM('stock_bajo','solicitud_nueva','solicitud_actualizada','odoo_pedido','negociacion_nueva','general') NOT NULL;

-- 3. Crear tabla de historial de negociación
CREATE TABLE IF NOT EXISTS `NEGOCIACION_HISTORIAL` (
    `id`           INT            NOT NULL AUTO_INCREMENT,
    `id_solicitud` INT            NOT NULL,
    `ronda`        INT            NOT NULL,
    `autor`        ENUM('cliente','admin') NOT NULL,
    `precio`       DECIMAL(10,2)  NOT NULL,
    `mensaje`      TEXT           DEFAULT NULL,
    `fecha`        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `fk_historial_solicitud` (`id_solicitud`),
    CONSTRAINT `fk_historial_solicitud`
        FOREIGN KEY (`id_solicitud`) REFERENCES `SOLICITUDES_PRESUPUESTO` (`id_solicitud`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
