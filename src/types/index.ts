export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET_PENDING = 'BET_PENDING',
  BET_LOST = 'BET_LOST',
  BET_WON = 'BET_WON',
  BET_CASHOUT = 'BET_CASHOUT',
}

export enum BetOwner {
  PROPIA = 'PROPIA',
  PULPO = 'PULPO',
  TRADE = 'TRADE',
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  type: TransactionType;
  owner?: BetOwner; // Owner of the bet
  stake?: number; // 1-20 or custom value
  amount: number; // in ARS
  odds?: number; // Cuota de la apuesta
  potential_profit?: number; // Ganancia potencial
  net_profit: number; // can be negative
  notes?: string;
  created_at: string;
}

export interface Config {
  id: string;
  bank_amount: number;
}

export interface TransactionFormData {
  date: string;
  type: TransactionType;
  owner?: BetOwner; // Owner of the bet
  stake?: number;
  customStake?: boolean;
  useFixedAmount?: boolean; // Si true, usa amount directamente en vez de calcular por stake
  amount: number;
  odds?: number; // Cuota
  notes?: string;
}

export interface MetricsSummary {
  currentBalance: number;
  monthlyROI: number;
  totalBet: number;
  netProfit: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  cashoutBets: number;
  winRate: number;
}

export interface OwnerStats {
  owner: BetOwner;
  wonBets: number;
  lostBets: number;
  cashoutBets: number;
  pendingBets: number;
  totalBets: number;
  netProfit: number;
  totalBet: number;
  roi: number;
  winRate: number;
}

export interface TraderStats {
  owner: BetOwner;
  wonBets: number;
  lostBets: number;
  cashoutBets: number;
  pendingBets: number;
  totalBet: number;
  netProfit: number;
  roi: number;
  winRate: number;
  avgOdds: number;
}

export type FilterPeriod = 'day' | 'week' | 'month' | 'month-select' | 'year' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

