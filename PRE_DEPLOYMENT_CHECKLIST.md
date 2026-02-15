# ✅ Pre-Deployment Checklist - FinanceApp

## 🔍 Verificación Local ✓ COMPLETADA

```
✅ Backend (http://localhost:8000) - Funcionando
✅ Frontend (http://localhost:5173) - Funcionando
✅ CORS configurado con allow_credentials=true
✅ Cookies habilitadas en configuración
✅ Base de datos local conectada
```

---

## 📝 Configuración Completada

### ✅ Archivos Creados/Actualizados:

1. **render.yaml** - Configuración de servicio en Render
2. **vercel.json** - Configuración de build en Vercel
3. **.env.production** - Variables de entorno para producción (backend)
4. **frontend/.env.production** - Variables de entorno para producción (frontend)
5. **build.sh** - Script de construcción para Render
6. **DEPLOY_GUIDE.md** - Guía completa de deploy
7. **verify-connections.sh** - Script de verificación de conexiones

---

## 🚀 Pasos Próximos - Para el Deploy

### Paso 1: Hacer Merge a Main

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

### Paso 2: Configurar Neon (Base de Datos)

- [ ] Crear proyecto en [neon.tech](https://neon.tech)
- [ ] Copiar `DATABASE_URL`
- [ ] Guardar para usar en Render

### Paso 3: Desplegar Backend en Render

- [ ] Conectar repositorio a Render
- [ ] Seleccionar rama `main`
- [ ] Agregar variables de entorno (usar [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md))
- [ ] Deploy
- [ ] Copiar URL: `https://financeapp-backend.onrender.com`

### Paso 4: Desplegar Frontend en Vercel

- [ ] Conectar repositorio a Vercel
- [ ] Seleccionar carpeta `frontend`
- [ ] Agregar variable: `VITE_API_URL=https://financeapp-backend.onrender.com`
- [ ] Deploy
- [ ] Copiar URL del frontend

### Paso 5: Actualizar CORS en Render

- [ ] En Render, ir a variables de entorno
- [ ] Actualizar `FRONTEND_ORIGINS` con URL de Vercel
- [ ] Guardar (se redeploy automáticamente)

### Paso 6: Verificar en Producción

- [ ] Abrir frontend en Vercel
- [ ] Intentar crear cuenta / login
- [ ] Verificar que las requests van al backend
- [ ] Verificar que las cookies se guardan

---

## 🔐 CORS - Configuración Final

La configuración CORS está lista con:

```python
✅ allow_credentials=True        # Permite envío de cookies
✅ allow_origins=custom_list     # Localhost en dev, Vercel en prod
✅ allow_methods=["*"]           # GET, POST, PUT, DELETE
✅ allow_headers=["*"]           # Todos los headers
✅ allow_origin_regex            # Soporte para localhost:*
```

**En Desarrollo (ahora):**

- `http://localhost:5173`
- `http://127.0.0.1:5173`

**En Producción:**

- `https://your-app.vercel.app`
- `https://www.your-app.vercel.app`

---

## 📚 Recursos

- [Render Deployment Guide](./DEPLOY_GUIDE.md) - Guía completa paso a paso
- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-modes.html)
- [Axios withCredentials](https://axios-http.com/docs/req_config)

---

## 🎯 Estado Actual

| Componente | Estado        | Ubicación        |
| ---------- | ------------- | ---------------- |
| Backend    | ✅ Ready      | Render (pending) |
| Frontend   | ✅ Ready      | Vercel (pending) |
| Database   | ✅ Ready      | Neon             |
| CORS       | ✅ Configured | FastAPI          |
| Cookies    | ✅ Enabled    | axios + FastAPI  |
| Auth       | ✅ Working    | JWT + Cookies    |

---

## 💡 Tips

1. **Logs en Producción**: Verifica los logs en Render y Vercel para debugging
2. **Caché**: Si tienes problemas, limpia caché del navegador
3. **URLs**: Siempre usa HTTPS en producción (Render y Vercel lo manejan)
4. **Redeploy Automático**: Ambos servicios se redeploy cuando haces push a main

---

**¡Listo para desplegar! 🎉**
