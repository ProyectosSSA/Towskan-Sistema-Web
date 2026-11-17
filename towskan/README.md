# 🍔 TOWSKAN - SISTEMA WEB INTERACTIVO Y GESTIÓN DE PEDIDOS

Sistema web transaccional para la gestión de pedidos a domicilio, para llevar y consumo en restaurante, con menú digital interactivo, catálogo de platos gourmet y persistencia relacional.

**Proyecto Formativo:** ADSO - Centro Biotecnológico del Caribe (SENA CBC)  
**Normativa Técnica:** ISO/IEC 25010 & ISO/IEC 12207  
**Arquitectura:** Desacoplada en capas (Flask REST API + Next.js App Router + SQLite/MySQL)

---

## 📁 Estructura del Proyecto

```
towskan/
├── backend/                  # Servidor Flask (Arquitectura en Capas)
│   ├── src/
│   │   ├── config/           # Configuración de BD y variables de entorno
│   │   ├── controllers/      # Controladores HTTP (Auth, Pedidos, etc.)
│   │   ├── services/         # Lógica de negocio (Bcrypt, JWT, Cálculos)
│   │   ├── repositories/     # Capa de acceso a datos SQLAlchemy
│   │   ├── models/           # Modelos de base de datos relacionales
│   │   ├── routes/           # Blueprints y enrutamiento REST
│   │   └── errors/           # Manejo centralizado de excepciones JSON
│   ├── requirements.txt      # Dependencias de Python
│   ├── .env.example          # Plantilla de variables de entorno
│   ├── .env                  # Variables activas
│   └── app.py                # Entrada principal del servidor
├── frontend/                 # Cliente web (Next.js 14 + Tailwind CSS)
│   ├── src/
│   │   ├── app/              # Rutas App Router (Inicio, Login, Registro)
│   │   ├── components/       # Componentes visuales reutilizables
│   │   └── services/         # Clientes de API y autenticación real
│   ├── package.json          # Dependencias Node.js
│   └── tailwind.config.js    # Paleta de diseño Gourmet Fast-Food
├── database/
│   └── towskan_db.sql        # Script DDL oficial de 6 entidades para MySQL
├── docs/                     # Diagramas y documentación complementaria
└── PLAN_DE_DESARROLLO_TOWSKAN.md
```

---

## 🚀 Puesta en Marcha (Fase 1)

### 1. Backend (Flask API)

#### Requisitos:
- Python 3.10+ instalado en el sistema.

```powershell
# Acceder al directorio backend
cd "c:\Users\BIBLIOTECA\Documents\nuevo touwskan\towskan\backend"

# Crear y activar entorno virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor backend (Puerto 5000 por defecto)
python app.py
```

* **Healthcheck:** `http://localhost:5000/api/health`
* **Documentación Swagger / OpenAPI:** `http://localhost:5000/docs`

---

### 2. Frontend (Next.js + Tailwind CSS)

#### Requisitos:
- Node.js 18+ y npm/pnpm instalados en el sistema.

```powershell
# Acceder al directorio frontend
cd "c:\Users\BIBLIOTECA\Documents\nuevo touwskan\towskan\frontend"

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

* **Interfaz de Usuario:** `http://localhost:3000`
* **Vistas disponibles:**
  - `http://localhost:3000` (Página de Inicio con Hero)
  - `http://localhost:3000/login` (Inicio de sesión conectado a la BD)
  - `http://localhost:3000/register` (Registro de usuarios con hash bcrypt)

---

## 🔒 Endpoints de Autenticación Disponibles

| Método | Endpoint | Descripción | Acceso |
|---|---|---|---|
| `GET` | `/api/health` | Estado del servicio y versión | Público |
| `POST` | `/api/auth/register` | Registro de usuario (nombre, email, password) | Público |
| `POST` | `/api/auth/login` | Autenticación y emisión de token JWT | Público |
| `POST` | `/api/auth/google` | Aprovisionamiento/Login vía Google OAuth | Público |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado | Requiere `Bearer <token>` |
