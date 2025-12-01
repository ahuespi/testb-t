-- ============================================
-- MIGRATION: Agregar balance final mensual
-- ============================================
-- Este script agrega la columna final_balance a monthly_config

-- Agregar columna para balance final
ALTER TABLE monthly_config 
ADD COLUMN IF NOT EXISTS final_balance DECIMAL(12, 2);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_monthly_config_final_balance ON monthly_config(final_balance);

-- ============================================
-- EJEMPLO: Actualizar balance final del mes
-- ============================================
-- Este se actualizará automáticamente desde la aplicación,
-- pero puedes hacerlo manualmente si lo deseas:

-- UPDATE monthly_config 
-- SET final_balance = 340000.00, updated_at = NOW()
-- WHERE year = 2025 AND month = 11;

