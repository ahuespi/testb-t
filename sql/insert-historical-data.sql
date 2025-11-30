-- ============================================
-- SCRIPT PARA AGREGAR DATOS HISTÓRICOS
-- ============================================
-- Este script agrega los depósitos y retiros históricos acumulados
-- Ejecuta esto en SQL Editor de Supabase

-- 1. Insertar el depósito histórico acumulado
INSERT INTO transactions (
  date,
  type,
  stake,
  amount,
  net_profit,
  notes
) VALUES (
  '2024-01-01',  -- Cambia esta fecha a cuando empezaste
  'DEPOSIT',
  NULL,
  6411416.25,  -- Total depositado histórico
  0,
  'Depósitos históricos acumulados hasta la fecha'
);

-- 2. Insertar el retiro histórico acumulado
INSERT INTO transactions (
  date,
  type,
  stake,
  amount,
  net_profit,
  notes
) VALUES (
  '2024-12-01',  -- Cambia esta fecha a tu último retiro
  'WITHDRAWAL',
  NULL,
  1850088.09,  -- Total retirado histórico
  0,
  'Retiros históricos acumulados hasta la fecha'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Para verificar que se insertaron correctamente:

SELECT 
  date,
  type,
  amount,
  notes
FROM transactions 
WHERE type IN ('DEPOSIT', 'WITHDRAWAL')
ORDER BY date DESC;

-- ============================================
-- RESULTADO ESPERADO EN EL DASHBOARD
-- ============================================
-- Total Depositado: $6,411,416.25
-- Total Retirado: $1,850,088.09
-- Monto Faltante: $4,561,328.16
-- Porcentaje recuperado: 28.85%

