# 💰 Bet Tracker - Control de Apuestas Deportivas

Una Progressive Web App (PWA) desarrollada en React para el control y seguimiento personal de apuestas deportivas. Incluye gestión de transacciones, cálculo automático de beneficios, estadísticas detalladas y funcionalidad offline.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## 📋 Características

- ✅ Registro de transacciones (Depósitos, Retiros, Apuestas)
- 📊 Dashboard con métricas en tiempo real
- 📈 Gráficos de evolución de beneficios
- 🎯 Sistema de stakes (1-20% o personalizado)
- 🔍 Filtros por fecha (Día, Semana, Mes, Año, Personalizado)
- 💰 Cálculo automático de beneficios netos
- 📱 PWA instalable en móvil y desktop
- 🔄 Funcionalidad offline con sincronización
- 🎨 Diseño responsive y moderno

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **PWA**: Vite PWA Plugin + Workbox
- **Hosting**: Vercel (Frontend) + Supabase (Backend)

## 📦 Instalación Local

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta en Supabase (gratuita)
- Git

### Pasos

1. **Clonar el repositorio**

```bash
git clone <tu-repositorio-url>
cd betapp
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

4. **Ejecutar en desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

5. **Build para producción**

```bash
npm run build
```

Los archivos de producción estarán en la carpeta `dist/`

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita (si no la tienes)
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la `anon key` (encontrarás esto en Settings > API)

### 2. Crear Tablas

Ve a SQL Editor en tu proyecto de Supabase y ejecuta el siguiente script SQL:

```sql
-- Create ENUM type for transaction types
CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT',
  'WITHDRAWAL',
  'BET_LOST',
  'BET_WON',
  'BET_CASHOUT'
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type transaction_type NOT NULL,
  stake INTEGER,
  amount DECIMAL(12, 2) NOT NULL,
  net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Create config table
CREATE TABLE config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_amount DECIMAL(12, 2) NOT NULL DEFAULT 300000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default config
INSERT INTO config (bank_amount) VALUES (300000);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for personal use)
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on config" ON config
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Nota**: Este script está en el archivo `sql/supabase-schema.sql` del proyecto.

### 3. Obtener Credenciales

1. Ve a Settings > API en tu proyecto de Supabase
2. Copia la `Project URL` y la `anon/public key`
3. Pégalas en tu archivo `.env`

## 🚀 Deployment en Vercel

### Opción 1: Deploy Automático (Recomendado)

1. **Sube tu código a GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-github>
git push -u origin main
```

2. **Conectar con Vercel**

- Ve a [vercel.com](https://vercel.com)
- Crea una cuenta (puedes usar tu cuenta de GitHub)
- Click en "Add New Project"
- Importa tu repositorio de GitHub
- Configura las variables de entorno:
  - `VITE_SUPABASE_URL`: Tu URL de Supabase
  - `VITE_SUPABASE_ANON_KEY`: Tu anon key de Supabase

3. **Deploy**

- Click en "Deploy"
- Espera a que termine el build (2-3 minutos)
- Tu app estará disponible en una URL como `tu-app.vercel.app`

### Opción 2: Deploy Manual

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy a producción
vercel --prod
```

### Actualizaciones Automáticas

Una vez configurado, cada push a la rama `main` en GitHub desplegará automáticamente los cambios en Vercel.

## 📱 Instalación de la PWA

### En Android (Chrome/Edge)

1. Abre la aplicación en tu navegador
2. Verás un banner que dice "Instalar aplicación"
3. Click en "Instalar"
4. La app aparecerá en tu pantalla de inicio

Alternativamente:
- Menú (⋮) > "Agregar a pantalla de inicio"

### En iOS (Safari)

1. Abre la aplicación en Safari
2. Toca el botón de compartir (cuadro con flecha hacia arriba)
3. Selecciona "Agregar a pantalla de inicio"
4. Nombra la aplicación y confirma

### En Desktop (Chrome/Edge)

1. Abre la aplicación en tu navegador
2. Verás un ícono de instalación (⊕) en la barra de direcciones
3. Click en el ícono
4. Confirma la instalación
5. La app se abrirá en una ventana independiente

## 📖 Manual de Uso

### Registrar una Transacción

1. Ve a la pestaña "Nueva Transacción"
2. Selecciona la fecha
3. Elige el tipo de transacción:
   - **Depósito**: Ingreso de dinero a la cuenta
   - **Retiro**: Retiro de dinero de la cuenta
   - **Perdida**: Apuesta perdida
   - **Ganada**: Apuesta ganada
   - **Cashout**: Cierre anticipado de apuesta

4. Si es una apuesta:
   - Selecciona el stake (1-20% del bank)
   - O marca "Stake Personalizado" para un valor custom
   - El monto se calculará automáticamente basado en el stake

5. Ingresa el monto (excepto para apuestas perdidas)
6. Agrega notas opcionales (partido, evento, etc.)
7. Click en "Registrar Transacción"

### Cálculo de Stakes

El sistema calcula automáticamente el valor en ARS basado en tu bank:

- Bank base: $300,000 ARS
- Stake 1% = $3,000
- Stake 2% = $6,000
- Stake 5% = $15,000
- Stake 10% = $30,000
- Y así sucesivamente...

### Filtrar Transacciones

En la pestaña "Historial":

1. Selecciona el período:
   - **Hoy**: Transacciones del día actual
   - **Semana**: Últimos 7 días
   - **Mes**: Mes actual
   - **Año**: Año actual
   - **Personalizado**: Rango de fechas custom

2. Filtra por tipo de transacción
3. Busca en las notas
4. Ordena por fecha, monto o beneficio

### Dashboard

El dashboard muestra:

- **Balance Actual**: Depósitos - Retiros + Beneficio Neto
- **ROI del Período**: Rendimiento en porcentaje
- **Total Apostado**: Suma de todas las apuestas
- **Beneficio Neto**: Ganancia o pérdida total
- **Win Rate**: Porcentaje de apuestas ganadas
- **Total de Apuestas**: Cantidad de apuestas realizadas

**Gráficos:**
- Evolución de beneficios (línea temporal)
- Distribución de stakes (barras)
- Actividad reciente

## 🔧 Configuración Avanzada

### Cambiar el Bank Base

1. Ve a Supabase > Table Editor > config
2. Edita el valor de `bank_amount`
3. Los cálculos de stake se actualizarán automáticamente

### Personalizar Colores

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Tus colores personalizados
      }
    }
  }
}
```

### Modificar el Service Worker

El service worker se genera automáticamente con Vite PWA Plugin. Para configuraciones avanzadas, edita `vite.config.ts`:

```ts
VitePWA({
  workbox: {
    // Configuraciones personalizadas
  }
})
```

## 🐛 Solución de Problemas

### La aplicación no se conecta a Supabase

- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que las políticas RLS estén habilitadas
- Revisa la consola del navegador para errores

### Los iconos no se muestran correctamente

- Convierte los SVG a PNG usando una herramienta online
- Asegúrate de que los archivos PNG estén en `public/icons/`
- Nombres requeridos: `icon-192x192.png` y `icon-512x512.png`

### La PWA no se instala

- Verifica que estés usando HTTPS (o localhost)
- Asegúrate de que `manifest.json` esté correctamente configurado
- Revisa que el service worker se haya registrado correctamente

### Los datos no persisten offline

- El service worker debe estar registrado correctamente
- Verifica la estrategia de cache en `vite.config.ts`
- Revisa el Application tab en DevTools

## 📊 Estructura del Proyecto

```
betapp/
├── public/
│   ├── icons/              # Iconos PWA
│   ├── manifest.json       # Manifest PWA
│   └── icon.svg           # Ícono fallback
├── src/
│   ├── components/        # Componentes React
│   │   ├── Dashboard.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── FilterBar.tsx
│   │   └── MetricCard.tsx
│   ├── hooks/            # Custom hooks
│   │   ├── useTransactions.ts
│   │   └── useMetrics.ts
│   ├── lib/              # Utilidades
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── types/            # Definiciones TypeScript
│   │   └── index.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globales
├── docs/                  # Documentación
│   ├── DEPLOYMENT.md
│   ├── DATABASE_MIGRATION.md
│   └── ...
├── sql/                   # Scripts SQL
│   ├── supabase-schema.sql
│   ├── migration-owner.sql
│   └── ...
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔒 Seguridad y Privacidad

**Importante**: Esta aplicación está configurada para uso personal sin autenticación. Las políticas RLS permiten acceso público a los datos.

Para uso en producción con múltiples usuarios:

1. Implementa autenticación de Supabase
2. Modifica las políticas RLS para restringir acceso por usuario
3. Añade validación de datos en el backend

## 🤝 Contribuciones

Este es un proyecto personal, pero sugerencias y mejoras son bienvenidas.

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

## 📧 Soporte

Para problemas o preguntas:
- Revisa la sección de solución de problemas
- Consulta la documentación de [Supabase](https://supabase.com/docs)
- Consulta la documentación de [Vercel](https://vercel.com/docs)

---

**Desarrollado con ❤️ para el control de apuestas deportivas**

