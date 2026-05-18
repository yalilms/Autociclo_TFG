-- AutoCiclo — Fix: añadir 'pagada' y 'enviado' al ENUM de estado en SOLICITUDES_PRESUPUESTO
-- Ejecutar en el servidor: mysql -u autociclo -pautociclo1234 autociclo_db < fix_pagada_enum.sql

USE `autociclo_db`;

ALTER TABLE `SOLICITUDES_PRESUPUESTO`
    MODIFY COLUMN `estado`
    ENUM('pendiente','en_negociacion','aprobada','rechazada','pagada','enviado')
    NOT NULL DEFAULT 'pendiente';

-- Verificar que el cambio se aplicó
SELECT COLUMN_TYPE FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'autociclo_db'
  AND TABLE_NAME = 'SOLICITUDES_PRESUPUESTO'
  AND COLUMN_NAME = 'estado';
