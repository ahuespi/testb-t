import { TransactionType } from '../types';

const DEFAULT_BANK = 300000;

/**
 * Calculate the amount in ARS based on stake percentage and bank amount
 */
export const calculateStakeAmount = (stake: number, bankAmount: number = DEFAULT_BANK): number => {
  return (stake / 100) * bankAmount;
};

/**
 * Calculate net profit based on transaction type
 */
export const calculateNetProfit = (
  type: TransactionType,
  amount: number,
  stakeAmount: number
): number => {
  switch (type) {
    case TransactionType.BET_PENDING:
      return -stakeAmount; // Descuenta del balance pero no es pérdida definitiva
    case TransactionType.BET_WON:
      return amount - stakeAmount;
    case TransactionType.BET_LOST:
      return -stakeAmount;
    case TransactionType.BET_CASHOUT:
      return amount - stakeAmount;
    case TransactionType.DEPOSIT:
    case TransactionType.WITHDRAWAL:
      return 0; // These don't affect betting profit
    default:
      return 0;
  }
};

/**
 * Format currency in ARS
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to display format DD/MM/YYYY
 * Fixes timezone issue: Supabase DATE fields are stored as YYYY-MM-DD
 * and need to be parsed as local date, not UTC
 */
export const formatDate = (dateString: string): string => {
  // If dateString is already in YYYY-MM-DD format (from Supabase DATE field)
  // parse it as local date to avoid timezone issues
  let date: Date;
  
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day); // month is 0-indexed
  } else {
    // For ISO datetime strings, extract date part first
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  
  // Format as DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Get transaction type label in Spanish
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels = {
    [TransactionType.DEPOSIT]: 'Depósito',
    [TransactionType.WITHDRAWAL]: 'Retiro',
    [TransactionType.BET_PENDING]: 'Apuesta Pendiente',
    [TransactionType.BET_LOST]: 'Apuesta Perdida',
    [TransactionType.BET_WON]: 'Apuesta Ganada',
    [TransactionType.BET_CASHOUT]: 'Cashout',
  };
  return labels[type];
};

/**
 * Get color class for transaction type
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  const colors = {
    [TransactionType.DEPOSIT]: 'text-green-600 bg-green-50',
    [TransactionType.WITHDRAWAL]: 'text-red-600 bg-red-50',
    [TransactionType.BET_PENDING]: 'text-blue-600 bg-blue-50',
    [TransactionType.BET_LOST]: 'text-red-600 bg-red-50',
    [TransactionType.BET_WON]: 'text-green-600 bg-green-50',
    [TransactionType.BET_CASHOUT]: 'text-yellow-600 bg-yellow-50',
  };
  return colors[type];
};

/**
 * Get date range for filter period
 */
export const getDateRangeForPeriod = (period: 'day' | 'week' | 'month' | 'year'): { start: string; end: string } => {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (period) {
    case 'day':
      start = now;
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = now;
  }

  return {
    start: start.toISOString().split('T')[0],
    end,
  };
};

