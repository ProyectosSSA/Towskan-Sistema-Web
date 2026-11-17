-- ==============================================================
-- SISTEMA WEB INTERACTIVO Y GESTIÓN DE PEDIDOS «TOWSKAN»
-- Script DDL de Base de Datos Relacional Normalizada (3FN)
-- Programa ADSO - SENA CBC Regional Cesar (2026)
-- Normativa: ISO/IEC 25010 & ISO/IEC 12207
-- ==============================================================

-- 1. Creación de la base de datos
CREATE DATABASE IF NOT EXISTS `towskan_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `towskan_db`;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `pagos`;
DROP TABLE IF EXISTS `detalle_pedido`;
DROP TABLE IF EXISTS `pedidos`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `categorias`;
DROP TABLE IF EXISTS `usuarios`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================
-- 2. Tabla: usuarios
-- Soporta autenticación local y Google OAuth
-- ==============================================================
CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(250) NULL,
    `proveedor` ENUM('local', 'google') NOT NULL DEFAULT 'local',
    `google_id` VARCHAR(255) NULL UNIQUE,
    `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==============================================================
-- 3. Tabla: categorias
-- Clasificación de menú (Hamburguesas, Acompañamientos, Bebidas, Salsas)
-- ==============================================================
CREATE TABLE `categorias` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_categoria` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL
) ENGINE=InnoDB;

-- ==============================================================
-- 4. Tabla: productos
-- Ítems individuales comercializados
-- ==============================================================
CREATE TABLE `productos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `categoria_id` INT NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `precio` DECIMAL(10,2) NOT NULL,
    `imagen` VARCHAR(255) NULL,
    `disponible` TINYINT(1) NOT NULL DEFAULT 1,
    `fecha_creacion` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_productos_categorias`
        FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==============================================================
-- 5. Tabla: pedidos
-- Órdenes transaccionales en 3 modalidades (domicilio, llevar, mesa)
-- ==============================================================
CREATE TABLE `pedidos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `usuario_id` INT NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `impuestos` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `envio` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `estado` ENUM('pendiente', 'preparando', 'en camino', 'entregado', 'cancelado') NOT NULL DEFAULT 'pendiente',
    `tipo_entrega` ENUM('domicilio', 'para llevar', 'en mesa') NOT NULL DEFAULT 'domicilio',
    `numero_mesa` VARCHAR(10) NULL,
    `fecha_pedido` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pedidos_usuarios`
        FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==============================================================
-- 6. Tabla: detalle_pedido
-- Entidad asociativa (N:M) entre pedidos y productos
-- ==============================================================
CREATE TABLE `detalle_pedido` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pedido_id` INT NOT NULL,
    `producto_id` INT NOT NULL,
    `cantidad` INT NOT NULL DEFAULT 1,
    `precio` DECIMAL(10,2) NOT NULL,
    `subtotal` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `fk_detalle_pedidos`
        FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_detalle_productos`
        FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ==============================================================
-- 7. Tabla: pagos
-- Control de transacciones y estados de pago
-- ==============================================================
CREATE TABLE `pagos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `pedido_id` INT NOT NULL,
    `metodo` ENUM('efectivo', 'nequi', 'daviplata', 'tarjeta') NOT NULL,
    `proveedor` VARCHAR(50) NULL,
    `estado` ENUM('pendiente', 'aprobado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    `fecha_pago` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pagos_pedidos`
        FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

-- Índices adicionales para optimización de consultas frecuentes (RNF-18)
CREATE INDEX `idx_pedidos_usuario` ON `pedidos` (`usuario_id`);
CREATE INDEX `idx_pedidos_estado` ON `pedidos` (`estado`);
CREATE INDEX `idx_productos_categoria` ON `productos` (`categoria_id`);
