# 🚀 Guía Completa de Deployment e Instalación - Bet Tracker PWA

Guía paso a paso desde cero para desplegar tu aplicación Bet Tracker y instalarla en iPhone 13.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Paso 1: Configurar Supabase (Base de Datos)](#paso-1-configurar-supabase-base-de-datos)
3. [Paso 2: Preparar el Código](#paso-2-preparar-el-código)
4. [Paso 3: Desplegar en Vercel](#paso-3-desplegar-en-vercel)
5. [Paso 4: Instalar en iPhone 13](#paso-4-instalar-en-iphone-13)
6. [Paso 5: Verificación y Troubleshooting](#paso-5-verificación-y-troubleshooting)

---

## Prerrequisitos

Antes de comenzar, necesitas:

- ✅ Una cuenta de correo electrónico
- ✅ Acceso a internet
- ✅ Un iPhone 13 (o cualquier iPhone con iOS 12.2+)
- ✅ Una computadora (Mac, Windows o Linux)
- ⏱️ Tiempo estimado: 30-45 minutos

**No necesitas:**
- ❌ Conocimientos avanzados de programación
- ❌ Tarjeta de crédito (todo es gratuito)
- ❌ Dominio propio

---

## Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **"Start your project"** (arriba a la derecha)
3. Selecciona **"Continue with GitHub"** (recomendado) o crea cuenta con email
4. Autoriza a Supabase para acceder a tu GitHub (si elegiste GitHub)

### 1.2 Crear Nuevo Proyecto

1. Una vez dentro del dashboard, click en **"New Project"**
2. Completa el formulario:
   - **Name**: `bet-tracker` (o el nombre que prefieras)
   - **Database Password**: 
     - Genera una contraseña segura (guárdala en un lugar seguro)
     - Mínimo 12 caracteres
     - Ejemplo: `MiPassword123!@#`
   - **Region**: Elige la más cercana a tu ubicación
     - Para Argentina: `South America (São Paulo)`
   - **Pricing Plan**: Selecciona **"Free"** (suficiente para uso personal)
3. Click en **"Create new project"**
4. ⏳ Espera 2-3 minutos mientras se crea el proyecto

### 1.3 Crear las Tablas en la Base de Datos

1. Una vez que el proyecto esté listo, ve al menú lateral izquierdo
2. Click en **"SQL Editor"** (ícono de terminal/código)
3. Click en **"New query"** (botón verde arriba)
4. Abre el archivo `sql/supabase-schema.sql` de este proyecto en tu computadora
5. Copia **TODO** el contenido del archivo (Ctrl+A / Cmd+A, luego Ctrl+C / Cmd+C)
6. Pega el contenido en el editor SQL de Supabase
7. Click en **"Run"** (botón ▶️ o presiona Ctrl+Enter)
8. Deberías ver: **"Success. No rows returned"** ✅

### 1.4 Verificar que las Tablas se Crearon

1. En el menú lateral, click en **"Table Editor"**
2. Deberías ver dos tablas:
   - ✅ `transactions` (vacía por ahora)
   - ✅ `config` (con un registro con `bank_amount = 300000`)

### 1.5 Obtener las Credenciales de API

1. En el menú lateral, click en **"Settings"** (ícono de engranaje)
2. Click en **"API"** (en el submenú)
3. Encontrarás dos valores importantes:

   **a) Project URL:**
   - Se encuentra en la sección **"Project URL"**
   - Ejemplo: `https://abcdefghijklmnop.supabase.co`
   - 📋 **Copia este valor** y guárdalo

   **b) anon/public key:**
   - Se encuentra en la sección **"Project API keys"**
   - Busca la fila que dice **"anon"** y **"public"**
   - Click en el ícono de **ojo** 👁️ para revelar la clave
   - Es un token largo que empieza con `eyJhbGc...`
   - 📋 **Copia este valor** y guárdalo

4. ⚠️ **IMPORTANTE**: Guarda ambos valores en un lugar seguro (notas, documento de texto, etc.)

---

## Paso 2: Preparar el Código

### 2.1 Verificar que Tienes el Código

Si ya tienes el código en tu computadora, ve a la carpeta del proyecto:

```bash
cd /Users/amir/workspaces/ahuespi/betapp
```

Si no tienes el código, clónalo desde GitHub o descárgalo.

### 2.2 Verificar que las Dependencias Están Instaladas

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias. Espera a que termine (puede tardar 1-2 minutos).

### 2.3 Crear Archivo de Variables de Entorno

1. En la raíz del proyecto, crea un archivo llamado `.env`
2. Abre el archivo `.env` con un editor de texto
3. Agrega las siguientes líneas (reemplaza con tus valores de Supabase):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Ejemplo real:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

4. Guarda el archivo

### 2.4 Probar Localmente (Opcional pero Recomendado)

Para verificar que todo funciona antes de desplegar:

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173` y verifica que:
- La página carga correctamente
- Puedes crear una transacción de prueba
- Los datos se guardan

Si todo funciona, presiona `Ctrl+C` en la terminal para detener el servidor.

### 2.5 Preparar para Git (Si Aún No Tienes Repositorio)

Si aún no has subido el código a GitHub:

1. **Crear repositorio en GitHub:**
   - Ve a [github.com](https://github.com)
   - Click en **"New repository"**
   - Nómbralo `bet-tracker` (o como prefieras)
   - Déjalo **público** o **privado** (ambos funcionan)
   - **NO marques** "Add a README file" (ya tienes uno)
   - Click en **"Create repository"**

2. **Subir el código:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Bet Tracker PWA"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/bet-tracker.git
   git push -u origin main
   ```
   
   ⚠️ Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## Paso 3: Desplegar en Vercel

### 3.1 Crear Cuenta en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"** (recomendado)
4. Autoriza a Vercel para acceder a tu GitHub

### 3.2 Importar el Proyecto

1. Una vez dentro del dashboard de Vercel, click en **"Add New..."**
2. Selecciona **"Project"**
3. Verás una lista de tus repositorios de GitHub
4. Busca y selecciona tu repositorio `bet-tracker`
5. Click en **"Import"**

### 3.3 Configurar el Proyecto

En la página de configuración:

1. **Project Name**: Déjalo como está o cámbialo (ej: `bet-tracker`)
2. **Framework Preset**: Debería detectar automáticamente "Vite"
3. **Root Directory**: Déjalo vacío (o `./` si está lleno)
4. **Build Command**: Debería ser `npm run build` (verifica que esté)
5. **Output Directory**: Debería ser `dist` (verifica que esté)

### 3.4 Configurar Variables de Entorno

**⚠️ MUY IMPORTANTE**: Antes de hacer el deploy, configura las variables de entorno:

1. En la misma página de configuración, busca la sección **"Environment Variables"**
2. Click en **"Add"** o en el campo para agregar variables

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Pega tu Project URL de Supabase
   - **Environment**: Marca **Production** (y también Preview y Development si quieres)

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Pega tu anon key de Supabase
   - **Environment**: Marca **Production** (y también Preview y Development si quieres)

3. Verifica que ambas variables estén agregadas correctamente

### 3.5 Hacer el Deploy

1. Una vez configurado todo, click en **"Deploy"** (botón azul abajo)
2. ⏳ Espera 2-3 minutos mientras Vercel:
   - Clona tu repositorio
   - Instala las dependencias (`npm install`)
   - Construye la aplicación (`npm run build`)
   - La despliega en producción
3. Verás el progreso en tiempo real
4. Una vez completado, verás **"Congratulations!"** ✅

### 3.6 Obtener la URL de tu Aplicación

1. Después del deploy exitoso, verás una URL como:
   ```
   https://bet-tracker-abc123.vercel.app
   ```
2. 📋 **Copia esta URL** (la necesitarás para instalar en iPhone)
3. Click en **"Visit"** para abrir tu aplicación en el navegador

### 3.7 Verificar que Funciona

1. Abre la URL de tu aplicación en el navegador
2. Verifica que:
   - ✅ La página carga correctamente
   - ✅ Puedes crear una transacción de prueba
   - ✅ Los datos se guardan (verifica en Supabase > Table Editor)
   - ✅ El dashboard muestra información

---

## Paso 4: Instalar en iPhone 13

### 4.1 Requisitos Previos

- ✅ Tu iPhone 13 debe estar actualizado (iOS 12.2 o superior)
- ✅ Debes tener conexión a internet
- ✅ Debes tener la URL de tu aplicación desplegada en Vercel

### 4.2 Abrir la Aplicación en Safari

**⚠️ IMPORTANTE**: Debes usar **Safari**, no Chrome ni otros navegadores.

1. Abre **Safari** en tu iPhone 13
2. En la barra de direcciones, escribe la URL de tu aplicación:
   ```
   https://bet-tracker-abc123.vercel.app
   ```
3. Presiona **"Ir"** o **"Go"**
4. Espera a que la página cargue completamente

### 4.3 Agregar a la Pantalla de Inicio

1. Una vez que la página haya cargado, busca el botón de **compartir** en Safari:
   - Está en la barra inferior (cuadro con flecha hacia arriba ⬆️)
   - O desliza hacia arriba desde la parte inferior de la pantalla
2. Toca el botón de **compartir** (⬆️)
3. Desplázate hacia abajo en el menú de opciones
4. Busca y toca **"Agregar a pantalla de inicio"** o **"Add to Home Screen"**
   - Si no lo ves, desplázate más hacia abajo
   - Puede aparecer como un ícono con un símbolo "+"

### 4.4 Personalizar el Nombre (Opcional)

1. Aparecerá una ventana con:
   - Un ícono de la aplicación
   - Un campo de texto con el nombre (por defecto será "Bet Tracker")
2. Puedes cambiar el nombre si quieres (ej: "Mis Apuestas", "Bet Tracker", etc.)
3. Toca **"Agregar"** o **"Add"** (arriba a la derecha)

### 4.5 Verificar la Instalación

1. Sal de Safari (presiona el botón Home o desliza desde abajo)
2. Busca en tu pantalla de inicio
3. Deberías ver un nuevo ícono con el nombre que elegiste
4. Toca el ícono para abrir la aplicación
5. La aplicación debería abrirse en modo **standalone** (sin la barra de Safari)

### 4.6 Configurar Acceso Rápido (Opcional)

Para un acceso aún más rápido:

1. Mantén presionado el ícono de la aplicación en la pantalla de inicio
2. Selecciona **"Editar pantalla de inicio"** o **"Edit Home Screen"**
3. Arrastra el ícono a la posición que prefieras
4. Presiona **"Listo"** o **"Done"**

### 4.7 Usar la Aplicación

Ahora puedes:
- ✅ Abrir la aplicación desde la pantalla de inicio
- ✅ Usarla sin conexión (con limitaciones)
- ✅ Recibir notificaciones de actualizaciones automáticas
- ✅ Usarla como una app nativa

---

## Paso 5: Verificación y Troubleshooting

### 5.1 Checklist de Verificación

Verifica que todo funciona correctamente:

- [ ] La aplicación carga en el navegador (Vercel)
- [ ] Puedo crear transacciones y se guardan
- [ ] El dashboard muestra métricas correctamente
- [ ] Los filtros funcionan en el historial
- [ ] La aplicación se instaló en mi iPhone 13
- [ ] La aplicación abre desde la pantalla de inicio
- [ ] Los datos se sincronizan entre dispositivos

### 5.2 Problemas Comunes y Soluciones

#### ❌ Error: "Failed to fetch" o "No se puede conectar"

**Causa**: Variables de entorno incorrectas o faltantes

**Solución**:
1. Ve a Vercel > Tu Proyecto > Settings > Environment Variables
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctos
3. Si las agregaste después del deploy, haz un **Redeploy**:
   - Ve a Deployments
   - Click en los tres puntos (⋮) del último deployment
   - Selecciona **"Redeploy"**

#### ❌ Error: "Row Level Security policy violation"

**Causa**: Las políticas RLS no están configuradas

**Solución**:
1. Ve a Supabase > SQL Editor
2. Ejecuta nuevamente el script `sql/supabase-schema.sql`
3. Verifica que aparezca "Success"

#### ❌ La aplicación no se instala en iPhone

**Causa**: Varias posibles

**Soluciones**:
1. **Asegúrate de usar Safari** (no Chrome ni otros navegadores)
2. **Verifica que la URL sea HTTPS** (Vercel lo provee automáticamente)
3. **Limpia la caché de Safari**:
   - Settings > Safari > Clear History and Website Data
4. **Verifica el manifest.json**:
   - Abre la URL en Safari
   - Toca el botón de compartir
   - Si no ves "Agregar a pantalla de inicio", el manifest puede tener errores
   - Verifica en Vercel que el build fue exitoso

#### ❌ Los iconos no se muestran

**Causa**: Los iconos PNG no están en el repositorio

**Solución**:
1. Los archivos SVG son placeholders
2. Convierte los SVG a PNG:
   - Ve a [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png)
   - Sube `public/icons/icon-192x192.svg`
   - Configura tamaño: 192x192
   - Descarga el PNG
   - Repite para `icon-512x512.svg` (512x512)
3. Reemplaza los archivos en `public/icons/`
4. Haz commit y push:
   ```bash
   git add public/icons/
   git commit -m "Add PNG icons"
   git push
   ```
5. Vercel desplegará automáticamente

#### ❌ Los datos no se guardan

**Causa**: Problemas con Supabase o variables de entorno

**Solución**:
1. Verifica en Supabase > Table Editor que las tablas existan
2. Verifica en Vercel que las variables de entorno estén correctas
3. Abre la consola del navegador (en iPhone: Safari > Develop > [Tu iPhone] > Console)
4. Busca errores en rojo
5. Verifica que la URL de Supabase sea correcta

#### ❌ La aplicación no funciona offline

**Causa**: El service worker no se registró correctamente

**Solución**:
1. Verifica que el build en Vercel fue exitoso
2. Abre la aplicación en Safari
3. Ve a Settings > Safari > Advanced > Website Data
4. Busca tu dominio y verifica que haya datos guardados
5. Si no hay datos, el service worker puede no estar funcionando
6. Verifica en `vite.config.ts` que `VitePWA` esté configurado

### 5.3 Actualizar la Aplicación

Cuando hagas cambios en el código:

1. Haz commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push
   ```
2. Vercel desplegará automáticamente (2-3 minutos)
3. En tu iPhone, la aplicación se actualizará automáticamente la próxima vez que la abras
4. Si no se actualiza, cierra completamente la aplicación y ábrela de nuevo

### 5.4 Hacer Backup de los Datos

**Supabase**:
1. Ve a Supabase > Table Editor
2. Selecciona una tabla
3. Click en los tres puntos (⋮) > Export > CSV/JSON
4. Descarga el archivo

**Código**:
- Tu repositorio de GitHub es tu backup
- Considera hacer releases con tags para versiones importantes

---

## ✅ Resumen de URLs y Credenciales

Guarda esta información en un lugar seguro:

### Supabase
- **Project URL**: `https://xxxxx.supabase.co`
- **anon key**: `eyJhbGc...`

### Vercel
- **URL de la aplicación**: `https://bet-tracker-abc123.vercel.app`

### GitHub
- **Repositorio**: `https://github.com/TU-USUARIO/bet-tracker`

---

## 🎉 ¡Listo!

Tu aplicación Bet Tracker está ahora:
- ✅ Desplegada en producción (Vercel)
- ✅ Conectada a la base de datos (Supabase)
- ✅ Instalada en tu iPhone 13
- ✅ Lista para usar

**Próximos pasos**:
- Empieza a registrar tus apuestas
- Explora el dashboard y las estadísticas
- Personaliza los colores y el nombre si quieres
- Comparte la URL con otros dispositivos si necesitas

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [PWA en iOS](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

---

**¿Problemas?** Revisa la sección de Troubleshooting arriba o consulta la documentación oficial.

**¡Disfruta tu aplicación de control de apuestas!** 🎰📊
