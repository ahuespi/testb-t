import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MonthlyConfig {
  year: number;
  month: number;
  initial_balance: number;
}

export const useMonthlyConfig = (year: number, month: number) => {
  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial balance for the given month
  const fetchInitialBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_config')
        .select('initial_balance')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (error) throw error;
      setInitialBalance(data?.initial_balance || null);
    } catch (err) {
      console.error('Error fetching monthly config:', err);
      setInitialBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // Update initial balance for the month
  const updateInitialBalance = async (balance: number) => {
    try {
      const { error } = await supabase
        .from('monthly_config')
        .upsert(
          {
            year,
            month,
            initial_balance: balance,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'year,month',
          }
        );

      if (error) throw error;
      setInitialBalance(balance);
      return { success: true };
    } catch (err) {
      console.error('Error updating monthly config:', err);
      return { success: false, error: (err as Error).message };
    }
  };

  useEffect(() => {
    fetchInitialBalance();
  }, [year, month]);

  return {
    initialBalance,
    loading,
    updateInitialBalance,
  };
};

