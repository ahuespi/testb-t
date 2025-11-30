# ====================================
# PLANTILLA PARA ARCHIVO .env
# ====================================
# 
# INSTRUCCIONES:
# 1. Crea un archivo llamado ".env" (con el punto al inicio) en la raíz del proyecto
# 2. Copia el contenido de abajo
# 3. Reemplaza los valores con tus credenciales de Supabase
#

VITE_SUPABASE_URL=tu-proyecto-url-aqui
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui


# ====================================
# ¿DÓNDE OBTENGO ESTAS CREDENCIALES?
# ====================================

## PASO 1: Ir a Supabase
1. Abre tu navegador y ve a: https://supabase.com
2. Inicia sesión (o crea una cuenta gratis si no tienes)

## PASO 2: Crear o Seleccionar Proyecto
- Si no tienes proyecto: Click en "New Project"
  * Organization: Selecciona o crea una
  * Name: "bet-tracker" (o el nombre que prefieras)
  * Database Password: Genera una (GUÁRDALA, la necesitarás)
  * Region: Selecciona la más cercana (ej: South America)
  * Pricing Plan: Free
  * Click "Create new project" y espera 2-3 minutos

- Si ya tienes proyecto: Selecciónalo de la lista

## PASO 3: Obtener las Credenciales
1. En tu proyecto, busca el ícono de Settings (⚙️) en la barra lateral izquierda
2. Click en "API" en el menú de Settings
3. Verás dos secciones importantes:

   📍 Project URL:
   - Está arriba, en "Config"
   - Se ve así: https://abcdefghijklmnop.supabase.co
   - COPIA este valor completo

   🔑 Project API keys:
   - Busca la sección "Project API keys"
   - Verás dos keys: "anon" y "service_role"
   - USA SOLO la "anon" key (la otra es privada)
   - Es un texto largo que empieza con "eyJ..."
   - Click en el ícono de copiar 📋

## PASO 4: Crear el archivo .env
En tu terminal o editor de código:

# Navega a la carpeta del proyecto
cd /Users/amir/workspaces/ahuespi/betapp

# Crea el archivo .env
touch .env

# Ábrelo con tu editor favorito
# Visual Studio Code:
code .env

# O con cualquier editor de texto:
open -e .env

## PASO 5: Pegar las Credenciales
Copia esto en tu archivo .env (reemplazando con tus valores reales):

VITE_SUPABASE_URL=https://tu-proyecto-real.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-key-real-aqui...

⚠️ IMPORTANTE: NO pongas comillas ni espacios extras


# ====================================
# EJEMPLO REAL (con datos ficticios)
# ====================================

Si tus credenciales fueran estas (NO uses estas, son ejemplos):
- URL: https://xyzabc123def.supabase.co
- Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyM2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.abcdef123456

Tu archivo .env quedaría así:

VITE_SUPABASE_URL=https://xyzabc123def.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyM2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.abcdef123456


# ====================================
# DESPUÉS DE CREAR EL ARCHIVO .env
# ====================================

## PASO 6: Crear las Tablas en Supabase
1. Vuelve a Supabase en tu navegador
2. En tu proyecto, busca "SQL Editor" en la barra lateral
3. Click en "New query"
4. Copia TODO el contenido del archivo `sql/supabase-schema.sql` que tienes en tu proyecto
5. Pégalo en el editor SQL
6. Click en "Run" (▶️)
7. Deberías ver "Success. No rows returned"

## PASO 7: Probar la Aplicación
En tu terminal:

# Si el servidor ya está corriendo, deténlo (Ctrl+C) y reinícialo
npm run dev

# Si no está corriendo, simplemente inicia:
npm run dev

Abre http://localhost:5173 en tu navegador


# ====================================
# SOLUCIÓN DE PROBLEMAS
# ====================================

❌ Error: "Missing Supabase environment variables"
   → El archivo .env no existe o está mal ubicado
   → Debe estar en: /Users/amir/workspaces/ahuespi/betapp/.env

❌ Error: "Failed to fetch"
   → Las credenciales son incorrectas
   → Verifica que copiaste la URL y la key completas
   → Asegúrate de que no haya espacios extras

❌ Error: "Invalid API key"
   → Estás usando la "service_role" key en lugar de la "anon" key
   → Usa solo la "anon" key (es segura para el frontend)

❌ La app carga pero no guarda datos
   → No ejecutaste el script SQL (`sql/supabase-schema.sql`)
   → Ve al paso 6 y ejecuta el script en SQL Editor


# ====================================
# SEGURIDAD
# ====================================

✅ La "anon" key es segura para usar en el frontend
✅ El archivo .env ya está en .gitignore (no se subirá a Git)
✅ Supabase maneja la seguridad con Row Level Security (RLS)
⚠️ NUNCA compartas tu "service_role" key (la otra key)
⚠️ NO subas el archivo .env a GitHub u otros repositorios públicos

