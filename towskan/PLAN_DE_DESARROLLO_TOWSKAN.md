# PLAN DE ARQUITECTURA Y DESARROLLO ITERATIVO: TOWSKAN

**Proyecto:** Towskan - Sistema Web Interactivo y Gestión de Pedidos  
**Programa:** Análisis y Desarrollo de Software (ADSO) - SENA CBC  
**Rol del Agente:** `arquitecto-software-pro` (Arquitecto de Software Senior & Tech Lead)  
**Normas de Referencia:** ISO/IEC 25010 (Calidad) & ISO/IEC 12207 (Ciclo de Vida)

---

## 1. Directrices Fundamentales del Proyecto (Inquebrantables)
1. **Cero Mocks (Anti-Simulación):** Todo módulo estará respaldado por una base de datos real y flujos reales de autenticación (JWT / Sesiones / Hash seguro con bcrypt/Argon2).
2. **Código Completo (Anti-Pereza):** Cero placeholders como `// TODO` o `// Agrega tu código aquí`. Archivos listos para producción.
3. **Desarrollo Iterativo Estricto por Fases:** No se avanza a la siguiente fase sin la validación y confirmación explícita del usuario de que la fase anterior compila y funciona.
4. **Fase 0 Obligatoria:** No se genera código de negocio hasta resolver las inconsistencias detectadas en los requisitos.

---

## 2. Inconsistencias Críticas Detectadas (Fase 0)

Tras auditar exhaustivamente los archivos proporcionados (`Documentacion_Towskan_Completa.docx`, `Caracterización del Proceso - Touskann.pdf`, `-towskan.pdf`, `DIAGRAMA ENTIDAD - RELACION.jpg` y `requerimientos no funcionales.md`), se identificaron las siguientes discrepancias:

| # | Elemento | Documentación Oficial / Mockups (`.docx`, `.pdf`, DER) | Archivo `requerimientos no funcionales.md` | Diagnóstico / Propuesta de Solución |
|---|---|---|---|---|
| **1** | **Dominio del Negocio** | Restaurante / Comidas rápidas y gourmet (Hamburguesas, papas, bebidas, pedidos a domicilio, para llevar o en mesa). | Menciona mecánicas de videojuegos: *"jugabilidad"*, *"entre juegos"*, *"desafíos multijugador"*, *"nuevos juegos"*, *"rankings/puntajes"*. | **Incongruencia evidente:** Se importaron RNF de un proyecto de juegos. En Towskan debe eliminarse la jerga de juegos y enfocarse 100% en el sistema gastronómico. WebSockets puede reorientarse al rastreo de pedidos en tiempo real. |
| **2** | **Línea Visual / UI** | Diseño Moderno Gourmet Fast-Food (naranja cálido `#FF6B00`, fondos crema suave `#FFF8F3`, tarjetas limpias, tipografía moderna, ver `-towskan.pdf`). | Exige **Memphis Design** (patrones geométricos ochenteros, colores estridentes). | **Conflicto de diseño:** Los mockups de `-towskan.pdf` definen una identidad visual cálida de restaurante. Se recomienda seguir los mockups de `-towskan.pdf` y descartar el estilo Memphis salvo indicación contraria del usuario. |
| **3** | **Stack Frontend** | HTML5 semántico + CSS3 + Bootstrap 5.3.3 + JavaScript Vanilla (ES6+). | **React con Next.js**. | **Decisión técnica:** Decidir entre: <br>a) **Next.js + React + Tailwind CSS** (arquitectura moderna, escalable, componentes modulares). <br>b) **HTML5 semántico + Bootstrap 5.3.3 + JavaScript ES6+** (stack original documentado para el entregable ADSO SENA). |
| **4** | **Base de Datos** | **MySQL / MariaDB** (con script SQL `towskan_db.sql` y tipos nativos `DECIMAL(10,2)`). | **SQLite** inicial con migración posterior a MySQL/PostgreSQL mediante SQLAlchemy. | **Decisión técnica:** SQLAlchemy abstrae el motor, por lo que podemos usar **SQLite** para desarrollo local rápido sin instalaciones complejas de servidor y dejar el script DDL compatible con **MySQL/MariaDB**. |
| **5** | **Publicidad (Google AdSense)** | No contemplada (un e-commerce de comida no muestra anuncios que alejen a sus clientes). | Exige espacios `ADSENSE_SLOT_HEADER`, `ADSENSE_SLOT_SIDEBAR`, etc. | **Recomendación:** Excluir AdSense de las pantallas transaccionales o definir si realmente se requieren slots de banners. |

---

## 3. Modelo de Entidades Oficial (DER Towskan)
Basado en `DIAGRAMA ENTIDAD - RELACION.jpg` y la documentación técnica formal:

1. **`usuarios`**: `id`, `nombre`, `email`, `password`, `proveedor` ('local', 'google'), `google_id`, `fecha_registro`.
2. **`categorias`**: `id`, `nombre_categoria`, `descripcion`.
3. **`productos`**: `id`, `categoria_id` (FK), `nombre`, `descripcion`, `precio`, `imagen`, `disponible`, `fecha_creacion`.
4. **`pedidos`**: `id`, `usuario_id` (FK), `subtotal`, `impuestos`, `envio`, `total`, `estado` ('pendiente', 'preparando', 'en camino', 'entregado', 'cancelado'), `tipo_entrega` ('domicilio', 'para llevar', 'en mesa'), `numero_mesa`, `fecha_pedido`.
5. **`detalle_pedido`**: `id`, `pedido_id` (FK), `producto_id` (FK), `cantidad`, `precio`, `subtotal`.
6. **`pagos`**: `id`, `pedido_id` (FK), `metodo` ('efectivo', 'nequi', 'daviplata', 'tarjeta'), `proveedor`, `estado` ('pendiente', 'aprobado', 'rechazado'), `fecha_pago`.

---

## 4. Estructura de Directorios del Proyecto
```
towskan/
├── backend/
│   ├── src/
│   │   ├── config/          # Variables de entorno y configuración de BD
│   │   ├── controllers/     # Controladores HTTP (manejo de req/res)
│   │   ├── services/        # Lógica de negocio (cálculos, reglas, órdenes)
│   │   ├── repositories/    # Acceso a datos con SQLAlchemy
│   │   ├── models/          # Modelos de dominio (6 entidades)
│   │   ├── routes/          # Blueprints / endpoints REST
│   │   └── errors/          # Manejo centralizado de excepciones
│   ├── requirements.txt
│   └── app.py               # Entrada del servidor Flask
├── frontend/                # Vistas y componentes (Next.js o HTML/Bootstrap)
├── database/                # Scripts SQL (towskan_db.sql, seeds iniciales)
├── docs/                    # Diagramas, especificaciones OpenAPI/Swagger
└── PLAN_DE_DESARROLLO_TOWSKAN.md
```

---

## 5. Índice de Fases Adaptado

### 🔍 FASE 0: Diagnóstico, Despeje de Inconsistencias y Aprobación de Arquitectura (ACTUAL)
* Objetivo: Validar el stack, descartar requerimientos incongruentes y definir el estilo visual.
* Entregables: Estructura de carpetas inicial y documento de arquitectura.

### 🛠️ FASE 1: Setup Backend, Persistencia y Autenticación Base
* Backend Flask con arquitectura en capas (`controllers/`, `services/`, `repositories/`, `models/`, `routes/`).
* Configuración de SQLAlchemy con las 6 entidades relacionales (SQLite / MySQL).
* Flujo de autenticación completo (Registro, Login local con bcrypt y soporte de Google OAuth, emisión de JWT).
* Endpoints de Swagger/OpenAPI iniciales.

### 🗄️ FASE 2: Entidades Core y CRUD Transaccional
* Endpoints para Categorías y Catálogo de Productos (con filtro y disponibilidad).
* Motor transaccional de Pedidos (`pedidos` y `detalle_pedido`) con cálculo exacto de subtotales, impuestos (8% consumo) y envío.
* Registro de Pagos (`efectivo`, `nequi`, `daviplata`, `tarjeta`) y cambios de estado.
* Pruebas de API y respuestas JSON estandarizadas.

### 🎨 FASE 3: Frontend y Vistas Basadas en Mockups
* Implementación de las pantallas visuales exactas de `-towskan.pdf`:
  - Inicio / Landing con Hero, Favoritos y propuesta de valor.
  - Menú interactivo con selector de categorías y mini-carrito lateral.
  - Vistas de Pedido detallado con controles reactivos (`+` / `-` / eliminar).
  - Pasarela de Pago con selección de modalidad (Domicilio, Para Llevar, Mesa).
  - Vistas de Soporte, Login y Registro.
* Integración con la API REST del backend.

### ⚙️ FASE 4: Lógica de Negocio Avanzada y Notificaciones
* Integración de confirmación y envío de pedidos a WhatsApp (según mockups).
* Actualización de estados de pedidos en tiempo real (Socket.IO opcional para cocina/cliente).
* Validaciones robustas de stock/disponibilidad y montos monetarios.

### 🚀 FASE 5: Refinamiento, Testing y Documentación Final
* Pruebas de usabilidad e integración según normas ISO/IEC 25010 y 12207.
* Script SQL de carga (`towskan_db.sql`) con datos de prueba reales (hamburguesas, bebidas, etc.).
* `README.md` completo y manual de ejecución local.
