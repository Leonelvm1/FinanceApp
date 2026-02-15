# 🚀 Deploy Guide - FinanceApp

Guía completa para desplegar FinanceApp con **Vercel** (Frontend), **Render** (Backend) y **Neon** (Base de Datos).

---

## 📋 Prerrequisitos

- [Vercel Account](https://vercel.com) - Frontend
- [Render Account](https://render.com) - Backend
- [Neon Account](https://neon.tech) - PostgreSQL Database
- GitHub repository con el código

---

## 1️⃣ Configurar Base de Datos - Neon

### Paso 1: Crear proyecto en Neon

1. Ve a [neon.tech](https://neon.tech)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. Nota la `DATABASE_URL` (será parecida a: `postgresql://user:password@host/db?sslmode=require`)

### Paso 2: Ejecutar migraciones

```bash
# Localmente, antes de desplegar
cd backend
alembic upgrade head
```

---

## 2️⃣ Desplegar Backend - Render

### Paso 1: Conectar GitHub a Render

1. Ve a [render.com](https://render.com)
2. Inicia sesión con GitHub
3. Selecciona "New+" → "Web Service"
4. Conecta tu repositorio

### Paso 2: Configurar servicio

- **Name**: `financeapp-backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt && cd backend && alembic upgrade head`
- **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Plan**: Free (o plan que prefieras)

### Paso 3: Agregar variables de entorno en Render

En el dashboard de Render, ve a "Environment" y agrega:

| Key                           | Value                          | Notas                                      |
| ----------------------------- | ------------------------------ | ------------------------------------------ |
| `DATABASE_URL`                | (del paso Neon)                | URL completa de conexión                   |
| `SECRET_KEY`                  | (genera una clave fuerte)      | No uses la del .env local                  |
| `ALGORITHM`                   | `HS256`                        | Estándar JWT                               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                           | Tiempo de sesión                           |
| `COOKIE_SECURE`               | `true`                         | Requerido para HTTPS                       |
| `FRONTEND_ORIGINS`            | `https://tudominio.vercel.app` | Se actualiza después de desplegar frontend |

### Paso 4: Deploy

- Click en "Create Web Service"
- Espera a que se construya (logs visibles en tiempo real)
- Anota la URL: `https://financeapp-backend.onrender.com`

---

## 3️⃣ Desplegar Frontend - Vercel

### Paso 1: Conectar a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con GitHub
3. Selecciona "Add New..." → "Project"
4. Conecta tu repositorio

### Paso 2: Configurar proyecto

- **Framework Preset**: Vite (detecta automáticamente)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Paso 3: Agregar variables de entorno en Vercel

En "Environment Variables" agrega:

| Key            | Value                                     |
| -------------- | ----------------------------------------- |
| `VITE_API_URL` | `https://financeapp-backend.onrender.com` |

### Paso 4: Deploy

- Click en "Deploy"
- Espera a que se complete
- Anota la URL: `https://your-vercel-url.vercel.app`

---

## 4️⃣ Actualizar CORS en Backend

Después de tener la URL de Vercel, actualiza en Render:

1. Ve al dashboard de Render
2. Selecciona tu servicio backend
3. Ve a "Environment"
4. Actualiza `FRONTEND_ORIGINS` con tu URL de Vercel:
   ```
   https://your-vercel-url.vercel.app,https://www.your-vercel-url.vercel.app
   ```
5. Click en "Save" (se redesplegará automáticamente)

---

## 5️⃣ Verificar Conexiones

### En el Frontend (Vercel)

- Abre tu app de Vercel
- Intenta loguear o crear una cuenta
- Abre DevTools → Network y verifica:
  - ✅ Las requests van a `https://financeapp-backend.onrender.com`
  - ✅ Las cookies se envían (`Cookie` header presente)
  - ✅ CORS headers están correctos (`Access-Control-Allow-Credentials: true`)

### En el Backend (Render)

- Ve a Render → Logs
- Debería ver requests desde Vercel
- No debería haber errores de CORS

---

## 🔐 Variables de Entorno - Checklist

### Backend (Render)

- [ ] `DATABASE_URL` - URL de Neon
- [ ] `SECRET_KEY` - Clave JWT única y fuerte
- [ ] `ALGORITHM` - `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` - `60`
- [ ] `COOKIE_SECURE` - `true`
- [ ] `FRONTEND_ORIGINS` - URL de Vercel

### Frontend (Vercel)

- [ ] `VITE_API_URL` - URL de Render

---

## 🐛 Troubleshooting

### Error: CORS policy error

**Causa**: `FRONTEND_ORIGINS` no coincide con la URL de Vercel
**Solución**:

- Verifica la URL exacta de Vercel (incluye https://)
- Actualiza en Render y espera a que se redeploy
- Limpia caché del navegador

### Error: Database connection refused

**Causa**: `DATABASE_URL` incorrea o Neon no está accesible
**Solución**:

- Verifica la URL en Neon dashboard
- Asegúrate que `?sslmode=require` está incluido
- Testea la conexión localmente

### Error: 401 Unauthorized

**Causa**: Token JWT no se envía o cookie no se guarda
**Solución**:

- En Render, verifica que `COOKIE_SECURE=true`
- En frontend, verifica que `withCredentials: true` en axios
- Asegúrate que el dominio es HTTPS

### Frontend muestra errores de API

**Causa**: `VITE_API_URL` no está configurado o no es válida
**Solución**:

- Verifica que está set en Vercel Environment Variables
- Redeploy el frontend
- Abre DevTools Console para ver el URL que está usando

---

## 📱 URLs Finales

Después del deploy, tendrás:

```
Frontend:  https://your-app.vercel.app
Backend:   https://financeapp-backend.onrender.com
Database:  postgresql://... (Neon)
```

---

## 🔄 Flujo de Desarrollo

1. Desarrolla localmente (`npm run dev` en frontend, `uvicorn` en backend)
2. Push a `main` en GitHub
3. Vercel y Render se redeploy automáticamente
4. Verifica logs en sus dashboards

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en Render y Vercel dashboards
2. Verifica las variables de entorno
3. Asegúrate que las URLs son HTTPS
4. Limpia caché y cookies del navegador
