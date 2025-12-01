import { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface BalanceEvolutionProps {
  transactions: Transaction[];
}

export const BalanceEvolution = ({ transactions }: BalanceEvolutionProps) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [savedMonthlyBalances, setSavedMonthlyBalances] = useState<Array<{ month: string; balance: number }>>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const dailyBalance = useMemo(() => {
    // Filtrar transacciones históricas
    const realTransactions = transactions.filter(
      (t) => !t.notes?.toLowerCase().includes("históricos")
    );

    // Filtrar transacciones del mes actual
    const monthTransactions = realTransactions.filter((t) => {
      const date = new Date(t.date);
      return (
        date.getFullYear() === currentYear &&
        date.getMonth() + 1 === currentMonth
      );
    });

    // Ordenar por fecha
    monthTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Calcular balance inicial del mes (suma de todos los meses anteriores)
    const previousTransactions = realTransactions.filter((t) => {
      const date = new Date(t.date);
      const txYear = date.getFullYear();
      const txMonth = date.getMonth() + 1;
      return txYear < currentYear || (txYear === currentYear && txMonth < currentMonth);
    });

    const initialDeposits = previousTransactions
      .filter((t) => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const initialWithdrawals = previousTransactions
      .filter((t) => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + t.amount, 0);

    const initialResolvedNetProfit = previousTransactions
      .filter(
        (t) =>
          t.type !== TransactionType.DEPOSIT &&
          t.type !== TransactionType.WITHDRAWAL &&
          t.type !== TransactionType.BET_PENDING
      )
      .reduce((sum, t) => sum + t.net_profit, 0);

    const initialPendingAmount = previousTransactions
      .filter((t) => t.type === TransactionType.BET_PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    const initialBalance =
      initialDeposits - initialWithdrawals + initialResolvedNetProfit - initialPendingAmount;

    // Agrupar transacciones por día
    const daysMap = new Map<string, Transaction[]>();
    monthTransactions.forEach((t) => {
      const date = new Date(t.date);
      const dayKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!daysMap.has(dayKey)) {
        daysMap.set(dayKey, []);
      }
      daysMap.get(dayKey)!.push(t);
    });

    // Calcular balance por día
    const data: Array<{ date: string; balance: number }> = [];
    let runningBalance = initialBalance;

    // Obtener todos los días del mes
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${String(day).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}`;
      const dayTransactions = daysMap.get(dayKey) || [];

      // Procesar transacciones del día
      dayTransactions.forEach((t) => {
        if (t.type === TransactionType.DEPOSIT) {
          runningBalance += t.amount;
        } else if (t.type === TransactionType.WITHDRAWAL) {
          runningBalance -= t.amount;
        } else if (t.type === TransactionType.BET_PENDING) {
          runningBalance -= t.amount; // Restar stake pendiente
        } else {
          // Apuestas resueltas: sumar net_profit
          runningBalance += t.net_profit;
        }
      });

      // Solo agregar días que tienen transacciones o el día actual
      if (dayTransactions.length > 0 || day <= now.getDate()) {
        data.push({
          date: dayKey,
          balance: Math.round(runningBalance * 100) / 100, // Redondear a 2 decimales
        });
      }
    }

    return data;
  }, [transactions, currentYear, currentMonth]);


  const currentBalance = dailyBalance.length > 0 
    ? dailyBalance[dailyBalance.length - 1].balance 
    : 0;

  const minBalance = dailyBalance.length > 0
    ? Math.min(...dailyBalance.map((d) => d.balance))
    : 0;

  const maxBalance = dailyBalance.length > 0
    ? Math.max(...dailyBalance.map((d) => d.balance))
    : 0;

  // Calcular y guardar el balance final del mes actual automáticamente
  useEffect(() => {
    if (currentBalance > 0) {
      const saveFinalBalance = async () => {
        try {
          await supabase
            .from('monthly_config')
            .upsert(
              {
                year: currentYear,
                month: currentMonth,
                final_balance: currentBalance,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'year,month',
              }
            );
        } catch (err) {
          console.error('Error saving final balance:', err);
        }
      };
      saveFinalBalance();
    }
  }, [currentBalance, currentYear, currentMonth]);

  // Cargar balances mensuales guardados de la BD
  useEffect(() => {
    const loadSavedBalances = async () => {
      if (viewMode !== 'monthly') return;
      
      setLoadingMonthly(true);
      try {
        const { data: savedBalances, error } = await supabase
          .from('monthly_config')
          .select('year, month, final_balance')
          .eq('year', selectedYear)
          .not('final_balance', 'is', null)
          .order('month', { ascending: true });

        if (error) throw error;

        const monthNamesShort = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
          'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        if (savedBalances && savedBalances.length > 0) {
          const data: Array<{ month: string; balance: number }> = [];
          for (const saved of savedBalances) {
            data.push({
              month: monthNamesShort[saved.month - 1],
              balance: saved.final_balance,
            });
          }
          setSavedMonthlyBalances(data);
        } else {
          setSavedMonthlyBalances([]);
        }
      } catch (err) {
        console.error('Error loading saved balances:', err);
        setSavedMonthlyBalances([]);
      } finally {
        setLoadingMonthly(false);
      }
    };

    loadSavedBalances();
  }, [selectedYear, viewMode]);

  // Datos mensuales para el gráfico anual - usar balances guardados si están disponibles, sino calcular
  const monthlyBalances = useMemo(() => {
    // Si hay balances guardados, usarlos
    if (savedMonthlyBalances.length > 0) {
      return savedMonthlyBalances;
    }

    // Si no hay balances guardados, calcular desde transacciones
    const realTransactions = transactions.filter(
      (t) => !t.notes?.toLowerCase().includes("históricos")
    );

    // Filtrar transacciones del año seleccionado
    const yearTransactions = realTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === selectedYear;
    });

    // Agrupar por mes
    const monthsMap = new Map<number, Transaction[]>();
    yearTransactions.forEach((t) => {
      const date = new Date(t.date);
      const month = date.getMonth() + 1; // 1-12
      if (!monthsMap.has(month)) {
        monthsMap.set(month, []);
      }
      monthsMap.get(month)!.push(t);
    });

    // Calcular balance inicial del año
    const previousYearTransactions = realTransactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() < selectedYear;
    });

    const initialDeposits = previousYearTransactions
      .filter((t) => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const initialWithdrawals = previousYearTransactions
      .filter((t) => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + t.amount, 0);

    const initialResolvedNetProfit = previousYearTransactions
      .filter(
        (t) =>
          t.type !== TransactionType.DEPOSIT &&
          t.type !== TransactionType.WITHDRAWAL &&
          t.type !== TransactionType.BET_PENDING
      )
      .reduce((sum, t) => sum + t.net_profit, 0);

    const initialPendingAmount = previousYearTransactions
      .filter((t) => t.type === TransactionType.BET_PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    let runningBalance =
      initialDeposits - initialWithdrawals + initialResolvedNetProfit - initialPendingAmount;

    const monthNamesShort = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];

    const data: Array<{ month: string; balance: number }> = [];

    for (let month = 1; month <= 12; month++) {
      const monthTransactions = monthsMap.get(month) || [];

      monthTransactions.forEach((t) => {
        if (t.type === TransactionType.DEPOSIT) {
          runningBalance += t.amount;
        } else if (t.type === TransactionType.WITHDRAWAL) {
          runningBalance -= t.amount;
        } else if (t.type === TransactionType.BET_PENDING) {
          runningBalance -= t.amount;
        } else {
          runningBalance += t.net_profit;
        }
      });

      // Solo agregar meses que tienen transacciones o el mes actual del año actual
      if (monthTransactions.length > 0 || (selectedYear === currentYear && month <= currentMonth)) {
        data.push({
          month: monthNamesShort[month - 1],
          balance: Math.round(runningBalance * 100) / 100,
        });
      }
    }

    return data;
  }, [transactions, selectedYear, currentYear, currentMonth, savedMonthlyBalances]);

  // Obtener años disponibles
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              Evolución del Balance
            </h2>
            
            {/* View Mode Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'daily'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mensual
              </button>
            </div>

            {/* Year Selector for Monthly View */}
            {viewMode === 'monthly' && availableYears.length > 0 && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'daily' ? (
            // Vista Diaria
            dailyBalance.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay transacciones registradas para este mes.
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Actual</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Mínimo</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(minBalance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Máximo</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(maxBalance)}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyBalance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `$${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `$${(value / 1000).toFixed(0)}K`;
                          }
                          return `$${value}`;
                        }}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )
          ) : (
            // Vista Mensual
            loadingMonthly ? (
              <div className="text-center py-12 text-gray-500">
                Cargando balances mensuales...
              </div>
            ) : monthlyBalances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No hay transacciones registradas para {selectedYear}.
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Final {selectedYear}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(monthlyBalances[monthlyBalances.length - 1]?.balance || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Mínimo</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(Math.min(...monthlyBalances.map((d) => d.balance)))}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Balance Máximo</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(Math.max(...monthlyBalances.map((d) => d.balance)))}
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyBalances}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `$${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `$${(value / 1000).toFixed(0)}K`;
                          }
                          return `$${value}`;
                        }}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="balance"
                        fill="#3B82F6"
                        name="Balance Final"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

