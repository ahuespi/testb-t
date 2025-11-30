# 🧪 Testing Guide - Bet Tracker

Guía de pruebas para verificar que todas las funcionalidades de la aplicación funcionan correctamente.

## ✅ Checklist de Pruebas

### 1. Setup Inicial

**Pruebas de Configuración:**

- [ ] El proyecto se instala correctamente con `npm install`
- [ ] El proyecto arranca en desarrollo con `npm run dev`
- [ ] No hay errores de TypeScript al compilar
- [ ] Las variables de entorno se cargan correctamente
- [ ] La conexión a Supabase funciona

**Comandos para verificar:**

```bash
# Instalar dependencias
npm install

# Verificar tipos
npx tsc --noEmit

# Correr en desarrollo
npm run dev

# Build de producción
npm run build
```

### 2. Funcionalidad Core

#### 2.1 Registro de Transacciones

**Test Case: Crear Depósito**
1. Navegar a "Nueva Transacción"
2. Seleccionar fecha actual
3. Seleccionar tipo "Depósito"
4. Ingresar monto: 50000
5. Click en "Registrar Transacción"

**Resultado esperado:**
- ✅ Transacción se guarda correctamente
- ✅ Redirección al Dashboard
- ✅ Balance actual se actualiza (+50000)
- ✅ Transacción aparece en "Actividad Reciente"

**Test Case: Crear Apuesta Ganada**
1. Nueva Transacción
2. Tipo: "Ganada"
3. Stake: 5%
4. Monto ganado: 20000
5. Notas: "Partido test"

**Resultado esperado:**
- ✅ Stake se calcula: 5% de 300000 = 15000
- ✅ Beneficio neto: 20000 - 15000 = 5000
- ✅ Transacción guardada con datos correctos

**Test Case: Crear Apuesta Perdida**
1. Nueva Transacción
2. Tipo: "Perdida"
3. Stake: 3%
4. Notas: "Partido test perdido"

**Resultado esperado:**
- ✅ Stake se calcula: 3% de 300000 = 9000
- ✅ Monto automático = 9000
- ✅ Beneficio neto: -9000
- ✅ Campo monto está deshabilitado

**Test Case: Stake Personalizado**
1. Nueva Transacción
2. Tipo: "Ganada"
3. Marcar "Stake Personalizado"
4. Ingresar stake: 7
5. Monto: 25000

**Resultado esperado:**
- ✅ Acepta valor personalizado
- ✅ Calcula con 7% del bank
- ✅ Beneficio correcto: 25000 - 21000 = 4000

**Test Case: Crear Cashout**
1. Nueva Transacción
2. Tipo: "Cashout"
3. Stake: 4%
4. Monto recuperado: 8000

**Resultado esperado:**
- ✅ Stake: 4% = 12000
- ✅ Beneficio neto: 8000 - 12000 = -4000 (negativo)
- ✅ Transacción guardada correctamente

#### 2.2 Dashboard

**Test Case: Métricas**

Crear las siguientes transacciones:
1. Depósito: 100000
2. Apuesta Ganada (Stake 5%): 20000
3. Apuesta Perdida (Stake 3%)
4. Apuesta Ganada (Stake 2%): 10000

**Verificar:**
- [ ] Balance Actual = 100000 + (20000-15000) - 9000 + (10000-6000) = 100000 ARS
- [ ] ROI se calcula correctamente
- [ ] Total Apostado = 15000 + 9000 + 6000 = 30000
- [ ] Beneficio Neto = 5000 - 9000 + 4000 = 0
- [ ] Win Rate = 2/3 = 66.7%
- [ ] Total Apuestas = 3

**Test Case: Gráfico de Evolución**
1. Crear varias transacciones en diferentes fechas del mes actual
2. Ir al Dashboard
3. Verificar que el gráfico muestra la evolución

**Resultado esperado:**
- ✅ Gráfico se renderiza correctamente
- ✅ Puntos corresponden a fechas de transacciones
- ✅ Valores acumulativos son correctos
- ✅ Tooltip muestra información al hacer hover

**Test Case: Distribución de Stakes**

**Resultado esperado:**
- ✅ Muestra barras para cada stake usado
- ✅ Cantidad de apuestas es correcta
- ✅ Barras proporcionales al máximo

**Test Case: Actividad Reciente**

**Resultado esperado:**
- ✅ Muestra últimas 5 transacciones
- ✅ Ordenadas por fecha (más reciente primero)
- ✅ Iconos correctos por tipo
- ✅ Montos formateados en ARS

#### 2.3 Historial

**Test Case: Filtro por Período**

1. Crear transacciones en diferentes fechas:
   - Hoy
   - Hace 3 días
   - Hace 10 días
   - Hace 2 meses

2. Probar cada filtro:
   - **Hoy**: Solo muestra transacción de hoy
   - **Semana**: Muestra de hoy y hace 3 días
   - **Mes**: Muestra todas del mes actual
   - **Año**: Muestra todas del año
   - **Personalizado**: Permite seleccionar rango

**Resultado esperado:**
- ✅ Filtros funcionan correctamente
- ✅ Fechas personalizadas se aplican
- ✅ Totales se recalculan con cada filtro

**Test Case: Filtro por Tipo**

1. Crear transacciones de cada tipo
2. Seleccionar cada tipo en el filtro

**Resultado esperado:**
- ✅ Solo muestra transacciones del tipo seleccionado
- ✅ "Todos" muestra todas las transacciones
- ✅ Totales correctos por tipo

**Test Case: Búsqueda por Notas**

1. Crear transacciones con diferentes notas
2. Buscar texto específico (ej: "River vs Boca")

**Resultado esperado:**
- ✅ Muestra solo transacciones que contienen el texto
- ✅ Búsqueda es case-insensitive
- ✅ Actualiza en tiempo real

**Test Case: Ordenamiento**

1. Click en encabezado "Fecha"
2. Click en encabezado "Monto"
3. Click en encabezado "Beneficio"

**Resultado esperado:**
- ✅ Ordena ascendente/descendente
- ✅ Ícono de flecha indica dirección
- ✅ Datos se reordenan correctamente

**Test Case: Eliminar Transacción**

1. Click en "Eliminar" en una transacción
2. Confirmar en el diálogo

**Resultado esperado:**
- ✅ Aparece confirmación
- ✅ Transacción se elimina de la BD
- ✅ Desaparece de la lista
- ✅ Métricas se actualizan

**Test Case: Totales**

**Resultado esperado:**
- ✅ Total Monto suma todas las transacciones filtradas
- ✅ Total Beneficio suma correctamente
- ✅ Color verde para positivo, rojo para negativo

#### 2.4 Responsive Design

**Test Case: Mobile (375px)**
1. Abrir DevTools
2. Seleccionar iPhone SE o similar
3. Navegar por todas las vistas

**Resultado esperado:**
- ✅ Layout se adapta correctamente
- ✅ Botones son accesibles
- ✅ Tabla se convierte en cards
- ✅ Formulario es usable
- ✅ Gráficos son legibles

**Test Case: Tablet (768px)**

**Resultado esperado:**
- ✅ Grid de métricas se ajusta (2 columnas)
- ✅ Navegación funciona correctamente
- ✅ Gráficos se redimensionan

**Test Case: Desktop (1920px)**

**Resultado esperado:**
- ✅ Layout usa todo el espacio disponible
- ✅ Máximo width contenido centrado
- ✅ Gráficos lado a lado

### 3. PWA Functionality

#### 3.1 Instalación

**Test Case: Chrome Desktop**
1. Abrir la aplicación
2. Buscar ícono de instalación (⊕) en la barra

**Resultado esperado:**
- ✅ Ícono de instalación visible
- ✅ Click instala la aplicación
- ✅ Se abre en ventana independiente
- ✅ Aparece en el menú de aplicaciones del sistema

**Test Case: Chrome Mobile (Android)**
1. Abrir en Chrome móvil
2. Esperar banner de instalación

**Resultado esperado:**
- ✅ Banner aparece automáticamente
- ✅ "Agregar a pantalla de inicio" funciona
- ✅ Ícono aparece en el launcher
- ✅ Se abre como app nativa

**Test Case: Safari Mobile (iOS)**
1. Abrir en Safari
2. Botón compartir > Agregar a inicio

**Resultado esperado:**
- ✅ Opción disponible
- ✅ Ícono se agrega
- ✅ Se abre en fullscreen

#### 3.2 Funcionalidad Offline

**Test Case: Cache de Recursos**
1. Abrir la aplicación con internet
2. Ir a DevTools > Network
3. Activar "Offline"
4. Recargar la página

**Resultado esperado:**
- ✅ La aplicación carga desde cache
- ✅ UI se muestra correctamente
- ✅ Assets (CSS, JS, imágenes) cargan

**Test Case: Datos con Conexión**
1. Con internet, crear transacción
2. Verificar que se guarda
3. Recargar y verificar que persiste

**Resultado esperado:**
- ✅ Datos se guardan en Supabase
- ✅ Persisten después de recargar

**Test Case: Service Worker**

Verificar en DevTools > Application:
- [ ] Service Worker registrado
- [ ] Estado: Activated
- [ ] Cache storage tiene entradas
- [ ] Manifest carga correctamente

#### 3.3 Manifest

**Verificar en DevTools > Application > Manifest:**
- [ ] Name: "Bet Tracker..."
- [ ] Short name: "BetTracker"
- [ ] Theme color: #1e40af
- [ ] Display: standalone
- [ ] Icons: 192x192 y 512x512
- [ ] Sin errores o warnings

### 4. Cálculos y Lógica de Negocio

#### 4.1 Cálculo de Stakes

**Test Cases:**

| Stake % | Bank      | Esperado   |
|---------|-----------|------------|
| 1%      | 300,000   | 3,000      |
| 5%      | 300,000   | 15,000     |
| 10%     | 300,000   | 30,000     |
| 20%     | 300,000   | 60,000     |
| 7.5%    | 300,000   | 22,500     |

#### 4.2 Cálculo de Beneficios

**BET_WON:**
- Stake 5% (15,000) + Ganancia 20,000
- Beneficio = 20,000 - 15,000 = 5,000 ✅

**BET_LOST:**
- Stake 3% (9,000)
- Beneficio = -9,000 ✅

**BET_CASHOUT (positivo):**
- Stake 4% (12,000) + Cashout 13,000
- Beneficio = 13,000 - 12,000 = 1,000 ✅

**BET_CASHOUT (negativo):**
- Stake 4% (12,000) + Cashout 8,000
- Beneficio = 8,000 - 12,000 = -4,000 ✅

**DEPOSIT/WITHDRAWAL:**
- Beneficio = 0 (no afecta estadísticas de apuestas) ✅

#### 4.3 Cálculo de ROI

```
ROI = (Beneficio Neto / Total Apostado) * 100
```

**Ejemplo:**
- Total Apostado: 50,000
- Beneficio Neto: 10,000
- ROI = (10,000 / 50,000) * 100 = 20% ✅

#### 4.4 Win Rate

```
Win Rate = (Apuestas Ganadas / Total Apuestas) * 100
```

**Ejemplo:**
- 7 apuestas ganadas
- 3 apuestas perdidas
- Win Rate = (7 / 10) * 100 = 70% ✅

### 5. Edge Cases

**Test Case: Valores Extremos**
- [ ] Stake de 100%
- [ ] Monto de 0
- [ ] Monto muy grande (1,000,000,000)
- [ ] Stake decimal (2.5%)
- [ ] Notas muy largas (1000 caracteres)

**Test Case: Fechas**
- [ ] Fecha futura
- [ ] Fecha hace 10 años
- [ ] Cambio de año
- [ ] Cambio de mes

**Test Case: Sin Datos**
- [ ] Dashboard sin transacciones
- [ ] Historial vacío
- [ ] Filtros sin resultados
- [ ] Gráficos sin datos

**Test Case: Errores de Red**
1. Desconectar internet
2. Intentar crear transacción

**Resultado esperado:**
- ✅ Muestra error amigable
- ✅ No rompe la aplicación
- ✅ Se puede reintentar al reconectar

### 6. Performance

**Métricas a verificar (Lighthouse):**

```bash
# En Chrome DevTools > Lighthouse
# Correr en modo Incógnito
```

**Objetivos:**
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 80
- [ ] PWA: Todos los checks en verde

**Test de Carga:**
- [ ] 100 transacciones: App funciona fluida
- [ ] 500 transacciones: App funciona aceptable
- [ ] 1000 transacciones: Considerar paginación

### 7. Browser Compatibility

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile:**
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Android

### 8. Security

**Test Case: SQL Injection**
- Intentar ingresar: `'; DROP TABLE transactions; --` en notas
- **Resultado**: Supabase previene automáticamente ✅

**Test Case: XSS**
- Ingresar: `<script>alert('XSS')</script>` en notas
- **Resultado**: React escapa automáticamente ✅

**Test Case: Variables de Entorno**
- Verificar que no se exponen keys privadas en el bundle
- **Resultado**: Solo anon key pública está expuesta ✅

## 📊 Reporte de Pruebas

Al completar las pruebas, documenta:

### Resumen
- Total de tests: 
- Tests pasados: 
- Tests fallidos: 
- Tests pendientes: 

### Issues Encontrados
1. 
2. 
3. 

### Ambiente de Prueba
- OS: 
- Browser: 
- Versión de Node: 
- Fecha: 

## 🚀 Pruebas en Producción

Después de deployar:

1. **Smoke Test**: Verificar que la app carga
2. **Critical Path**: Crear una transacción end-to-end
3. **PWA Install**: Instalar en al menos 2 dispositivos
4. **Offline**: Probar sin internet
5. **24h Check**: Verificar al día siguiente que datos persisten

---

**Nota**: Este es un proyecto personal, pero estas pruebas aseguran calidad y confiabilidad para tu uso diario.

