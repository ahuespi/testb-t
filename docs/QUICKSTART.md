# ⚡ Quick Start - Bet Tracker

**¡Comienza en 5 minutos!**

## 📦 1. Instalar Dependencias

```bash
npm install
```

## 🔑 2. Configurar Supabase

### Opción A: Usar las credenciales de ejemplo (para testing)

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y pega tus credenciales de Supabase
```

### Opción B: Crear tu propia base de datos

1. Ve a [supabase.com](https://supabase.com) → Sign Up → New Project
2. Copia la URL y la anon key desde Settings → API
3. Crea un archivo `.env` con:

```env
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

4. Ve a SQL Editor y ejecuta el contenido de `sql/supabase-schema.sql`

## 🚀 3. Correr la Aplicación

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## ✅ 4. Verificar que Funciona

1. **Crear un Depósito:**
   - Click en "Nueva Transacción"
   - Tipo: Depósito
   - Monto: 100000
   - Registrar

2. **Crear una Apuesta Ganada:**
   - Nueva Transacción
   - Tipo: Ganada
   - Stake: 5%
   - Monto: 20000
   - Registrar

3. **Ver el Dashboard:**
   - Click en "Dashboard"
   - Deberías ver:
     - Balance: $105,000
     - Beneficio: $5,000
     - Total Apostado: $15,000

¡Si ves estos datos, todo funciona correctamente! 🎉

## 📱 5. Instalar como PWA (Opcional)

### En Chrome Desktop:
1. Click en el ícono ⊕ en la barra de direcciones
2. "Instalar"

### En Chrome Mobile:
1. Menú (⋮) → "Agregar a pantalla de inicio"

### En Safari iOS:
1. Botón compartir → "Agregar a pantalla de inicio"

## 🌐 6. Deploy a Producción (Opcional)

Para hacer tu app accesible desde internet:

1. **Sube a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin tu-repo-url
   git push -u origin main
   ```

2. **Deploy en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - "Import Project" → Selecciona tu repo
   - Agrega las variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)
   - Deploy

En 2-3 minutos tendrás tu app en: `https://tu-app.vercel.app`

## 📚 Más Información

- **Uso completo**: Lee `README.md`
- **Deploy detallado**: Lee `DEPLOYMENT.md`
- **Testing**: Lee `TESTING.md`
- **Contribuir**: Lee `CONTRIBUTING.md`

## 🆘 Problemas?

### "Failed to fetch" en la app
→ Verifica que las credenciales en `.env` sean correctas

### No se guardan las transacciones
→ Asegúrate de haber ejecutado `sql/supabase-schema.sql` en Supabase

### El puerto 5173 está ocupado
→ Cierra otras instancias de Vite o usa: `npm run dev -- --port 3000`

---

**¡Listo para rastrear tus apuestas! 🎯**

