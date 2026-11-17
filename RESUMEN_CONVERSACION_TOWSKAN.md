# 📋 HISTORIAL DE CONVERSACIÓN Y ESTADO DEL PROYECTO: TOWSKAN

**Fecha de Registro:** 17 de noviembre de 2026  
**Proyecto:** Towskan - Sistema Web Interactivo y Gestión de Pedidos  
**Programa Formativo:** Análisis y Desarrollo de Software (ADSO) - SENA CBC Regional Cesar  
**Rol del Asistente:** `arquitecto-software-pro` (Arquitecto de Software Senior y Tech Lead Estricto)  
**Ubicación del Proyecto:** `c:\Users\BIBLIOTECA\Documents\nuevo touwskan\towskan`  

---

## 1. Solicitud Inicial del Usuario
El usuario solicitó:
1. Organizar el proyecto de software en una nueva carpeta dentro del directorio raíz (`towskan`).
2. Analizar e integrar todos los archivos de contexto presentes en la carpeta (`Documentacion_Towskan_Completa.docx`, `Caracterización del Proceso - Touskann.pdf`, `-towskan.pdf`, `DIAGRAMA ENTIDAD - RELACION.jpg`, `plantilla_de_fases_general.md`, `requerimientos no funcionales.md` y `skill_arquitecto_de_software_pro.md`).
3. Ejecutar y adaptar el skill **Arquitecto de Software Pro** al proyecto Towskan.
4. Aplicar la directriz de la **Fase 0**: *"si hay alguna inconsistencia o incongruencia me las haces saber para tomar decisiones, no se programa nada hasta tener todo claro"*.

---

## 2. Reglas Fundamentales Aplicadas (Inquebrantables)
- **Cero Mocks (Anti-Simulación):** Prohibido el uso de datos simulados en memoria o `localStorage` falso. Todo conectado a base de datos real con flujos reales de autenticación (Bcrypt + PyJWT).
- **Código Completo:** Sin comentarios de omisión (`// TODO`, `// resto del código`).
- **Método Iterativo Estricto por Fases:** Validación obligatoria de cada fase antes de iniciar la siguiente.

---

## 3. Fase 0: Inconsistencias Detectadas y Decisiones Acordadas

Se realizó una auditoría completa de los documentos fuente y se plantearon 4 decisiones clave al usuario, quien seleccionó las siguientes alternativas oficiales:

| # | Inconsistencia Detectada | Origen del Conflicto | Decisión Oficial Tomada |
|---|---|---|---|
| **1** | **Dominio del Negocio (Gastronomía vs Videojuegos)** | `requerimientos no funcionales.md` contenía menciones a *"jugabilidad"*, *"entre juegos"*, *"desafíos multijugador"* y *"rankings"*. | **Descartadas mecánicas de juegos y AdSense.** El proyecto es 100% una plataforma de restaurante/pedidos. WebSockets se orientará al seguimiento de pedidos en cocina/reparto. |
| **2** | **Stack Frontend** | `.docx` indicaba HTML5 + Bootstrap 5.3.3, mientras que RNF-06 pedía Next.js + React. | **Next.js + React + Tailwind CSS**, garantizando arquitectura modular y reactiva. |
| **3** | **Línea Visual / UI** | RNF-07 pedía *Memphis Design*, pero los mockups de `-towskan.pdf` definían una identidad gastronómica moderna. | **Estilo Gourmet Fast-Food Moderno** (fiel a los mockups de `-towskan.pdf`: naranja cálido `#FF6B00`, crema `#FFFDF9`, tarjetas redondeadas). |
| **4** | **Base de Datos** | RNF-04/05 pedía SQLite con SQLAlchemy; `.docx` y DER especificaban MySQL. | **SQLite con SQLAlchemy** para desarrollo local inmediato y portable, con script DDL oficial compatible con **MySQL/MariaDB**. |

---

## 4. Estado Actual: Fase 1 Completada y Entregada

Se construyó la infraestructura base y el sistema de autenticación real:

### A. Estructura de Carpetas Creada:
- `towskan/backend/`: API Flask estructurada en capas (`config/`, `controllers/`, `services/`, `repositories/`, `models/`, `routes/`, `errors/`).
- `towskan/frontend/`: Aplicación Next.js (App Router) configurada con Tailwind CSS.
- `towskan/database/`: Script SQL oficial.
- `towskan/docs/`: Espacio para documentación y diagramas.

### B. Archivos Generados:
1. **Documentación y Planificación:**
   - [`PLAN_DE_DESARROLLO_TOWSKAN.md`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/PLAN_DE_DESARROLLO_TOWSKAN.md) (Plan de fases 0 a 5).
   - [`README.md`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/README.md) (Instrucciones de instalación y despliegue).
2. **Base de Datos:**
   - [`towskan_db.sql`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/database/towskan_db.sql) (Script DDL normalizado en 3FN con las 6 entidades del DER: `usuarios`, `categorias`, `productos`, `pedidos`, `detalle_pedido`, `pagos`).
3. **Backend (Flask):**
   - [`requirements.txt`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/requirements.txt)
   - [`.env.example`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/.env.example) y [`.env`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/.env)
   - [`settings.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/config/settings.py)
   - [`database.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/config/database.py)
   - [`user.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/models/user.py) (Modelo relacional de usuario)
   - [`user_repository.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/repositories/user_repository.py)
   - [`auth_service.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/services/auth_service.py) (Hash con `bcrypt` y tokens `PyJWT`)
   - [`jwt_middleware.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/services/jwt_middleware.py) (Decorador de protección de rutas)
   - [`auth_controller.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/controllers/auth_controller.py)
   - [`handlers.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/errors/handlers.py) (Manejador centralizado de errores JSON)
   - [`auth_routes.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/src/routes/auth_routes.py)
   - [`app.py`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/backend/app.py) (Con Swagger/OpenAPI en `/docs`)
4. **Frontend (Next.js + Tailwind):**
   - [`package.json`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/package.json)
   - [`tsconfig.json`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/tsconfig.json)
   - [`tailwind.config.js`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/tailwind.config.js)
   - [`postcss.config.js`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/postcss.config.js)
   - [`next.config.js`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/next.config.js)
   - [`.env.local`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/.env.local)
   - [`globals.css`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/app/globals.css)
   - [`layout.tsx`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/app/layout.tsx)
   - [`api.ts`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/services/api.ts) (Cliente HTTP)
   - [`auth.ts`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/services/auth.ts) (Servicio de autenticación real)
   - [`page.tsx`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/app/page.tsx) (Landing / Hero)
   - [`login/page.tsx`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/app/login/page.tsx) (Vista Login fiel a mockups)
   - [`register/page.tsx`](file:///c:/Users/BIBLIOTECA/Documents/nuevo%20touwskan/towskan/frontend/src/app/register/page.tsx) (Vista Registro fiel a mockups)

---

## 5. Cómo Ejecutar el Proyecto

### Backend:
```powershell
cd "c:\Users\BIBLIOTECA\Documents\nuevo touwskan\towskan\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
- Health Check: `http://localhost:5000/api/health`
- Documentación Swagger: `http://localhost:5000/docs`

### Frontend:
```powershell
cd "c:\Users\BIBLIOTECA\Documents\nuevo touwskan\towskan\frontend"
npm install
npm run dev
```
- Portal Web: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Registro: `http://localhost:3000/register`

---

## 6. Próximo Paso (Cómo Retomar la Conversación)

Cuando desees continuar, simplemente escribe:

> **"Hola, revisé el archivo RESUMEN_CONVERSACION_TOWSKAN.md. Doy el visto bueno a la Fase 1. Procedamos con la FASE 2: Entidades Core y CRUD Principal."**

### Alcance de la FASE 2:
1. **Modelos y Repositorios:** `categorias`, `productos`, `pedidos`, `detalle_pedido` y `pagos`.
2. **Servicios de Negocio:**
   - Catálogo de productos con filtros por categoría.
   - Procesamiento atómico de pedidos (cálculo de subtotal, impuestos 8% al consumo, envío según modalidad: domicilio, para llevar o mesa).
   - Registro de transacciones de pago (`efectivo`, `nequi`, `daviplata`, `tarjeta`).
3. **Controladores y Rutas REST:** Endpoints protegidos para gestionar el menú y realizar órdenes.
