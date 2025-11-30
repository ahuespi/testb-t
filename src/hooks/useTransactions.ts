import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionFormData, TransactionType } from '../types';
import { calculateNetProfit, calculateStakeAmount } from '../lib/utils';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankAmount, setBankAmount] = useState(300000);

  // Fetch bank amount
  const fetchBankAmount = async () => {
    try {
      const { data, error } = await supabase
        .from('config')
        .select('bank_amount')
        .single();

      if (error) throw error;
      if (data) setBankAmount(data.bank_amount);
    } catch (err) {
      console.error('Error fetching bank amount:', err);
    }
  };

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new transaction
  const addTransaction = async (formData: TransactionFormData) => {
    try {
      let amount = formData.amount;
      const isBetting = [TransactionType.BET_PENDING, TransactionType.BET_LOST, TransactionType.BET_WON, TransactionType.BET_CASHOUT].includes(formData.type);

      // For betting transactions, ensure we have the amount
      // If using stake mode (not fixed amount), calculate from stake
      if (isBetting && !formData.useFixedAmount && formData.stake) {
        amount = calculateStakeAmount(formData.stake, bankAmount);
      }

      // Calculate potential profit for pending bets
      const potentialProfit = isBetting && formData.odds
        ? amount * formData.odds - amount
        : null;

      // Calculate net profit based on transaction type
      const netProfit = calculateNetProfit(formData.type, amount, amount); // For pending, net_profit is -amount

      const newTransaction = {
        date: formData.date,
        type: formData.type,
        owner: formData.owner || 'PROPIA',
        stake: formData.stake,
        amount,
        odds: formData.odds || null,
        potential_profit: potentialProfit,
        net_profit: netProfit,
        notes: formData.notes || null,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) throw error;
      
      setTransactions(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding transaction';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting transaction';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Update transaction (for editing won/cashout amounts and resolving pending bets)
  const updateTransaction = async (
    id: string,
    updates: { 
      type?: TransactionType; 
      amount?: number; 
      date?: string; 
      odds?: number;
      owner?: string;
      notes?: string;
    }
  ) => {
    try {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) throw new Error("Transaction not found");

      let netProfit = transaction.net_profit;
      let finalAmount = updates.amount ?? transaction.amount;
      const finalType = updates.type ?? transaction.type;

      // Get the original stake (what was risked)
      // For pending bets, amount IS the stake
      let originalStake =
        transaction.type === TransactionType.BET_PENDING
          ? transaction.amount
          : transaction.amount - transaction.net_profit;

      // If changing to pending or lost, and amount is provided, use it as the stake
      if ((finalType === TransactionType.BET_PENDING || finalType === TransactionType.BET_LOST) && updates.amount !== undefined) {
        originalStake = updates.amount;
      }

      // Calculate net profit based on the final type
      if (finalType === TransactionType.BET_WON || finalType === TransactionType.BET_CASHOUT) {
        netProfit = finalAmount - originalStake;
      } else if (finalType === TransactionType.BET_LOST) {
        netProfit = -originalStake;
        finalAmount = originalStake; // Lost bets amount = stake
      } else if (finalType === TransactionType.BET_PENDING) {
        netProfit = -originalStake; // Pending still shows as negative
        finalAmount = originalStake; // Pending bets amount = stake
      }

      const updatedFields: any = {
        type: finalType,
        amount: finalAmount,
        net_profit: netProfit,
        date: updates.date ?? transaction.date,
        notes: updates.notes ?? transaction.notes,
      };

      // Update odds if provided
      if (updates.odds !== undefined) {
        updatedFields.odds = updates.odds;
        // Recalculate potential_profit if odds changed
        if (updates.odds > 0) {
          updatedFields.potential_profit = originalStake * updates.odds;
        }
      }

      // Update owner if provided
      if (updates.owner !== undefined) {
        updatedFields.owner = updates.owner;
      }

      const { data, error } = await supabase
        .from("transactions")
        .update(updatedFields)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setTransactions((prev) => prev.map((t) => (t.id === id ? data : t)));
      return { success: true, data };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error updating transaction";
      setError(message);
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    fetchBankAmount();
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    bankAmount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
  };
};

