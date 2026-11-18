# 🍔 TOWSKAN - SISTEMA WEB INTERACTIVO Y GESTIÓN DE PEDIDOS

Sistema web transaccional integral para la gestión gastronómica de pedidos a domicilio, para llevar y en mesa, con menú digital interactivo, pasarela de pagos, facturación tributaria (INC 8%), rastreo en tiempo real y notificaciones directas a cocina.

* **Programa:** Análisis y Desarrollo de Software (ADSO)
* **Institución:** Centro Biotecnológico del Caribe (SENA CBC Regional Cesar - 2026)
* **Normativa Técnica:** ISO/IEC 25010 (Calidad del Producto) & ISO/IEC 12207 (Procesos del Ciclo de Vida del Software)
* **Marco Legal:** Ley 1581 de 2012 (Protección de Datos Personales de Colombia) y Estatuto Tributario DIAN
* **Filosofía de Desarrollo:** **CERO MOCKS (Anti-Simulación)** y **CÓDIGO COMPLETO (Anti-Pereza)**

---

## 📁 Estructura del Proyecto

```
towskan/
├── backend/                  # Servidor API RESTful (Flask 3.0 + SQLAlchemy 2.0)
│   ├── src/
│   │   ├── config/           # Parámetros de entorno, CORS y SQLAlchemy
│   │   ├── controllers/      # Controladores HTTP y serialización
│   │   ├── errors/           # Gestor centralizado de excepciones y códigos HTTP
│   │   ├── models/           # Entidades ORM (Usuario, Categoria, Producto, Pedido, DetallePedido, Pago)
│   │   ├── repositories/     # Capa de abstracción de datos (SQLAlchemy Query Builder)
│   │   ├── routes/           # Blueprints RESTful modulares
│   │   └── services/         # Lógica de negocio (Bcrypt, JWT, Aritmética Decimal, Facturación)
│   ├── tests/                # Suites de pruebas automatizadas (Fases 1, 2 y 4)
│   ├── app.py                # Punto de entrada de la aplicación
│   ├── requirements.txt      # Dependencias tipadas de Python
│   └── towskan.db            # Base de datos relacional SQLite activa
├── frontend/                 # Cliente Web SPA/SSR (Next.js 14 App Router + Tailwind CSS)
│   ├── src/
│   │   ├── app/              # Enrutamiento App Router (/, /menu, /checkout, /pedidos, /soporte, /login, /register)
│   │   ├── components/       # Componentes visuales (Navbar, Footer, CartDrawer, etc.)
│   │   ├── context/          # Estado global reactivo (CartContext con localStorage)
│   │   └── services/         # Clientes de API con Axios y almacenamiento JWT
│   ├── package.json          # Dependencias y scripts de Node.js
│   └── tailwind.config.js    # Paleta de diseño Gourmet Fast-Food
├── database/
│   └── towskan_db.sql        # Script DDL/DML normalizado (3FN) para MySQL / MariaDB
├── docs/
│   └── AUDITORIA_CALIDAD_ISO_25010.md  # Informe formal de auditoría de calidad de software
└── README.md                 # Manual oficial de despliegue y referencia técnica
```

---

## ⚙️ Requisitos del Sistema

* **Backend:** Python 3.10 a 3.13 con soporte para entornos virtuales (`venv`).
* **Frontend:** Node.js 18.x o superior y npm 9.x+.
* **Base de Datos:** SQLite 3 (incluido por defecto) o MySQL / MariaDB 8.0+.
* **Navegador:** Cualquier navegador moderno compatible con ECMAScript 2022 y Server-Sent Events (Chrome, Edge, Firefox, Safari).

---

## 🚀 Guía de Instalación y Puesta en Marcha

### 1. Despliegue del Backend (Flask REST API)

Abra una terminal de PowerShell en el directorio del proyecto:

```powershell
# 1. Navegar al directorio del backend
cd "towskan\backend"

# 2. Crear el entorno virtual con Python 3.13 (o Python 3.10+)
py -3.13 -m venv venv

# 3. Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# 4. Instalar las dependencias oficiales
pip install -r requirements.txt

# 5. Iniciar el servidor Flask
python app.py
```

* **URL del Backend:** `http://localhost:5000`
* **Healthcheck:** `http://localhost:5000/api/health`
* **Documentación OpenAPI / Swagger:** `http://localhost:5000/docs`

> [!NOTE]
> Al arrancar por primera vez, el servidor ejecuta automáticamente las migraciones DDL y realiza el **poblamiento inicial (seed)** de las 4 categorías gastronómicas y los 13 productos gourmet con descripciones y precios oficiales si la base de datos está vacía.

---

### 2. Despliegue del Frontend (Next.js 14 + Tailwind CSS)

Abra una segunda terminal de PowerShell:

```powershell
# 1. Navegar al directorio del frontend
cd "towskan\frontend"

# 2. Instalar dependencias de Node.js
npm install

# 3. Validar tipado y compilación en modo producción
npm run build

# 4. Iniciar el servidor en modo desarrollo
npm run dev
```

* **URL de la Aplicación Web:** `http://localhost:3000`

---

## 🌐 Mapa de Rutas de la Interfaz Web (Frontend)

| Ruta Web | Propósito y Funcionalidad |
| :--- | :--- |
| `http://localhost:3000/` | **Landing Page:** Hero gastronómico, especialidades destacadas y accesos directos. |
| `http://localhost:3000/menu` | **Menú Digital Interactivo:** Pestañas de categorías, buscador reactivo en vivo y botón de agregar al carrito. |
| `http://localhost:3000/checkout` | **Pasarela de Compra:** Selección de modalidad (Domicilio, Para Llevar, En Mesa), método de pago y confirmación transaccional. |
| `http://localhost:3000/pedidos` | **Historial de Pedidos:** Listado de órdenes del usuario con insignias de estado y fecha. |
| `http://localhost:3000/pedidos/[id]` | **Seguimiento en Vivo:** Stepper interactivo de 4 estados, modal de Factura Digital imprimible, despacho WhatsApp y Simulador de Cocina ADSO. |
| `http://localhost:3000/soporte` | **Centro de Ayuda:** Preguntas frecuentes (FAQ), línea de WhatsApp directa y formulario de contacto. |
| `http://localhost:3000/login` | **Inicio de Sesión:** Autenticación local con validación de credenciales y botón de Google OAuth. |
| `http://localhost:3000/register` | **Registro de Clientes:** Creación de cuenta con salteado Bcrypt rounds=12. |

---

## 📡 Catálogo de Endpoints RESTful (Backend)

### Autenticación y Perfil (`/api/auth`)
* `POST /api/auth/register` — Registro de usuarios (`nombre`, `email`, `password`).
* `POST /api/auth/login` — Autenticación y entrega de token JWT (expira en 24h).
* `POST /api/auth/google` — Inicio de sesión federado Google OAuth.
* `GET /api/auth/me` — Consulta de perfil autenticado (requiere `Authorization: Bearer <token>`).

### Categorías y Menú (`/api/categories`)
* `GET /api/categories` — Lista todas las categorías con conteo de productos asociados.
* `GET /api/categories/<id>` — Detalle de una categoría específica.
* `POST /api/categories` — Creación de categoría (Admin).
* `PUT /api/categories/<id>` — Edición de categoría.
* `DELETE /api/categories/<id>` — Eliminación segura (bloqueada si contiene productos).

### Catálogo de Productos (`/api/products`)
* `GET /api/products` — Consulta de productos con filtros (`?categoria_id=X&disponible=true`).
* `GET /api/products/<id>` — Detalle de un producto.
* `POST /api/products` — Creación de nuevo producto con validación de precio decimal.
* `PUT /api/products/<id>` — Modificación completa de producto.
* `PATCH /api/products/<id>/toggle` — Conmutador rápido de disponibilidad en carta.
* `DELETE /api/products/<id>` — Eliminación (bloqueada si el producto tiene pedidos históricos).
* `POST /api/products/seed` — Disparador manual de siembra del menú gourmet oficial.

### Pedidos Transaccionales (`/api/orders`)
* `POST /api/orders` — Creación atómica de pedido con desglose de ítems, cálculo INC 8% y costo de envío.
* `GET /api/orders` — Historial de pedidos del usuario autenticado (o todos si es Admin).
* `GET /api/orders/<id>` — Consulta detallada de comanda con ítems y pagos.
* `GET /api/orders/<id>/status` — Consulta rápida de estado para sondeo (polling).
* `GET /api/orders/<id>/stream` — Flujo de eventos en tiempo real Server-Sent Events (SSE).
* `GET /api/orders/<id>/receipt` — Generación de comprobante / factura digital DIAN.
* `GET /api/orders/<id>/whatsapp` — Enlace preformateado y comanda para WhatsApp de cocina.
* `POST /api/orders/<id>/cancel` — Cancelación estricta (permitida solo en estado `pendiente`).
* `PATCH /api/orders/<id>/status` — Transición de estado de cocina (`pendiente` → `preparando` → `en camino` → `entregado`).

### Gestión de Pagos (`/api/payments`)
* `POST /api/payments` — Registro de transacción asociada a un pedido (`efectivo`, `nequi`, `daviplata`, `tarjeta`).
* `GET /api/payments/order/<order_id>` — Consulta de transacciones de una orden.
* `PATCH /api/payments/<id>/status` — Aprobación o rechazo de pago.

---

## 🧮 Lógica de Negocio y Reglas Financieras (RNF-03)

1. **Aritmética Exacta:** Todo cálculo se realiza con la clase `Decimal` de Python bajo modo de redondeo `ROUND_HALF_UP`. Ningún cálculo financiero utiliza `float`.
2. **Impuesto Nacional al Consumo (INC 8%):**
   $$\text{Impuestos} = \text{round}(\text{Subtotal} \times 0.08, 2)$$
3. **Cargos por Modalidad de Entrega:**
   * **Domicilio (`domicilio`):** Costo fijo de envío de **\$5.000 COP**.
   * **Para Llevar (`para llevar`):** Costo de envío de **\$0 COP**.
   * **Consumo en Mesa (`en mesa`):** Costo de envío de **\$0 COP** y obligatoriedad de `numero_mesa`.
4. **Política de Cancelación:**
   * Un pedido puede ser cancelado por el cliente **únicamente** cuando su estado es `pendiente`.
   * Si el pedido ya pasó a `preparando` o `en camino`, el sistema deniega la cancelación para evitar mermas en cocina.
5. **Seguridad y Control de Acceso (IDOR):**
   * Cada usuario tiene acceso estrictamente restringido a sus propias órdenes y recibos.

---

## 👤 Credenciales Semilla para Pruebas

Para agilizar la evaluación y auditoría académica del proyecto, la base de datos incluye dos cuentas preconfiguradas:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@towskan.com` | `Towskan2026*` |
| **Cliente Demostración** | `juan.perez@towskan.com` | `Cliente2026*` |

---

## 🧪 Ejecución de Pruebas Automatizadas

El sistema cuenta con suites de prueba automatizadas que validan el 100% de los requisitos funcionales sin requerir servidores externos encendidos:

```powershell
# Activar entorno virtual en backend
cd "towskan\backend"
.\venv\Scripts\Activate.ps1

# 1. Pruebas de Autenticación y JWT (Fase 1)
python tests\test_phase1_auth.py

# 2. Pruebas de CRUD de Entidades Core, Catálogo y Pedidos (Fase 2)
python tests\test_phase2_crud.py

# 3. Pruebas de Lógica Avanzada, Notificaciones, Facturación y SSE (Fase 4)
python tests\test_phase4_advanced.py
```

---

## 📜 Certificaciones y Normativa de Calidad

Para consultar el informe de auditoría detallado con las métricas de calidad de producto y proceso de desarrollo, consulte:  
👉 [`towskan/docs/AUDITORIA_CALIDAD_ISO_25010.md`](file:///c:/Users/UPARSISTEM/Documents/Towskan-Sistema-Web/towskan/docs/AUDITORIA_CALIDAD_ISO_25010.md)
