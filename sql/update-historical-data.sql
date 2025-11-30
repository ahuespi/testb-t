-- ============================================
-- SCRIPT PARA ACTUALIZAR DEPÓSITO HISTÓRICO
-- ============================================
-- Usa este script si ya insertaste el depósito histórico
-- y necesitas cambiar el monto

-- Opción 1: Actualizar por fecha y tipo
-- (Si solo tienes un depósito con esa fecha)
UPDATE transactions
SET amount = 6411416.25  -- Cambia este monto al que necesites
WHERE type = 'DEPOSIT'
  AND notes LIKE '%históricos%'  -- Solo actualiza los históricos
  AND date = '2024-01-01';  -- Cambia a la fecha que usaste

-- Opción 2: Actualizar por ID específico
-- (Más seguro si tienes múltiples depósitos)
-- Primero, encuentra el ID del depósito que quieres actualizar:
SELECT id, date, amount, notes
FROM transactions
WHERE type = 'DEPOSIT'
  AND notes LIKE '%históricos%'
ORDER BY date ASC
LIMIT 5;

-- Luego, actualiza usando el ID que encontraste:
UPDATE transactions
SET amount = 6411416.25  -- Nuevo monto
WHERE id = 'aqui-va-el-uuid-que-encontraste';

-- ============================================
-- ACTUALIZAR RETIRO HISTÓRICO
-- ============================================

-- Por fecha y tipo:
UPDATE transactions
SET amount = 1850088.09  -- Cambia este monto al que necesites
WHERE type = 'WITHDRAWAL'
  AND notes LIKE '%históricos%'
  AND date = '2024-12-01';  -- Cambia a la fecha que usaste

-- Por ID:
SELECT id, date, amount, notes
FROM transactions
WHERE type = 'WITHDRAWAL'
  AND notes LIKE '%históricos%'
ORDER BY date DESC
LIMIT 5;

UPDATE transactions
SET amount = 1850088.09
WHERE id = 'aqui-va-el-uuid-que-encontraste';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ver todos tus depósitos y retiros:
SELECT 
  date,
  type,
  amount,
  notes,
  created_at
FROM transactions 
WHERE type IN ('DEPOSIT', 'WITHDRAWAL')
ORDER BY date ASC;

-- Ver totales calculados:
SELECT 
  type,
  SUM(amount) as total,
  COUNT(*) as cantidad
FROM transactions 
WHERE type IN ('DEPOSIT', 'WITHDRAWAL')
GROUP BY type;

-- Resultado esperado:
-- DEPOSIT:    $6,411,416.25 (1 registro)
-- WITHDRAWAL: $1,850,088.09 (1 registro)

-- ============================================
-- BORRAR Y REINSERTAR (Si algo salió mal)
-- ============================================
-- Solo usa esto si necesitas empezar de cero con los históricos

-- Borrar depósito histórico:
DELETE FROM transactions
WHERE type = 'DEPOSIT'
  AND notes LIKE '%históricos%';

-- Borrar retiro histórico:
DELETE FROM transactions
WHERE type = 'WITHDRAWAL'
  AND notes LIKE '%históricos%';

-- Luego vuelve a ejecutar el insert-historical-data.sql

