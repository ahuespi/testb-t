import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MonthlyGoal, GoalType, GOAL_DEFAULTS } from '../types';

export const useMonthlyGoals = (year: number, month: number) => {
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals for the given month
  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .order('goal_type', { ascending: true });

      if (error) throw error;

      // Si no hay objetivos, crear los objetivos por defecto
      if (!data || data.length === 0) {
        const defaultGoals = (Object.keys(GOAL_DEFAULTS) as GoalType[]).map((type) => ({
          year,
          month,
          goal_type: type,
          target_amount: GOAL_DEFAULTS[type],
          completed: false,
        }));

        const { data: insertedData, error: insertError } = await supabase
          .from('monthly_goals')
          .insert(defaultGoals)
          .select();

        if (insertError) throw insertError;
        setGoals(insertedData || []);
      } else {
        setGoals(data);
      }
    } catch (err: any) {
      console.error('Error fetching monthly goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  // Toggle goal completion
  const toggleGoalCompletion = useCallback(async (goalId: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals((prev) => prev.map((g) => (g.id === goalId ? data : g)));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating goal:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Update goal notes
  const updateGoalNotes = useCallback(async (goalId: string, notes: string) => {
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .update({
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;

      setGoals((prev) => prev.map((g) => (g.id === goalId ? data : g)));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating goal notes:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Fetch all completed goals for history
  const fetchCompletedGoalsHistory = useCallback(async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('Error fetching completed goals history:', err);
      return { success: false, error: err.message, data: [] };
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    toggleGoalCompletion,
    updateGoalNotes,
    fetchCompletedGoalsHistory,
    refreshGoals: fetchGoals,
  };
};

