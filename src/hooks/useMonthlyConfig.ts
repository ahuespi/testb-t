import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface MonthlyConfig {
  year: number;
  month: number;
  initial_balance: number;
  final_balance?: number;
}

export const useMonthlyConfig = (year: number, month: number) => {
  const [initialBalance, setInitialBalance] = useState<number | null>(null);
  const [finalBalance, setFinalBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial and final balance for the given month
  const fetchBalances = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('monthly_config')
        .select('initial_balance, final_balance')
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setInitialBalance(data?.initial_balance || null);
      setFinalBalance(data?.final_balance || null);
    } catch (err) {
      console.error('Error fetching monthly config:', err);
      setInitialBalance(null);
      setFinalBalance(null);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  // Update initial balance for the month
  const updateInitialBalance = useCallback(async (balance: number) => {
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
  }, [year, month]);

  // Update final balance for the month
  const updateFinalBalance = useCallback(async (balance: number) => {
    try {
      const { error } = await supabase
        .from('monthly_config')
        .upsert(
          {
            year,
            month,
            final_balance: balance,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'year,month',
          }
        );

      if (error) throw error;
      setFinalBalance(balance);
      return { success: true };
    } catch (err) {
      console.error('Error updating final balance:', err);
      return { success: false, error: (err as Error).message };
    }
  }, [year, month]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    initialBalance,
    finalBalance,
    loading,
    updateInitialBalance,
    updateFinalBalance,
  };
};

