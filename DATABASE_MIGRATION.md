# 🔧 Migración de Base de Datos - Funcionalidad de Edición

## ¿Necesito Actualizar Supabase?

**Depende de cuándo creaste tu base de datos:**

### ✅ Caso 1: Base de Datos Nueva (No existe aún)

Si **AÚN NO HAS CREADO** las tablas en Supabase:

```sql
-- Simplemente ejecuta el archivo completo
-- Ya incluye TODOS los campos necesarios
```

**Acción:** Ejecuta `supabase-schema.sql` completo en SQL Editor → ✅ Listo, no necesitas más nada.

---

### 🔄 Caso 2: Base de Datos Existente (Ya creada antes)

Si **YA TIENES** las tablas creadas, necesitas agregar los campos nuevos:

#### Paso 1: Verificar qué te falta

En Supabase → Table Editor → transactions, verifica si tienes estas columnas:
- ✅ `odds` (DECIMAL)
- ✅ `potential_profit` (DECIMAL)

#### Paso 2: Ejecutar Migration Script

Si NO tienes esas columnas, ejecuta esto en SQL Editor:

```sql
-- Agregar columna de cuota (odds)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS odds DECIMAL(10, 2);

-- Agregar columna de ganancia potencial
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS potential_profit DECIMAL(12, 2);

-- Verificar que el ENUM tenga BET_PENDING (si usaste el schema viejo)
-- Esto solo lo necesitas si tu ENUM no incluye BET_PENDING
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'BET_PENDING' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
    ) THEN
        ALTER TYPE transaction_type ADD VALUE 'BET_PENDING';
    END IF;
END $$;
```

---

## 🎯 Lo Que NO Necesitas Hacer

### ❌ No Necesitas Crear Nuevas Queries

El código ya maneja las actualizaciones automáticamente:

```typescript
// Esta función ya existe en useTransactions.ts
// Ya hace el UPDATE correctamente a Supabase
const updateTransaction = async (id, updates) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updatedFields)  // ← Esto ya actualiza Supabase
    .eq('id', id)
    .select()
    .single();
}
```

### ❌ No Necesitas Cambiar Policies (RLS)

Las políticas existentes ya permiten UPDATE:

```sql
-- Esta policy ya está en tu schema
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL  -- ← Esto incluye SELECT, INSERT, UPDATE, DELETE
  USING (true)
  WITH CHECK (true);
```

---

## 📋 Checklist Completo

### Si es Base de Datos Nueva:
- [ ] Ejecutar `supabase-schema.sql` completo
- [ ] Copiar URL y anon key a `.env`
- [ ] Listo ✅

### Si es Base de Datos Existente:
- [ ] Verificar si tienes columnas `odds` y `potential_profit`
- [ ] Si NO las tienes, ejecutar el ALTER TABLE de arriba
- [ ] Verificar que el ENUM tenga `BET_PENDING`
- [ ] Listo ✅

---

## 🧪 Cómo Probar que Funciona

### Test 1: Crear Apuesta Pendiente
1. Registra una apuesta (automáticamente es pendiente)
2. Ve a Supabase → Table Editor → transactions
3. Verifica que la fila existe con:
   - `type = 'BET_PENDING'`
   - `odds = 2.50` (o la cuota que pusiste)
   - `potential_profit` tiene un valor

**✅ Si ves la fila → Funciona el INSERT**

### Test 2: Editar/Resolver Pendiente
1. En la app, click "Editar" en la pendiente
2. Selecciona "Ganó"
3. Click "Resolver"
4. Ve a Supabase → Table Editor
5. Refresca la tabla
6. Verifica que la fila se actualizó:
   - `type = 'BET_WON'` (cambió)
   - `net_profit` cambió a positivo
   - `updated_at` cambió

**✅ Si la fila se actualizó → Funciona el UPDATE**

---

## 🆘 Problemas Comunes

### Error: "column 'odds' does not exist"

**Causa:** No ejecutaste el ALTER TABLE

**Solución:**
```sql
ALTER TABLE transactions 
ADD COLUMN odds DECIMAL(10, 2),
ADD COLUMN potential_profit DECIMAL(12, 2);
```

### Error: "invalid input value for enum transaction_type: 'BET_PENDING'"

**Causa:** Tu ENUM no tiene BET_PENDING

**Solución:**
```sql
ALTER TYPE transaction_type ADD VALUE 'BET_PENDING';
```

### Error: "permission denied for table transactions"

**Causa:** Las policies RLS están mal configuradas

**Solución:**
```sql
-- Eliminar policies existentes
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

-- Recrear policy correcta
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Los cambios no se reflejan en la app

**Posibles causas:**
1. Cache del navegador → Refresca (Ctrl+F5)
2. Variables de entorno incorrectas → Verifica `.env`
3. Servidor no reiniciado → Para y corre `npm run dev` de nuevo

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────┐
│  ¿Ya creaste las tablas en Supabase?   │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
      NO               SÍ
       │                │
       ▼                ▼
  ┌────────┐      ┌──────────┐
  │Ejecuta │      │Ejecuta   │
  │schema  │      │ALTER     │
  │completo│      │TABLE     │
  │   ✅   │      │para      │
  └────────┘      │agregar   │
                  │columnas  │
                  │   ✅     │
                  └──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   ¡Todo Listo!  │
              │  La edición ya  │
              │  funciona ✅    │
              └─────────────────┘
```

---

## 🎯 Script de Migración Completo

Si ya tienes BD creada, ejecuta esto:

```sql
-- ============================================
-- MIGRATION SCRIPT
-- De: Schema sin odds/potential_profit
-- A: Schema con edición completa
-- ============================================

-- 1. Agregar columnas nuevas
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS odds DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS potential_profit DECIMAL(12, 2);

-- 2. Verificar y agregar BET_PENDING al ENUM si no existe
DO $$ 
BEGIN
    -- Check if BET_PENDING exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'BET_PENDING' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transaction_type')
    ) THEN
        ALTER TYPE transaction_type ADD VALUE 'BET_PENDING';
    END IF;
END $$;

-- 3. Verificar que las policies permiten UPDATE
-- (Solo ejecutar si tienes problemas de permisos)
DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;

CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FIN DE MIGRATION
-- ============================================

-- Verificar que todo está bien:
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
    AND column_name IN ('odds', 'potential_profit');

-- Si devuelve 2 filas → ✅ Todo bien
```

---

**TL;DR:** 
- Si BD nueva → Ejecuta schema completo ✅
- Si BD existente → Ejecuta ALTER TABLE para agregar `odds` y `potential_profit` ✅
- El código ya maneja los UPDATE automáticamente, no necesitas queries adicionales ✅

