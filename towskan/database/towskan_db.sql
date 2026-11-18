-- ==============================================================
-- SISTEMA WEB INTERACTIVO Y GESTIÓN DE PEDIDOS «TOWSKAN»
-- Script DDL & DML de Base de Datos Relacional Normalizada (3FN)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- 3. Tabla: categorias
-- Clasificación de menú gastronómico Towskan
-- ==============================================================
CREATE TABLE `categorias` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_categoria` VARCHAR(100) NOT NULL UNIQUE,
    `descripcion` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- 4. Tabla: productos
-- Ítems individuales comercializados con precisión decimal
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- 5. Tabla: pedidos
-- Órdenes transaccionales en 3 modalidades (domicilio, para llevar, en mesa)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- 7. Tabla: pagos
-- Control de transacciones y pasarelas de pago
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices de optimización de alta concurrencia (RNF-18 / ISO/IEC 25010)
CREATE INDEX `idx_pedidos_usuario` ON `pedidos` (`usuario_id`);
CREATE INDEX `idx_pedidos_estado` ON `pedidos` (`estado`);
CREATE INDEX `idx_productos_categoria` ON `productos` (`categoria_id`);
CREATE INDEX `idx_pagos_pedido` ON `pagos` (`pedido_id`);

-- ==============================================================
-- 8. POBLAMIENTO INICIAL DE DATOS (DML / SEMILLAS OFICIALES)
-- ==============================================================

-- 8.1. Usuarios Base (Contraseñas con salteado Bcrypt rounds=12)
-- Clave Admin: Towskan2026* | Clave Cliente: Cliente2026*
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `proveedor`, `google_id`, `fecha_registro`) VALUES
(1, 'Administrador Towskan', 'admin@towskan.com', '$2b$12$dzo8Bx/xkleNQ7YJV6uTfOBiU0n6QzSpnYxU922rb.EesB1Laf3vW', 'local', NULL, NOW()),
(2, 'Juan Pérez (Cliente Demo)', 'juan.perez@towskan.com', '$2b$12$6n/VXA2uN3/3NsfjLfpY.epX3pGuDLN/NZgSc9wiRUZhFbUT.oSb6', 'local', NULL, NOW());

-- 8.2. Categorías del Menú Gourmet
INSERT INTO `categorias` (`id`, `nombre_categoria`, `descripcion`) VALUES
(1, 'Hamburguesas Gourmet', 'Carne 100% Angus, pan brioche artesanal y combinaciones exclusivas de autor.'),
(2, 'Acompañamientos', 'Crocantes entradas y porciones para elevar la experiencia Towskan.'),
(3, 'Bebidas & Malteadas', 'Refrescos helados, jugos naturales y malteadas espesas gourmet.'),
(4, 'Salsas & Dips Artesanales', 'Frascos y porciones extras de nuestras recetas de salsas secretas.');

-- 8.3. Catálogo de 13 Productos Oficiales
INSERT INTO `productos` (`id`, `categoria_id`, `nombre`, `descripcion`, `precio`, `imagen`, `disponible`, `fecha_creacion`) VALUES
-- Hamburguesas Gourmet
(1, 1, 'Towskan Master Clásica', '200g de carne Angus, queso cheddar fundido, tocineta crujiente, lechuga romana, tomate y salsa Towskan.', 24900.00, '/images/menu/towskan-clasica.jpg', 1, NOW()),
(2, 1, 'Doble Queso & Bacon Blast', 'Doble porción de carne Angus (400g), doble cheddar madurado, cuádruple tocineta ahumada y cebolla caramelizada.', 32900.00, '/images/menu/doble-queso-bacon.jpg', 1, NOW()),
(3, 1, 'Smoked BBQ Crispy Onions', '200g de Angus a la parrilla, queso Monterrey Jack, crujientes aros de cebolla rebozada y salsa BBQ ahumada con miel.', 27900.00, '/images/menu/smoked-bbq.jpg', 1, NOW()),
(4, 1, 'Chicken Volcano Crispy', 'Pechuga de pollo apanada extracrocante marinada en especias, coleslaw fresco, queso pepper jack y mayonesa de ajo asado.', 23900.00, '/images/menu/chicken-crispy.jpg', 1, NOW()),

-- Acompañamientos
(5, 2, 'Papas Rústicas Towskan', 'Papas corte grueso sazonadas con paprika, romero y sal marina, acompañadas de dip de ajo.', 9900.00, '/images/menu/papas-rusticas.jpg', 1, NOW()),
(6, 2, 'Salchipapas Especiales', 'Cama de papas francesas crocantes con salchicha manguera premium, queso costeño rallado y tártara de la casa.', 16900.00, '/images/menu/salchipapas.jpg', 1, NOW()),
(7, 2, 'Aros de Cebolla Rebozados', 'Aros de cebolla dulce marinados en cerveza artesanal y fritos al punto dorado.', 11900.00, '/images/menu/aros-cebolla.jpg', 1, NOW()),

-- Bebidas & Malteadas
(8, 3, 'Malteada de Vainilla & Oreo', 'Helado artesanal de vainilla batido con galletas Oreo trituradas y crema chantilly.', 14500.00, '/images/menu/malteada-oreo.jpg', 1, NOW()),
(9, 3, 'Malteada de Arequipe Colombiano', 'Tradicional arequipe de leche caramelizada con crumble de barquillo crujiente.', 14500.00, '/images/menu/malteada-arequipe.jpg', 1, NOW()),
(10, 3, 'Limonada de Coco Frappé', 'Limones frescos recién exprimidos batidos con crema de coco natural y hielo frappé.', 9500.00, '/images/menu/limonada-coco.jpg', 1, NOW()),
(11, 3, 'Gaseosa 400ml', 'Coca-Cola clásica, Zero, Sprite o Cuatro bien fría en botella personal.', 6000.00, '/images/menu/gaseosa.jpg', 1, NOW()),

-- Salsas & Dips Artesanales
(12, 4, 'Salsa Secreta Towskan (Porción)', 'Nuestra emulsión insignia con notas ahumadas, pepinillos dulces y mostaza Dijon.', 3000.00, '/images/menu/salsa-towskan.jpg', 1, NOW()),
(13, 4, 'Queso Cheddar Fundido Extra', 'Copa de cheddar caliente líquido ideal para bañar hamburguesas o papas.', 4500.00, '/images/menu/cheddar-dip.jpg', 1, NOW());

-- 8.4. Pedido de Demostración Inicial (Validación de Integridad Referencial)
INSERT INTO `pedidos` (`id`, `usuario_id`, `subtotal`, `impuestos`, `envio`, `total`, `estado`, `tipo_entrega`, `numero_mesa`, `fecha_pedido`) VALUES
(1, 2, 34800.00, 2784.00, 5000.00, 42584.00, 'preparando', 'domicilio', NULL, NOW());

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio`, `subtotal`) VALUES
(1, 1, 1, 1, 24900.00, 24900.00),
(2, 1, 5, 1, 9900.00, 9900.00);

INSERT INTO `pagos` (`id`, `pedido_id`, `metodo`, `proveedor`, `estado`, `fecha_pago`) VALUES
(1, 1, 'nequi', 'Nequi Colombia', 'aprobado', NOW());
