# 🔄 Funcionalidad: Resolver Apuestas Pendientes

## 📝 Resumen

Ahora puedes **editar apuestas pendientes directamente** para cambiarlas a ganadas, perdidas o cashout sin necesidad de crear una nueva transacción.

## 🎯 Cambio Importante

### ❌ Antes (Flujo Antiguo)
```
1. Registras apuesta como "Pendiente"
2. Cuando se resuelve, creas NUEVA transacción:
   - Si ganó: Nueva transacción "Ganada"
   - Si perdió: Nueva transacción "Perdida"
3. La pendiente queda en el historial
4. Terminas con 2 transacciones por la misma apuesta
```

### ✅ Ahora (Flujo Mejorado)
```
1. Registras apuesta como "Pendiente"
2. Cuando se resuelve, EDITAS la misma transacción:
   - Click en "Editar"
   - Seleccionas: Ganó / Perdió / Cashout
   - Se actualiza automáticamente
3. Mantienes UNA SOLA transacción
4. Historial más limpio y ordenado
```

## 🎨 Cómo Funciona

### Paso 1: Tienes una Apuesta Pendiente

```
Historial:
┌────────┬──────────┬───────┬───────┬────────┬──────────┬──────────┬──────────┐
│ Fecha  │   Tipo   │ Stake │ Cuota │ Monto  │ Gan.Pot. │ Beneficio│ Acciones │
├────────┼──────────┼───────┼───────┼────────┼──────────┼──────────┼──────────┤
│ 30/Nov │ 🔵 Pend  │  5%   │  2.50 │$15,000 │ +$22,500 │ -$15,000 │  Editar  │
└────────┴──────────┴───────┴───────┴────────┴──────────┴──────────┴──────────┘
```

### Paso 2: La Apuesta se Resuelve

Click en **"Editar"** → Se abre el modal:

```
┌─────────────────────────────────────────┐
│  Resolver Apuesta                       │
├─────────────────────────────────────────┤
│  Información Original:                  │
│  • Monto apostado: $15,000              │
│  • Cuota: 2.50                          │
│  • Pago si gana: $37,500                │
├─────────────────────────────────────────┤
│  ¿Cuál fue el resultado?                │
│  [✅ Ganó] [❌ Perdió] [💵 Cashout]     │
├─────────────────────────────────────────┤
│  (Seleccionas según el resultado)       │
└─────────────────────────────────────────┘
```

### Paso 3: Según el Resultado

#### Opción A: Ganó ✅

```
1. Click en "Ganó"
2. El sistema automáticamente:
   - Calcula el pago: $37,500
   - Muestra el monto en el campo
3. Si hubo bonus, puedes ajustar el monto
4. Click "Resolver"

Resultado:
• Tipo: Pendiente → Ganada
• Monto: $37,500
• Beneficio: +$22,500
```

#### Opción B: Perdió ❌

```
1. Click en "Perdió"
2. El sistema automáticamente:
   - Confirma la pérdida de $15,000
   - No hay campo de monto (se pierde el stake)
3. Click "Resolver"

Resultado:
• Tipo: Pendiente → Perdida
• Monto: $15,000 (el stake)
• Beneficio: -$15,000
```

#### Opción C: Cashout 💵

```
1. Click en "Cashout"
2. El sistema automáticamente:
   - Sugiere 80% del stake ($12,000)
   - Puedes editar el monto recuperado
3. Ingresas el monto real del cashout
4. Click "Resolver"

Resultado:
• Tipo: Pendiente → Cashout
• Monto: El que recuperaste (ej: $12,000)
• Beneficio: -$3,000 (perdiste $3,000)
```

## 📊 Ejemplos Completos

### Ejemplo 1: Apuesta que Ganó

**Situación:**
```
Apuesta Pendiente:
- Monto: $15,000 (Stake 5%)
- Cuota: 2.50
- Pago esperado: $37,500
- Beneficio esperado: +$22,500
```

**Proceso:**
1. La apuesta gana
2. Click "Editar" en la pendiente
3. Seleccionas "✅ Ganó"
4. Sistema muestra:
   ```
   Monto Ganado: $37,500
   (Puedes ajustarlo si hay bonus)
   ```
5. Click "Resolver"

**Resultado Final:**
```
Transacción actualizada:
- Fecha: 30/Nov (la misma)
- Tipo: 🔵 Pendiente → ✅ Ganada
- Monto: $37,500
- Beneficio: +$22,500
- Balance: Aumenta en $37,500
```

### Ejemplo 2: Apuesta que Perdió

**Situación:**
```
Apuesta Pendiente:
- Monto: $20,000 (Stake 3%)
- Cuota: 1.85
- En riesgo: $20,000
```

**Proceso:**
1. La apuesta pierde
2. Click "Editar" en la pendiente
3. Seleccionas "❌ Perdió"
4. Sistema muestra:
   ```
   Pérdida confirmada: $20,000
   ```
5. Click "Resolver"

**Resultado Final:**
```
Transacción actualizada:
- Tipo: 🔵 Pendiente → ❌ Perdida
- Monto: $20,000
- Beneficio: -$20,000
- Balance: Ya estaba descontado (no cambia)
```

### Ejemplo 3: Cashout Parcial

**Situación:**
```
Apuesta Pendiente:
- Monto: $15,000
- Cuota: 3.00
- La apuesta va bien, decides salir early
```

**Proceso:**
1. Haces cashout en la casa de apuestas
2. Te devuelven $25,000 (menos que los $45,000 totales)
3. Click "Editar" en la pendiente
4. Seleccionas "💵 Cashout"
5. Ingresas: $25,000
6. Sistema calcula:
   ```
   Beneficio: $25,000 - $15,000 = +$10,000
   ```
7. Click "Resolver"

**Resultado Final:**
```
Transacción actualizada:
- Tipo: 🔵 Pendiente → 💵 Cashout
- Monto: $25,000
- Beneficio: +$10,000
- Balance: Aumenta en $10,000 neto
```

## 🎯 Ventajas del Nuevo Sistema

### ✅ Historial Más Limpio
- Una transacción por apuesta (no duplicados)
- Fácil de seguir el tracking
- No confundes pendientes con resultados

### ✅ Menos Clics
- Antes: 2 transacciones (pendiente + resultado)
- Ahora: 1 transacción (editas la existente)

### ✅ Datos Más Precisos
- Mantiene la fecha original
- Mantiene el stake original
- Mantiene la cuota original
- Solo actualiza el resultado

### ✅ Mejor Control
- Ves todas las pendientes claramente
- Las resuelves cuando sea necesario
- No hay transacciones "huérfanas"

## 🔧 Características Técnicas

### Cálculos Automáticos

El sistema calcula automáticamente según el tipo:

```javascript
// BET_WON (Ganada)
beneficio = montoGanado - montoApostado
// Ejemplo: $37,500 - $15,000 = +$22,500

// BET_LOST (Perdida)
beneficio = -montoApostado
// Ejemplo: -$15,000

// BET_CASHOUT (Cashout)
beneficio = montoCashout - montoApostado
// Ejemplo: $12,000 - $15,000 = -$3,000
```

### Validaciones

- ✅ Solo puedes editar apuestas pendientes, ganadas o cashout
- ✅ No puedes cambiar una perdida a ganada
- ✅ El monto apostado original no se modifica
- ✅ La cuota original se mantiene para referencia

### Preview en Tiempo Real

Antes de guardar, ves:
- Estado anterior vs nuevo
- Beneficio anterior vs nuevo
- Impacto en el balance

## 📱 Interfaz

### En el Historial

```
Apuestas Pendientes tienen botón "Editar":

Desktop:
┌────────┬──────────┬───────┬───────┬────────┬──────────┬──────────┬──────────┐
│ Fecha  │   Tipo   │ Stake │ Cuota │ Monto  │ Gan.Pot. │ Beneficio│ Acciones │
├────────┼──────────┼───────┼───────┼────────┼──────────┼──────────┼──────────┤
│ 30/Nov │ 🔵 Pend  │  5%   │  2.50 │$15,000 │ +$22,500 │ -$15,000 │  Editar  │
│ 29/Nov │ ✅ Gan   │  3%   │  1.85 │$20,000 │    -     │  +$7,650 │  Editar  │
│ 28/Nov │ ❌ Perd  │  4%   │  2.00 │$12,000 │    -     │ -$12,000 │ Eliminar │
└────────┴──────────┴───────┴───────┴────────┴──────────┴──────────┴──────────┘
                ▲                                                      ▲
          Pendiente tiene                                    Ganada/Cashout
          botón Editar                                       pueden editar monto
```

### Modal de Resolución

```
┌─────────────────────────────────────────┐
│  Resolver Apuesta                    [×]│
├─────────────────────────────────────────┤
│  Información Original:                  │
│  • Monto apostado: $15,000              │
│  • Cuota: 2.50                          │
│  • Pago si gana: $37,500                │
├─────────────────────────────────────────┤
│  ¿Cuál fue el resultado?                │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │✅ Ganó │ │❌Perdió│ │💵Cash │      │
│  └────────┘ └────────┘ └────────┘      │
├─────────────────────────────────────────┤
│  [Si seleccionaste Ganó o Cashout]     │
│                                         │
│  Monto Final: [  37500  ]               │
│                                         │
│  Vista previa:                          │
│  • Estado: Pendiente → Ganada           │
│  • Beneficio anterior: -$15,000         │
│  • Nuevo beneficio: +$22,500            │
│  • Impacto: +$37,500                    │
├─────────────────────────────────────────┤
│  Notas: [Ganó en tiempo regular]        │
│                                         │
│  [Cancelar]        [Resolver]           │
└─────────────────────────────────────────┘
```

## 💡 Casos de Uso Especiales

### Caso 1: Bonus en Apuesta Ganada

```
Apuesta pendiente a cuota 2.50
Pago esperado: $37,500
Casa paga con bonus: $40,000

Solución:
1. Editas la pendiente
2. Seleccionas "Ganó"
3. Cambias monto de $37,500 a $40,000
4. En notas: "Incluye bonus 10%"
5. Resuelves
```

### Caso 2: Apuesta Anulada

```
Partido cancelado
Casa devuelve tu stake

Solución:
1. Editas la pendiente
2. Seleccionas "Cashout"
3. Monto: $15,000 (recuperas lo apostado)
4. Beneficio: $0 (no ganaste ni perdiste)
5. En notas: "Partido cancelado - stake devuelto"
```

### Caso 3: Half Win/Half Lost (Asiáticas)

```
Apuesta asiática gana parcialmente
Apostaste: $20,000
Recuperas: $30,000 (la mitad ganó)

Solución:
1. Editas la pendiente
2. Seleccionas "Cashout" o "Ganó"
3. Monto: $30,000
4. Beneficio: +$10,000
5. En notas: "Half win línea -0.25"
```

## ⚠️ Importante

### Lo Que NO Cambia
- ❌ La fecha original de la apuesta
- ❌ El stake (%) original
- ❌ La cuota original
- ❌ El monto apostado original

### Lo Que SÍ Cambia
- ✅ El tipo (Pendiente → Ganada/Perdida/Cashout)
- ✅ El monto final recibido
- ✅ El beneficio neto
- ✅ Las notas

### Buenas Prácticas

1. **Resuelve las pendientes cuando sepas el resultado**
   - No las dejes acumuladas
   - Mantén el historial actualizado

2. **Documenta cambios especiales**
   - Si hay bonus, anótalo
   - Si fue cashout, explica por qué
   - Si hubo anulación, especifícalo

3. **Verifica antes de resolver**
   - Revisa el preview
   - Confirma el monto recibido
   - Lee las notas antes de guardar

## 🆕 Compatibilidad

### Con Apuestas Antiguas

Si ya tenías apuestas pendientes:
- ✅ Puedes editarlas normalmente
- ✅ Todas las pendientes son editables
- ✅ El sistema calcula correctamente

### Con el Sistema Anterior

Si creaste transacciones duplicadas antes:
- Puedes eliminar las duplicadas
- O dejarlas (no afecta el funcionamiento)
- El nuevo sistema no crea duplicados

---

**Versión:** 1.4.0  
**Fecha:** 30 de Noviembre, 2025  
**Feature:** Resolución Directa de Apuestas Pendientes

