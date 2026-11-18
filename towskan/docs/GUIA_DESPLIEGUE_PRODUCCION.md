# 🚀 GUÍA OFICIAL DE DESPLIEGUE EN PRODUCCIÓN
## Sistema Web Interactivo y Gestión de Pedidos «Towskan»
**ADSO - SENA CBC Regional Cesar (2026)**

Esta guía detalla los pasos y consideraciones para publicar la plataforma Towskan en internet para usuarios reales.

---

## 1. Arquitectura de Despliegue en la Nube

Para garantizar alta disponibilidad, velocidad y costo cero o muy bajo, se recomienda la siguiente topología moderna:

```
[ CLIENTES / NAVEGADORES WEB ]
              │ HTTPS (SSL)
              ▼
[ FRONTEND: Vercel (Next.js 14) ]
   - Dominio: https://towskan.vercel.app (o dominio propio .com / .co)
   - Red CDN Global Edge
              │ API Requests (HTTPS)
              ▼
[ BACKEND: Render o Railway (Flask + Gunicorn WSGI) ]
   - Endpoint: https://towskan-api.onrender.com/api
   - 4 Workers de Gunicorn para alta concurrencia
              │ Conexión Segura TCP / SSL
              ▼
[ BASE DE DATOS: MySQL / MariaDB Gestionada ]
   - Proveedores recomendados: Railway MySQL, TiDB Serverless, Aiven o Supabase
   - Esquema DDL cargado desde: towskan/database/towskan_db.sql
```

---

## 2. Checklist Técnico para Producción

| Área | Estado en Local | Requisito en Producción | Acción Requerida |
| :--- | :--- | :--- | :--- |
| **Servidor WSGI** | Werkzeug (`app.run`) | Gunicorn (`Procfile`) | ✅ Listo (`gunicorn` y `Procfile` añadidos) |
| **Base de Datos** | SQLite (`towskan.db`) | MySQL / PostgreSQL remoto | Crear BD en la nube e importar `towskan_db.sql` |
| **Variables de Entorno** | `localhost:5000` / `3000` | URLs de producción HTTPS | Configurar en Vercel y Render |
| **CORS** | `http://localhost:3000` | Dominio del frontend en Vercel | Ajustar `CORS_ORIGINS` en el backend |
| **Catálogo Visual** | 3/13 fotos colocadas | 13/13 fotos colocadas | Descargar las 10 imágenes restantes |
| **Contenedores Docker** | N/A | `docker-compose.yml` | ✅ Dockerfile y compose configurados |

---

## 3. Paso a Paso de Despliegue (Opción Gratuita Recomendada)

### Paso A: Base de Datos MySQL en la Nube (Railway o TiDB Cloud)
1. Crea una cuenta gratuita en [railway.app](https://railway.app).
2. Haz clic en **New Project** ➔ **Provision MySQL**.
3. En la pestaña **Variables**, copia la URL de conexión (`DATABASE_URL`).
4. Abre la consola de base de datos o usa MySQL Workbench/DBeaver y ejecuta el contenido de [`towskan/database/towskan_db.sql`](../database/towskan_db.sql).

---

### Paso B: Desplegar Backend en Render (Python + Flask)
1. Sube tu código a un repositorio de **GitHub**.
2. Entra a [render.com](https://render.com) y crea un **New Web Service**.
3. Selecciona tu repositorio de GitHub (carpeta raíz: `towskan/backend`).
4. Configura:
   * **Runtime:** Python 3
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `gunicorn --workers=4 --bind=0.0.0.0:$PORT app:app`
5. En **Environment Variables**, define:
   * `DATABASE_URL`: *(La URL de conexión a tu MySQL de Railway)*
   * `SECRET_KEY`: *(Una clave secreta criptográfica segura)*
   * `CORS_ORIGINS`: `https://towskan.vercel.app`
   * `FLASK_ENV`: `production`
6. Guarda y despliega. Obtendrás una URL como: `https://towskan-api.onrender.com`.

---

### Paso C: Desplegar Frontend en Vercel (Next.js 14)
1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu GitHub.
2. Haz clic en **Add New Project** e importa tu repositorio.
3. En **Root Directory**, selecciona: `towskan/frontend`.
4. En **Environment Variables**, agrega:
   * `NEXT_PUBLIC_API_URL`: `https://towskan-api.onrender.com/api`
5. Haz clic en **Deploy**.
6. En menos de 2 minutos, tu sitio web estará publicado con HTTPS activo y listo para recibir clientes.

---

## 4. Despliegue Alternativo: Servidor Propio con Docker
Si dispones de una máquina virtual o servidor VPS (Ubuntu/Debian):

```bash
# 1. Clonar repositorio
git clone <URL_DEL_REPOSITORIO>
cd Towskan-Sistema-Web/towskan

# 2. Levantar los 3 contenedores (MySQL + Backend Flask + Frontend Next.js)
docker compose up -d --build
```
Todo el sistema se iniciará automáticamente en los puertos 3000 (web) y 5000 (API).
