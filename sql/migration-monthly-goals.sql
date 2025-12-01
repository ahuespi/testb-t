-- ============================================
-- MIGRATION: Agregar objetivos mensuales
-- ============================================
-- Este script agrega una tabla para guardar los objetivos mensuales y su estado de cumplimiento

-- Crear ENUM para tipos de objetivos
CREATE TYPE goal_type AS ENUM (
  'PULPO',
  'TRADE',
  'AUTO',
  'GASTOS'
);

-- Crear tabla para objetivos mensuales
CREATE TABLE IF NOT EXISTS monthly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,  -- 1-12
  goal_type goal_type NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(year, month, goal_type)
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_monthly_goals_year_month ON monthly_goals(year, month);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_type ON monthly_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_monthly_goals_completed ON monthly_goals(completed);

-- Enable Row Level Security
ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso público (para uso personal)
CREATE POLICY "Allow all operations on monthly_goals" ON monthly_goals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- EJEMPLO: Insertar objetivos del mes actual
-- ============================================
-- Los objetivos se crean automáticamente desde la aplicación,
-- pero puedes insertarlos manualmente si lo deseas:

-- INSERT INTO monthly_goals (year, month, goal_type, target_amount) 
-- VALUES 
--   (2025, 11, 'PULPO', 10000.00),
--   (2025, 11, 'TRADE', 15000.00),
--   (2025, 11, 'AUTO', 52000.00),
--   (2025, 11, 'GASTOS', 100000.00)
-- ON CONFLICT (year, month, goal_type) 
-- DO UPDATE SET target_amount = EXCLUDED.target_amount;

