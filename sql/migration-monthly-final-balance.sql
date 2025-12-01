-- ============================================
-- MIGRATION: Agregar balance final mensual
-- ============================================
-- Este script agrega una columna para guardar el balance final de cada mes

-- Agregar columna final_balance a monthly_config
ALTER TABLE monthly_config 
ADD COLUMN IF NOT EXISTS final_balance DECIMAL(12, 2);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_monthly_config_final_balance ON monthly_config(year, month) WHERE final_balance IS NOT NULL;

-- ============================================
-- NOTA: El balance final se calculará y guardará automáticamente
-- desde la aplicación cuando se procesen los meses
-- ============================================

