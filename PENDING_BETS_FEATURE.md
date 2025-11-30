# 🆕 Nueva Funcionalidad: Apuestas Pendientes

## 📝 Resumen

Se ha agregado un nuevo tipo de transacción llamado **"Apuesta Pendiente"** (BET_PENDING) que permite registrar apuestas que ya se jugaron pero que aún no tienen resultado definido.

## ✨ Características

### Funcionamiento

1. **Registro de Apuesta Pendiente:**
   - Seleccionas el stake (1-20% o personalizado)
   - El monto se calcula automáticamente basado en el stake
   - Se descuenta del bank disponible inmediatamente
   - Refleja el dinero "en juego" en tu balance

2. **Impacto en el Balance:**
   - **Balance Actual**: Se descuenta el stake de la apuesta pendiente
   - **ROI**: NO incluye las apuestas pendientes (solo cuenta resultados definidos)
   - **Beneficio Neto**: NO incluye pendientes (son neutrales hasta definirse)
   - **Total Apostado**: NO incluye pendientes (solo cuenta cuando hay resultado)

3. **Contadores:**
   - Se muestra un contador de "Apuestas Pendientes" separado
   - No afecta el Win Rate (solo se calcula con ganadas vs perdidas)

### Flujo de Trabajo Recomendado

```
1. Crear apuesta → "Pendiente" (Stake 5%)
   → Se descuentan $15,000 del balance
   
2. Cuando se defina el resultado:
   → Si ganó: Crear nueva transacción "Ganada" con el monto ganado
   → Si perdió: Crear nueva transacción "Perdida" 
   → Si cashout: Crear nueva transacción "Cashout"
```

**Nota:** Las apuestas pendientes se mantienen en el historial. Cuando el resultado se define, creas una nueva transacción del tipo correspondiente.

## 🎨 Visualización

### Color: Azul (🔵)
- En el historial: Badge azul con texto "Apuesta Pendiente"
- En el dashboard: Ícono ⏳ (reloj de arena)

### Información Mostrada
- Fecha de la apuesta
- Stake utilizado
- Monto en juego
- Notas (evento, partido, etc.)

## 📊 Métricas Actualizadas

### Dashboard

**Antes:**
- Win Rate: 7G / 3P
- Total Apuestas: 10

**Ahora:**
- Win Rate: 7G / 3P / 2Pend
- Total Apuestas: 12 (7 ganadas, 2 pendientes)

### Balance

```
Balance = Depósitos - Retiros + Beneficio Neto

Donde:
- Beneficio Neto = Suma de (Ganadas - Perdidas - Pendientes)
- Pendientes descuentan su stake del balance actual
```

### Ejemplo Práctico

```
Bank inicial: $300,000

1. Depósito: +$100,000
   Balance: $400,000

2. Apuesta Pendiente (Stake 5% = $15,000):
   Balance: $385,000 (dinero en juego)
   
3. Apuesta Pendiente (Stake 3% = $9,000):
   Balance: $376,000
   
4. Primera apuesta se gana con $25,000:
   - Registro: Apuesta Ganada, Stake 5%, Monto $25,000
   - Beneficio: $25,000 - $15,000 = +$10,000
   - Balance: $386,000 ($376,000 + $10,000)
   
5. Segunda apuesta se pierde:
   - Registro: Apuesta Perdida, Stake 3%
   - Beneficio: -$9,000
   - Balance: $377,000
```

## 🔄 Migración de Base de Datos

Si ya tienes datos en Supabase, debes actualizar el ENUM:

```sql
-- Opción 1: Agregar el nuevo valor al ENUM existente
ALTER TYPE transaction_type ADD VALUE 'BET_PENDING';

-- Opción 2: Si la primera no funciona, recrear el ENUM
-- (Solo si no tienes datos importantes, esto es más limpio)
DROP TYPE IF EXISTS transaction_type CASCADE;
CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT',
  'WITHDRAWAL',
  'BET_PENDING',
  'BET_LOST',
  'BET_WON',
  'BET_CASHOUT'
);
```

**Recomendación:** Si es una base de datos nueva, simplemente ejecuta el script SQL actualizado (`supabase-schema.sql`) que ya incluye BET_PENDING.

## 📋 Archivos Modificados

### Schema de Base de Datos
- ✅ `supabase-schema.sql` - Agregado `BET_PENDING` al enum

### Tipos TypeScript
- ✅ `src/types/index.ts` - Agregado `BET_PENDING` al TransactionType
- ✅ `src/types/index.ts` - Agregado `pendingBets` a MetricsSummary

### Utilidades
- ✅ `src/lib/utils.ts` - Actualizado `calculateNetProfit()` para pendientes
- ✅ `src/lib/utils.ts` - Agregada etiqueta "Apuesta Pendiente"
- ✅ `src/lib/utils.ts` - Agregado color azul para pendientes

### Componentes
- ✅ `src/components/TransactionForm.tsx` - Agregada opción "Pendiente"
- ✅ `src/components/TransactionForm.tsx` - Campo monto automático para pendientes
- ✅ `src/components/FilterBar.tsx` - Agregada opción en filtro de tipo
- ✅ `src/components/TransactionHistory.tsx` - Muestra pendientes con badge azul
- ✅ `src/components/Dashboard.tsx` - Agregado ícono ⏳ en actividad reciente
- ✅ `src/components/Dashboard.tsx` - Incluye pendientes en distribución de stakes
- ✅ `src/components/MetricCard.tsx` - Muestra contador de pendientes

### Hooks
- ✅ `src/hooks/useTransactions.ts` - Lógica para crear pendientes
- ✅ `src/hooks/useMetrics.ts` - Cálculo de métricas excluyendo pendientes del ROI

## 🧪 Testing

### Caso de Prueba 1: Crear Apuesta Pendiente

```
1. Nueva Transacción
2. Tipo: "Pendiente"
3. Stake: 5%
4. Notas: "River vs Boca - Under 2.5"
5. Registrar

Resultado esperado:
✅ Monto automático: $15,000
✅ Balance se reduce en $15,000
✅ Aparece en historial con badge azul
✅ Contador "Pendientes" incrementa en 1
✅ No afecta ROI ni Win Rate
```

### Caso de Prueba 2: Resolver Apuesta Pendiente (Ganada)

```
1. Nueva Transacción
2. Tipo: "Ganada"
3. Stake: 5% (el mismo que la pendiente)
4. Monto ganado: $25,000
5. Registrar

Resultado esperado:
✅ Beneficio: +$10,000 ($25,000 - $15,000)
✅ Balance incrementa en $10,000
✅ Win Rate se actualiza
✅ ROI se recalcula
✅ Apuesta pendiente permanece en historial (histórico)
```

### Caso de Prueba 3: Múltiples Pendientes

```
1. Crear 3 apuestas pendientes (Stakes: 3%, 5%, 4%)
2. Ver dashboard

Resultado esperado:
✅ Balance muestra descuento de $36,000 total
✅ Contador muestra "3 pendientes"
✅ ROI no se ve afectado
✅ Gráfico de distribución incluye los 3 stakes
```

## 💡 Consejos de Uso

1. **Mantén el registro ordenado:** 
   - Usa notas descriptivas para identificar fácilmente cada apuesta pendiente
   - Ejemplo: "Champions - Real Madrid vs PSG - Over 2.5 goles"

2. **Gestión de pendientes:**
   - Puedes filtrar solo pendientes usando el filtro de tipo
   - Revisa periódicamente tus pendientes y actualiza cuando haya resultado

3. **Control de balance:**
   - El balance refleja tu dinero real disponible (descontando pendientes)
   - Útil para saber cuánto puedes apostar realmente

4. **Historial completo:**
   - Las pendientes no se eliminan cuando creas el resultado
   - Mantienen el historial completo de tu actividad

## ❓ Preguntas Frecuentes

**P: ¿Debo eliminar la apuesta pendiente cuando se resuelve?**
R: No es necesario. Puedes dejarla en el historial como registro. Solo crea una nueva transacción con el resultado.

**P: ¿Por qué el ROI no incluye pendientes?**
R: Porque aún no hay ganancia ni pérdida. El ROI solo mide el rendimiento de apuestas con resultado definido.

**P: ¿Puedo tener múltiples pendientes con el mismo stake?**
R: Sí, sin problema. Cada una es independiente.

**P: ¿Qué pasa si olvido resolver una pendiente?**
R: Se queda en el historial. Puedes filtrar por "Pendiente" para revisar cuáles tienes sin resolver.

**P: ¿El balance se ajusta automáticamente cuando resuelvo una pendiente?**
R: Sí. Cuando creas la transacción de resultado (ganada/perdida), el balance se actualiza con el resultado neto.

## 🚀 ¡Listo para Usar!

La funcionalidad está completamente implementada y lista para usar. Solo necesitas:

1. Actualizar tu base de datos Supabase con el nuevo schema
2. Reiniciar tu aplicación
3. ¡Empezar a registrar apuestas pendientes!

---

**Versión:** 1.1.0
**Fecha:** 30 de Noviembre, 2025
**Feature:** Apuestas Pendientes

