# ✏️ Funcionalidad: Edición de Apuestas con Bonos

## 📝 Resumen

Se ha agregado la capacidad de **editar el monto final** de apuestas ganadas o cashout para reflejar bonos, promociones o pagos ajustados que las casas de apuestas otorgan.

## 🎯 Problema que Resuelve

Las casas de apuestas frecuentemente ofrecen:
- 📈 **Bonos de cuota mejorada**: "Si ganas, te pagamos 10% más"
- 🎁 **Promociones especiales**: "Primera apuesta con seguro"
- 💰 **Freebets y cashbacks**: Montos adicionales
- 🎲 **Boosts de cuota**: Cuota aumentada por promoción

**Ejemplo Real:**
```
Apuesta: $15,000 a cuota 2.50
Pago según cuota: $37,500 (Beneficio: $22,500)

Casa ofrece: "10% extra en ganancias"
Pago real: $40,000 (Beneficio: $25,000)

❌ Antes: Quedaba registrado con $22,500 de beneficio
✅ Ahora: Puedes editar y registrar $25,000 de beneficio real
```

## 🔧 Cómo Funciona

### 1. Identificar Transacciones Editables

Solo puedes editar:
- ✅ **Apuestas Ganadas** (BET_WON)
- ✅ **Cashout** (BET_CASHOUT)

No puedes editar:
- ❌ Apuestas Pendientes
- ❌ Apuestas Perdidas
- ❌ Depósitos
- ❌ Retiros

### 2. Abrir el Editor

En el historial de transacciones:
1. Busca la apuesta ganada que quieres ajustar
2. Click en el botón **"Editar"** (solo aparece en ganadas/cashout)
3. Se abre un modal de edición

### 3. Ajustar el Monto

El modal te muestra:

```
┌──────────────────────────────────────┐
│  Editar Transacción                  │
├──────────────────────────────────────┤
│  Información Original:               │
│  • Monto apostado: $15,000           │
│  • Cuota: 2.50                       │
│  • Pago según cuota: $37,500         │
├──────────────────────────────────────┤
│  Monto Final Recibido:               │
│  [  40000  ] ← Edita aquí            │
│                                      │
│  Vista previa del cambio:            │
│  • Beneficio original: +$22,500      │
│  • Nuevo beneficio: +$25,000         │
│  • Diferencia: +$2,500               │
├──────────────────────────────────────┤
│  Notas:                              │
│  [Bono del 10% por promoción]        │
│                                      │
│  [Cancelar]  [Guardar Cambios]       │
└──────────────────────────────────────┘
```

### 4. Guardar Cambios

Al guardar:
- ✅ El monto se actualiza en la base de datos
- ✅ El beneficio neto se recalcula automáticamente
- ✅ Las métricas del dashboard se actualizan
- ✅ El ROI se ajusta con el nuevo valor

## 💡 Casos de Uso

### Caso 1: Boost de Cuota

**Situación:**
- Casa ofrece: "Cuota mejorada en el clásico"
- Apuesta: $20,000 a cuota 1.80 → debería pagar $36,000
- Promoción: Casa paga como si fuera cuota 2.00 → $40,000

**Acción:**
1. La apuesta gana y registras $36,000 inicialmente
2. Te das cuenta que la casa pagó $40,000
3. Click "Editar" en esa transacción
4. Cambias monto de $36,000 a $40,000
5. Beneficio aumenta de $16,000 a $20,000

### Caso 2: Devolución de Stake

**Situación:**
- Casa ofrece: "Si pierdes tu primera apuesta, te devolvemos el stake"
- Apuesta: $15,000 a cuota 1.50
- Resultado: Pierde
- Pero luego la casa te devuelve el stake como "apuesta gratis"

**Acción:**
1. Primero registras como "Perdida" (-$15,000)
2. Cuando te devuelven el stake, haces una nueva apuesta con eso
3. Si ganas esa nueva apuesta, el resultado es neto positivo

### Caso 3: Cashback Semanal

**Situación:**
- Casa ofrece: "5% de cashback en pérdidas semanales"
- Perdiste $100,000 en la semana
- Casa te devuelve $5,000

**Acción:**
1. Registras como "Depósito" de $5,000
2. En notas pones: "Cashback semanal 5%"

### Caso 4: Seguro de Apuesta

**Situación:**
- Casa ofrece: "Si tu apuesta se anula, te devolvemos"
- Apuesta: $10,000 a cuota 3.00
- Partido cancelado → Casa devuelve tu stake

**Acción:**
1. Registras como "Cashout"
2. Monto: $10,000 (recuperas lo apostado)
3. Beneficio neto: $0 (no ganaste ni perdiste)

## 🧮 Cálculos Automáticos

El sistema hace estos cálculos por ti:

```javascript
// Cuando editas el monto final

Monto Original Apostado = Monto Anterior - Beneficio Anterior
// Ejemplo: $37,500 - $22,500 = $15,000

Nuevo Beneficio = Nuevo Monto Final - Monto Original Apostado
// Ejemplo: $40,000 - $15,000 = $25,000

Diferencia = Nuevo Beneficio - Beneficio Anterior
// Ejemplo: $25,000 - $22,500 = +$2,500
```

**El sistema SOLO recalcula el beneficio neto**, no toca:
- ❌ El stake original
- ❌ La cuota original
- ❌ La fecha
- ❌ El tipo de transacción

## 🎨 Interfaz

### Desktop

```
Historial:
┌────────┬─────────┬───────┬───────┬────────┬──────────┬──────────┬──────────┐
│ Fecha  │  Tipo   │ Stake │ Cuota │ Monto  │ Gan.Pot. │ Beneficio│ Acciones │
├────────┼─────────┼───────┼───────┼────────┼──────────┼──────────┼──────────┤
│ 30/Nov │ ✅Gan   │  5%   │  2.50 │$37,500 │ +$22,500 │ +$22,500 │ Editar   │
│        │         │       │       │        │          │          │ Eliminar │
└────────┴─────────┴───────┴───────┴────────┴──────────┴──────────┴──────────┘
                                                           ▲
                                         Click aquí para editar el monto
```

### Mobile

```
┌─────────────────────────────────────┐
│ ✅ Apuesta Ganada     [Editar]      │
│ 30 de Noviembre       [Eliminar]    │
├─────────────────────────────────────┤
│ Stake: 5%        Cuota: 2.50        │
│ Monto: $37,500                      │
│ Gan. Potencial: +$22,500            │
│ Beneficio: +$22,500                 │
└─────────────────────────────────────┘
```

## 📋 Validaciones

El sistema valida:
- ✅ Solo puedes editar apuestas ganadas o cashout
- ✅ El nuevo monto debe ser mayor a 0
- ✅ Puedes agregar notas explicativas
- ✅ Te muestra un preview antes de guardar

## 🔒 Seguridad

- Los cambios se guardan inmediatamente en Supabase
- El beneficio neto se recalcula automáticamente
- No puedes romper la integridad de los datos
- El historial mantiene registro de todo

## 💾 Estructura de Datos

Lo que se actualiza en la base de datos:

```javascript
UPDATE transactions SET
  amount = 40000,              // Nuevo monto final
  net_profit = 25000,          // Recalculado automáticamente
  notes = 'Bono 10% promo'     // Opcional, si agregas notas
WHERE id = '...'
```

Lo que NO cambia:
- `date` - La fecha original
- `type` - El tipo de transacción
- `stake` - El porcentaje original
- `odds` - La cuota original
- `potential_profit` - La ganancia potencial original

## 📊 Impacto en Métricas

Al editar una apuesta, se actualizan automáticamente:
- ✅ **Balance Actual**: Aumenta/disminuye según el cambio
- ✅ **Beneficio Neto**: Se ajusta con la diferencia
- ✅ **ROI**: Se recalcula con los nuevos valores
- ✅ **Gráficos**: Reflejan los nuevos datos

## 🎓 Mejores Prácticas

### 1. Registra Primero, Edita Después
```
✅ Buena práctica:
1. Registra la apuesta con el pago según cuota
2. Si la casa paga más, edítala después
3. Agrega notas explicando el bono

❌ Mala práctica:
1. Esperar a ver si hay bono antes de registrar
2. No documentar de dónde salió el monto extra
```

### 2. Documenta los Bonos
```
✅ En las notas, especifica:
- "Bono 10% por promoción X"
- "Cashback mensual"
- "Cuota mejorada de 2.00 a 2.20"

❌ No dejes en blanco:
- El sistema funciona, pero luego no sabrás por qué
```

### 3. Verifica Antes de Editar
```
✅ Asegúrate que:
- El monto recibido es el correcto
- Incluiste todos los bonos
- Descontaste comisiones si las hay

❌ No edites múltiples veces:
- Revisa tu cuenta antes de editar
- Hazlo una sola vez con el monto final
```

## 🆕 Ejemplo Completo

**Escenario Real:**

```
Paso 1: Registro Inicial
------------------------
Fecha: 30/Nov/2025
Tipo: Apuesta Ganada
Stake: 5% ($15,000)
Cuota: 2.50
Monto según cuota: $37,500
Beneficio: $22,500
Notas: "River vs Boca - Over 2.5"

Paso 2: Casa Paga con Bono
---------------------------
Revisas tu cuenta:
- Esperabas: $37,500
- Recibiste: $40,000
- Diferencia: +$2,500 (bono 10%)

Paso 3: Editas la Transacción
------------------------------
Click "Editar" en la transacción
Cambias monto de $37,500 a $40,000
Agregas nota: "Incluye bono 10% promoción Black Friday"
Guardas

Resultado Final:
----------------
Fecha: 30/Nov/2025
Tipo: Apuesta Ganada
Stake: 5% ($15,000)
Cuota: 2.50 (original)
Monto final: $40,000 (editado)
Beneficio: $25,000 (recalculado)
Notas: "River vs Boca - Over 2.5 + Incluye bono 10% promoción Black Friday"

Balance se ajustó: +$2,500 adicionales
ROI mejoró por el bono extra
```

## ⚠️ Limitaciones

**Lo que NO puedes hacer:**
- ❌ Editar apuestas pendientes (aún no tienen resultado)
- ❌ Editar apuestas perdidas (no tiene sentido)
- ❌ Editar la fecha o el stake original
- ❌ Cambiar el tipo de transacción

**Por qué:**
- Las pendientes aún no se resolvieron
- Las perdidas no tienen monto final que ajustar
- El stake y fecha son históricos, no se deben modificar

## 🔄 Alternativas para Otros Tipos

Si necesitas ajustar otras transacciones:

**Apuesta Perdida con Devolución:**
- Registra la pérdida normal
- Crea un nuevo "Depósito" por la devolución

**Pendiente que Cambió:**
- Elimina la pendiente incorrecta
- Registra una nueva con los datos correctos

**Depósito o Retiro Incorrecto:**
- Elimina la transacción incorrecta
- Registra una nueva con el monto correcto

---

**Versión:** 1.3.0  
**Fecha:** 30 de Noviembre, 2025  
**Feature:** Edición de Montos con Bonos

