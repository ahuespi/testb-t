# 🎯 Nueva Funcionalidad: Sistema de Apuestas Mejorado

## 📝 Resumen de Cambios

Se ha rediseñado completamente el sistema de registro de apuestas para hacerlo más profesional y útil:

### ✨ Características Principales

1. **Todas las apuestas se registran como "Pendientes" automáticamente**
2. **Sistema dual de ingreso: Stake % o Monto Fijo**
3. **Campo de Cuota (Odds) obligatorio**
4. **Cálculo automático de ganancia potencial**
5. **Visualización mejorada en el historial**

## 🎨 Nuevo Flujo de Trabajo

### 1. Registrar Apuesta

Cuando vas a "Nueva Transacción":

```
┌─────────────────────────────────────┐
│  Registrar Apuesta                  │
├─────────────────────────────────────┤
│  • Fecha: [selector]                │
│  • Cuota: [ej: 2.50]                │
│                                     │
│  • Método de Apuesta:               │
│    [Por Stake %] [Monto Fijo]       │
│                                     │
│  Si eliges "Por Stake %":           │
│    - Botones 1-20%                  │
│    - Monto se calcula automático    │
│                                     │
│  Si eliges "Monto Fijo":            │
│    - Ingresas monto manualmente     │
│                                     │
│  • Preview de ganancia:             │
│    Si gana: $25,000 (↑$10,000)      │
│    Si pierde: -$15,000              │
│                                     │
│  • Notas: [detalles]                │
│                                     │
│  [Registrar Apuesta Pendiente]      │
└─────────────────────────────────────┘
```

### 2. Ejemplo Práctico

**Escenario:** Quieres apostar al Under 2.5 goles en River vs Boca

**Opción A - Por Stake:**
```
✅ Método: Por Stake %
✅ Stake: 5%  →  Monto: $15,000 (calculado)
✅ Cuota: 1.85
✅ Notas: "River vs Boca - Under 2.5"

Preview:
• Si gana: $27,750  (Beneficio: +$12,750)
• Si pierde: -$15,000
```

**Opción B - Monto Fijo:**
```
✅ Método: Monto Fijo
✅ Monto: $20,000 (manual)
✅ Cuota: 1.85
✅ Notas: "River vs Boca - Under 2.5"

Preview:
• Si gana: $37,000  (Beneficio: +$17,000)
• Si pierde: -$20,000
```

### 3. Cuando se Define el Resultado

**IMPORTANTE:** Las apuestas pendientes se quedan como historial. Cuando el resultado se define:

**Si gana:**
- Ir a "Nueva Transacción"
- Tipo: "Ganada"
- Monto: El que ganaste (se puede ver en la pendiente)

**Si pierde:**
- Ir a "Nueva Transacción"
- Tipo: "Perdida"
- Automáticamente usa el monto apostado

**Si hay Cashout:**
- Ir a "Nueva Transacción"
- Tipo: "Cashout"
- Monto: Lo que recuperaste

## 📊 Visualización en Historial

### Vista Desktop

```
┌────────┬─────────┬───────┬───────┬────────┬──────────┬───────────────┬──────────┐
│ Fecha  │  Tipo   │ Stake │ Cuota │ Monto  │ Gan.Pot. │   Beneficio   │ Acciones │
├────────┼─────────┼───────┼───────┼────────┼──────────┼───────────────┼──────────┤
│ 30/Nov │ 🔵Pend  │  5%   │  2.50 │$15,000 │ +$22,500 │   -$15,000    │ Eliminar │
│ 29/Nov │ ✅Gan   │  3%   │  1.85 │ $9,000 │    -     │    +$7,650    │ Eliminar │
│ 28/Nov │ ❌Perd  │  4%   │  2.00 │$12,000 │    -     │   -$12,000    │ Eliminar │
└────────┴─────────┴───────┴───────┴────────┴──────────┴───────────────┴──────────┘
```

### Vista Mobile

```
┌─────────────────────────────────┐
│ 🔵 Apuesta Pendiente            │
│ 30 de Noviembre                 │
├─────────────────────────────────┤
│ Stake: 5%        Cuota: 2.50    │
│ Monto: $15,000                  │
│ Gan. Potencial: +$22,500        │
│ Beneficio: -$15,000             │
├─────────────────────────────────┤
│ "River vs Boca - Under 2.5"     │
└─────────────────────────────────┘
```

## 🔄 Actualización de Base de Datos

Si ya tienes Supabase configurado, ejecuta:

```sql
-- Agregar columnas nuevas
ALTER TABLE transactions 
ADD COLUMN odds DECIMAL(10, 2),
ADD COLUMN potential_profit DECIMAL(12, 2);
```

O si prefieres empezar de cero, ejecuta el nuevo `supabase-schema.sql` completo.

## 💡 Ventajas del Nuevo Sistema

### ✅ Antes vs Ahora

**Antes:**
- ❌ Tenías que elegir el tipo (Pendiente/Ganada/Perdida)
- ❌ No sabías cuánto podías ganar
- ❌ No se guardaba la cuota
- ❌ Difícil trackear apuestas en progreso

**Ahora:**
- ✅ Siempre se registra como Pendiente
- ✅ Ves la ganancia potencial al instante
- ✅ Se guarda la cuota para referencia
- ✅ Dos modos: Stake % o Monto Fijo
- ✅ Preview visual antes de registrar

## 📱 Características del Formulario

### Validaciones
- ✅ Cuota mínima: 1.01
- ✅ Si eliges Stake %, el monto es automático
- ✅ Si eliges Monto Fijo, puedes ingresar cualquier valor
- ✅ Preview en tiempo real de ganancias/pérdidas

### Cálculos Automáticos

**Ganancia Potencial:**
```
Ganancia = (Monto × Cuota) - Monto

Ejemplo:
Monto: $15,000
Cuota: 2.50
Ganancia = ($15,000 × 2.50) - $15,000
Ganancia = $37,500 - $15,000 = $22,500
```

**ROI de la Apuesta:**
```
ROI = ((Ganancia / Monto) × 100)

Ejemplo:
ROI = ($22,500 / $15,000) × 100 = 150%
```

## 🎯 Casos de Uso

### Caso 1: Apuesta con Stake Fijo (Gestión de Bankroll)
```
Usuario: "Siempre apuesto 5% del bank"
✅ Elige: Por Stake %
✅ Selecciona: 5%
✅ Monto automático: $15,000
```

### Caso 2: Apuesta con Valor Específico
```
Usuario: "Quiero apostar exactamente $25,000"
✅ Elige: Monto Fijo
✅ Ingresa: $25,000
✅ No se vincula al stake
```

### Caso 3: Comparar Apuestas
```
Usuario: "Tengo 3 apuestas pendientes, ¿cuál es mejor?"
✅ Ve el historial
✅ Compara cuotas y ganancias potenciales
✅ Decide según el riesgo/beneficio
```

## 📊 Integración con Dashboard

El dashboard ahora muestra:
- ✅ Total en apuestas pendientes (dinero comprometido)
- ✅ Ganancia potencial total
- ✅ ROI estimado si ganan todas
- ✅ Distribución de cuotas

## 🔐 Datos que se Guardan

Para cada apuesta se registra:
```javascript
{
  date: "2025-11-30",
  type: "BET_PENDING",
  stake: 5,                    // % del bank (opcional)
  amount: 15000,               // Monto apostado
  odds: 2.50,                  // Cuota
  potential_profit: 22500,     // Ganancia si gana
  net_profit: -15000,          // Actualmente negativo (pendiente)
  notes: "River vs Boca..."
}
```

## ⚠️ Notas Importantes

1. **Las apuestas pendientes NO se eliminan automáticamente** cuando registras el resultado. Son parte de tu historial.

2. **El balance refleja el dinero comprometido**: Si tienes $100,000 y 3 apuestas pendientes de $15,000 cada una, tu balance disponible es $55,000.

3. **Para resolver una pendiente:** No la edites, crea una nueva transacción (Ganada/Perdida/Cashout) con el resultado.

4. **Puedes tener múltiples pendientes:** Útil para apuestas en vivo, futuros, etc.

## 🚀 Migración desde Versión Anterior

Si ya tenías datos:

1. **Actualiza la base de datos:**
   ```sql
   ALTER TABLE transactions 
   ADD COLUMN odds DECIMAL(10, 2),
   ADD COLUMN potential_profit DECIMAL(12, 2);
   ```

2. **Las transacciones antiguas:**
   - Funcionarán normalmente
   - odds y potential_profit serán NULL (se muestra como "-")
   - El sistema sigue siendo compatible

3. **Nuevas apuestas:**
   - Siempre con cuota
   - Siempre con ganancia potencial calculada

## 📖 Guía Rápida

**Para apostar por primera vez:**
1. Click en "Nueva Transacción"
2. Ingresa la cuota (ej: 2.50)
3. Elige método: Stake % o Monto Fijo
4. Ve el preview de ganancia
5. Agrega notas descriptivas
6. Click en "Registrar Apuesta Pendiente"

**Para resolver una apuesta:**
1. Ve al historial, busca la pendiente
2. Ve a "Nueva Transacción"
3. Elige el resultado (Ganada/Perdida/Cashout)
4. El sistema lo registrará

---

**Versión:** 1.2.0  
**Fecha:** 30 de Noviembre, 2025  
**Feature:** Sistema de Apuestas con Cuotas y Doble Modo

