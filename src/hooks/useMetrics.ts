import { useMemo } from 'react';
import { Transaction, MetricsSummary, TransactionType } from '../types';

export const useMetrics = (transactions: Transaction[], filterStart?: string, filterEnd?: string) => {
  const metrics = useMemo<MetricsSummary>(() => {
    let filteredTransactions = transactions;

    // Apply date filters
    if (filterStart || filterEnd) {
      filteredTransactions = transactions.filter(t => {
        const txDate = new Date(t.date).getTime();
        const start = filterStart ? new Date(filterStart).getTime() : 0;
        const end = filterEnd ? new Date(filterEnd).getTime() : Infinity;
        return txDate >= start && txDate <= end;
      });
    }

    // Calculate metrics
    const deposits = filteredTransactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = filteredTransactions
      .filter(t => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + t.amount, 0);

    const bettingTransactions = filteredTransactions.filter(t =>
      [TransactionType.BET_LOST, TransactionType.BET_WON, TransactionType.BET_CASHOUT].includes(t.type)
    );

    const pendingBets = filteredTransactions.filter(t => t.type === TransactionType.BET_PENDING).length;

    const totalBet = bettingTransactions
      .reduce((sum, t) => {
        if (t.type === TransactionType.BET_LOST) {
          return sum + t.amount;
        }
        // For won/cashout, use the stake amount
        const stakeAmount = t.amount - t.net_profit;
        return sum + stakeAmount;
      }, 0);

    const netProfit = filteredTransactions.reduce((sum, t) => sum + t.net_profit, 0);

    const wonBets = filteredTransactions.filter(t => 
      t.type === TransactionType.BET_WON || 
      (t.type === TransactionType.BET_CASHOUT && t.net_profit > 0)
    ).length;

    const lostBets = filteredTransactions.filter(t => 
      t.type === TransactionType.BET_LOST ||
      (t.type === TransactionType.BET_CASHOUT && t.net_profit < 0)
    ).length;

    const cashoutBets = filteredTransactions.filter(t => 
      t.type === TransactionType.BET_CASHOUT
    ).length;

    const totalBets = wonBets + lostBets;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

    const currentBalance = deposits - withdrawals + netProfit;

    // ROI no incluye las apuestas pendientes en el cálculo
    const totalBetExcludingPending = totalBet;
    const netProfitExcludingPending = filteredTransactions
      .filter(t => t.type !== TransactionType.BET_PENDING)
      .reduce((sum, t) => sum + t.net_profit, 0);
    
    const monthlyROI = totalBetExcludingPending > 0 ? (netProfitExcludingPending / totalBetExcludingPending) * 100 : 0;

    return {
      currentBalance,
      monthlyROI,
      totalBet,
      netProfit: netProfitExcludingPending,
      wonBets,
      lostBets,
      cashoutBets,
      pendingBets,
      winRate,
    };
  }, [transactions, filterStart, filterEnd]);

  return metrics;
};

