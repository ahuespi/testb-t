-- ============================================
-- MIGRATION: Agregar balance inicial mensual
-- ============================================
-- Este script agrega una tabla para guardar el balance inicial de cada mes

-- Crear tabla para configuraciones mensuales
CREATE TABLE IF NOT EXISTS monthly_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 1-12
  initial_balance DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(year, month)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_monthly_config_year_month ON monthly_config(year, month);

-- Enable Row Level Security
ALTER TABLE monthly_config ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso público (para uso personal)
CREATE POLICY "Allow all operations on monthly_config" ON monthly_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- EJEMPLO: Insertar balance inicial del mes actual
-- ============================================
-- Cambia los valores según tu caso:

INSERT INTO monthly_config (year, month, initial_balance) 
VALUES (2025, 11, 300000.00)  -- Noviembre 2025: $300,000
ON CONFLICT (year, month) 
DO UPDATE SET initial_balance = EXCLUDED.initial_balance;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver todas las configuraciones mensuales:
SELECT year, month, initial_balance, updated_at
FROM monthly_config
ORDER BY year DESC, month DESC;

