-- ==============================================================
-- SISTEMA WEB INTERACTIVO Y GESTIÓN DE PEDIDOS «TOWSKAN»
-- Script DDL & DML para SUPABASE (PostgreSQL 15+)
-- Programa ADSO - SENA CBC Regional Cesar (2026)
-- Normativa: ISO/IEC 25010 & ISO/IEC 12207
-- ==============================================================

-- 1. Creación de Tipos ENUM para PostgreSQL
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proveedor_auth_enum') THEN
        CREATE TYPE proveedor_auth_enum AS ENUM ('local', 'google');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pedido_estado_enum') THEN
        CREATE TYPE pedido_estado_enum AS ENUM ('pendiente', 'preparando', 'en camino', 'entregado', 'cancelado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_entrega_enum') THEN
        CREATE TYPE tipo_entrega_enum AS ENUM ('domicilio', 'para llevar', 'en mesa');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pago_metodo_enum') THEN
        CREATE TYPE pago_metodo_enum AS ENUM ('efectivo', 'nequi', 'daviplata', 'tarjeta');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pago_estado_enum') THEN
        CREATE TYPE pago_estado_enum AS ENUM ('pendiente', 'aprobado', 'rechazado');
    END IF;
END $$;

-- 2. Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(250) NULL,
    proveedor proveedor_auth_enum NOT NULL DEFAULT 'local',
    google_id VARCHAR(255) NULL UNIQUE,
    fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT NULL
);

-- 4. Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    imagen VARCHAR(255) NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    impuestos NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    envio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado pedido_estado_enum NOT NULL DEFAULT 'pendiente',
    tipo_entrega tipo_entrega_enum NOT NULL DEFAULT 'domicilio',
    numero_mesa VARCHAR(10) NULL,
    fecha_pedido TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla: detalle_pedido
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad INT NOT NULL DEFAULT 1,
    precio NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL
);

-- 7. Tabla: pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INT NOT NULL REFERENCES pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    metodo pago_metodo_enum NOT NULL,
    proveedor VARCHAR(50) NULL,
    estado pago_estado_enum NOT NULL DEFAULT 'pendiente',
    fecha_pago TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Optimización de Concurrencia
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos (estado);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pedido ON pagos (pedido_id);

-- ==============================================================
-- 8. PERMISOS Y POLÍTICAS RLS (ROW LEVEL SECURITY PARA SUPABASE)
-- ==============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- Permisos globales de esquema para roles anónimos y autenticados
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Políticas de lectura abierta para Catálogo
DROP POLICY IF EXISTS "Public can view categories" ON categorias;
CREATE POLICY "Public can view categories" ON categorias FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view products" ON productos;
CREATE POLICY "Public can view products" ON productos FOR ALL USING (true);

-- Políticas para Usuarios, Pedidos y Pagos
DROP POLICY IF EXISTS "Public can manage users" ON usuarios;
CREATE POLICY "Public can manage users" ON usuarios FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage orders" ON pedidos;
CREATE POLICY "Public can manage orders" ON pedidos FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage order details" ON detalle_pedido;
CREATE POLICY "Public can manage order details" ON detalle_pedido FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage payments" ON pagos;
CREATE POLICY "Public can manage payments" ON pagos FOR ALL USING (true);

-- Habilitar publicaciones en Realtime para pedidos
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;

-- ==============================================================
-- 9. POBLAMIENTO INICIAL (SEMILLAS OFICIALES)
-- ==============================================================

-- 9.1. Usuarios Semilla (Bcrypt rounds=12)
-- Clave Admin: Towskan2026* | Clave Cliente: Cliente2026*
INSERT INTO usuarios (id, nombre, email, password, proveedor, google_id, fecha_registro) VALUES
(1, 'Administrador Towskan', 'admin@towskan.com', '$2b$12$dzo8Bx/xkleNQ7YJV6uTfOBiU0n6QzSpnYxU922rb.EesB1Laf3vW', 'local', NULL, CURRENT_TIMESTAMP),
(2, 'Juan Pérez (Cliente Demo)', 'juan.perez@towskan.com', '$2b$12$6n/VXA2uN3/3NsfjLfpY.epX3pGuDLN/NZgSc9wiRUZhFbUT.oSb6', 'local', NULL, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9.2. Categorías del Menú Gourmet
INSERT INTO categorias (id, nombre_categoria, descripcion) VALUES
(1, 'Hamburguesas Gourmet', 'Carne 100% Angus, pan brioche artesanal y combinaciones exclusivas de autor.'),
(2, 'Acompañamientos', 'Crocantes entradas y porciones para elevar la experiencia Towskan.'),
(3, 'Bebidas & Malteadas', 'Refrescos helados, jugos naturales y malteadas espesas gourmet.'),
(4, 'Salsas & Dips Artesanales', 'Frascos y porciones extras de nuestras recetas de salsas secretas.')
ON CONFLICT (id) DO NOTHING;

-- 9.3. Catálogo de 13 Productos Oficiales
INSERT INTO productos (id, categoria_id, nombre, descripcion, precio, imagen, disponible, fecha_creacion) VALUES
(1, 1, 'Towskan Master Clásica', '200g de carne Angus, queso cheddar fundido, tocineta crujiente, lechuga romana, tomate y salsa Towskan.', 24900.00, '/images/menu/towskan-clasica.jpg', TRUE, CURRENT_TIMESTAMP),
(2, 1, 'Doble Queso & Bacon Blast', 'Doble porción de carne Angus (400g), doble cheddar madurado, cuádruple tocineta ahumada y cebolla caramelizada.', 32900.00, '/images/menu/doble-queso-bacon.jpg', TRUE, CURRENT_TIMESTAMP),
(3, 1, 'Smoked BBQ Crispy Onions', '200g de Angus a la parrilla, queso Monterrey Jack, crujientes aros de cebolla rebozada y salsa BBQ ahumada con miel.', 27900.00, '/images/menu/smoked-bbq.jpg', TRUE, CURRENT_TIMESTAMP),
(4, 1, 'Chicken Volcano Crispy', 'Pechuga de pollo apanada extracrocante marinada en especias, coleslaw fresco, queso pepper jack y mayonesa de ajo asado.', 23900.00, '/images/menu/chicken-crispy.jpg', TRUE, CURRENT_TIMESTAMP),
(5, 2, 'Papas Rústicas Towskan', 'Papas corte grueso sazonadas con paprika, romero y sal marina, acompañadas de dip de ajo.', 9900.00, '/images/menu/papas-rusticas.jpg', TRUE, CURRENT_TIMESTAMP),
(6, 2, 'Salchipapas Especiales', 'Cama de papas francesas crocantes con salchicha manguera premium, queso costeño rallado y tártara de la casa.', 16900.00, '/images/menu/salchipapas.jpg', TRUE, CURRENT_TIMESTAMP),
(7, 2, 'Aros de Cebolla Rebozados', 'Aros de cebolla dulce marinados en cerveza artesanal y fritos al punto dorado.', 11900.00, '/images/menu/aros-cebolla.jpg', TRUE, CURRENT_TIMESTAMP),
(8, 3, 'Malteada de Vainilla & Oreo', 'Helado artesanal de vainilla batido con galletas Oreo trituradas y crema chantilly.', 14500.00, '/images/menu/malteada-oreo.jpg', TRUE, CURRENT_TIMESTAMP),
(9, 3, 'Malteada de Arequipe Colombiano', 'Tradicional arequipe de leche caramelizada con crumble de barquillo crujiente.', 14500.00, '/images/menu/malteada-arequipe.jpg', TRUE, CURRENT_TIMESTAMP),
(10, 3, 'Limonada de Coco Frappé', 'Limones frescos recién exprimidos batidos con crema de coco natural y hielo frappé.', 9500.00, '/images/menu/limonada-coco.jpg', TRUE, CURRENT_TIMESTAMP),
(11, 3, 'Gaseosa 400ml', 'Coca-Cola clásica, Zero, Sprite o Cuatro bien fría en botella personal.', 6000.00, '/images/menu/gaseosa.jpg', TRUE, CURRENT_TIMESTAMP),
(12, 4, 'Salsa Secreta Towskan (Porción)', 'Nuestra emulsión insignia con notas ahumadas, pepinillos dulces y mostaza Dijon.', 3000.00, '/images/menu/salsa-towskan.jpg', TRUE, CURRENT_TIMESTAMP),
(13, 4, 'Queso Cheddar Fundido Extra', 'Copa de cheddar caliente líquido ideal para bañar hamburguesas o papas.', 4500.00, '/images/menu/cheddar-dip.jpg', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9.4. Pedido Demo de Inicialización
INSERT INTO pedidos (id, usuario_id, subtotal, impuestos, envio, total, estado, tipo_entrega, numero_mesa, fecha_pedido) VALUES
(1, 2, 34800.00, 2784.00, 5000.00, 42584.00, 'preparando', 'domicilio', NULL, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO detalle_pedido (id, pedido_id, producto_id, cantidad, precio, subtotal) VALUES
(1, 1, 1, 1, 24900.00, 24900.00),
(2, 1, 5, 1, 9900.00, 9900.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pagos (id, pedido_id, metodo, proveedor, estado, fecha_pago) VALUES
(1, 1, 'nequi', 'Nequi Colombia', 'aprobado', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar secuencias de auto-incremento (SERIAL) para evitar colisiones con nuevos registros
SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 1));
SELECT setval('categorias_id_seq', COALESCE((SELECT MAX(id) FROM categorias), 1));
SELECT setval('productos_id_seq', COALESCE((SELECT MAX(id) FROM productos), 1));
SELECT setval('pedidos_id_seq', COALESCE((SELECT MAX(id) FROM pedidos), 1));
SELECT setval('detalle_pedido_id_seq', COALESCE((SELECT MAX(id) FROM detalle_pedido), 1));
SELECT setval('pagos_id_seq', COALESCE((SELECT MAX(id) FROM pagos), 1));
