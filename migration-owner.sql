-- ============================================
-- MIGRATION SCRIPT - Propietarios de Apuestas
-- ============================================
-- 
-- Ejecuta este script completo en SQL Editor de Supabase
-- Si ya tienes el tipo bet_owner, puedes saltar el paso 1
--

-- Paso 1: Crear el tipo ENUM bet_owner
CREATE TYPE bet_owner AS ENUM (
  'PROPIA',
  'PULPO',
  'TRADE'
);

-- Paso 2: Agregar la columna owner a la tabla transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS owner bet_owner DEFAULT 'PROPIA';

-- Paso 3: Crear índice para búsquedas rápidas por propietario
CREATE INDEX IF NOT EXISTS idx_transactions_owner ON transactions(owner);

-- Paso 4: Actualizar transacciones existentes sin owner
-- (Opcional: si ya tienes datos, esto les asigna 'PROPIA' por defecto)
UPDATE transactions 
SET owner = 'PROPIA' 
WHERE owner IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto para verificar que todo está bien:

-- Verificar que el tipo existe
SELECT typname, typtype 
FROM pg_type 
WHERE typname = 'bet_owner';
-- Debe devolver: bet_owner | e (e = enum)

-- Verificar que la columna existe
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND column_name = 'owner';
-- Debe devolver: owner | USER-DEFINED | 'PROPIA'::bet_owner

-- Verificar el índice
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'transactions' 
  AND indexname = 'idx_transactions_owner';
-- Debe devolver el índice creado

-- ============================================
-- FIN DE MIGRATION
-- ============================================

