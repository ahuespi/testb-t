-- Create ENUM type for transaction types
CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT',
  'WITHDRAWAL',
  'BET_PENDING',
  'BET_LOST',
  'BET_WON',
  'BET_CASHOUT'
);

-- Create ENUM type for bet owners
CREATE TYPE bet_owner AS ENUM (
  'PROPIA',
  'PULPO',
  'TRADE'
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type transaction_type NOT NULL,
  owner bet_owner DEFAULT 'PROPIA',
  stake INTEGER,
  amount DECIMAL(12, 2) NOT NULL,
  odds DECIMAL(10, 2),
  potential_profit DECIMAL(12, 2),
  net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on date for faster queries
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_owner ON transactions(owner);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Create config table
CREATE TABLE config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_amount DECIMAL(12, 2) NOT NULL DEFAULT 300000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default config
INSERT INTO config (bank_amount) VALUES (300000);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since no auth is required)
-- For production with auth, these would be more restrictive
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on config" ON config
  FOR ALL
  USING (true)
  WITH CHECK (true);

