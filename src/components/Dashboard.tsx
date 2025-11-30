import { useMemo, useState } from "react";
import { Transaction, TransactionType } from "../types";
import { DashboardMetrics } from "./MetricCard";
import { useMetrics } from "../hooks/useMetrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatDate } from "../lib/utils";
import { EditTransactionModal } from "./EditTransactionModal";

interface DashboardProps {
  transactions: Transaction[];
  onUpdate?: (
    id: string,
    updates: {
      type?: TransactionType;
      amount?: number;
      date?: string;
      odds?: number;
      owner?: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean }>;
}

export const Dashboard = ({ transactions, onUpdate }: DashboardProps) => {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = now.toISOString().split("T")[0];

  const metrics = useMetrics(transactions, monthStart, monthEnd);

  // Prepare chart data - daily cumulative profit
  const chartData = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= new Date(monthStart) && txDate <= new Date(monthEnd);
    });

    // Sort by date
    const sorted = [...monthTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate cumulative profit by day
    const dailyData: { [key: string]: number } = {};
    let cumulative = 0;

    sorted.forEach((t) => {
      cumulative += t.net_profit;
      dailyData[t.date] = cumulative;
    });

    // Convert to chart format
    return Object.entries(dailyData).map(([date, profit]) => {
      // Format date as DD/MM for chart display
      const [, month, day] = date.split("-");
      return {
        date: `${day}/${month}`,
        profit: Math.round(profit),
      };
    });
  }, [transactions, monthStart, monthEnd]);

  // Prepare bet distribution data
  const betDistribution = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= new Date(monthStart) && txDate <= new Date(monthEnd);
    });

    const bettingTx = monthTransactions.filter((t) =>
      [
        TransactionType.BET_PENDING,
        TransactionType.BET_LOST,
        TransactionType.BET_WON,
        TransactionType.BET_CASHOUT,
      ].includes(t.type)
    );

    const distribution: { [key: number]: number } = {};
    bettingTx.forEach((t) => {
      if (t.stake) {
        distribution[t.stake] = (distribution[t.stake] || 0) + 1;
      }
    });

    return Object.entries(distribution)
      .map(([stake, count]) => ({
        stake: `${stake}%`,
        count,
      }))
      .sort((a, b) => parseInt(a.stake) - parseInt(b.stake));
  }, [transactions, monthStart, monthEnd]);

  // Get pending bets
  const pendingBets = useMemo(() => {
    return transactions
      .filter((t) => t.type === TransactionType.BET_PENDING)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const handleEditSave = async (
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
    if (onUpdate) {
      const result = await onUpdate(id, updates);
      if (result.success) {
        setEditingTransaction(null);
      }
      return result;
    }
    return { success: false };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Resumen del mes de{" "}
          {new Date().toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics metrics={metrics} />

      {/* Apuestas Pendientes */}
      {pendingBets.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Apuestas Pendientes
            </h3>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {pendingBets.length} activa{pendingBets.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {pendingBets.map((bet) => (
              <div
                key={bet.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(bet.date)}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        {bet.owner || "Propia"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Stake:</span>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(bet.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Cuota:</span>
                        <p className="font-semibold text-gray-900">
                          {bet.odds?.toFixed(2) || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">A ganar:</span>
                        <p className="font-semibold text-green-600">
                          {bet.potential_profit
                            ? formatCurrency(bet.potential_profit)
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Riesgo:</span>
                        <p className="font-semibold text-red-600">
                          -{formatCurrency(bet.amount)}
                        </p>
                      </div>
                    </div>
                    {bet.notes && (
                      <p className="text-sm text-gray-600 italic">
                        {bet.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingTransaction(bet)}
                    className="ml-4 p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    title="Resolver apuesta"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Evolution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Evolución de Beneficios
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Beneficio",
                ]}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#2563eb"
                strokeWidth={2}
                name="Beneficio Acumulado"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {chartData.length === 0 && (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos para mostrar en este período
            </div>
          )}
        </div>

        {/* Stake Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribución de Stakes
          </h3>
          {betDistribution.length > 0 ? (
            <div className="space-y-3">
              {betDistribution.slice(0, 10).map(({ stake, count }) => {
                const maxCount = Math.max(
                  ...betDistribution.map((d) => d.count)
                );
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={stake}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        Stake {stake}
                      </span>
                      <span className="text-gray-600">{count} apuestas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No hay datos de apuestas en este período
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Actividad Reciente
        </h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {transaction.type === TransactionType.DEPOSIT &&
                    "💰 Depósito"}
                  {transaction.type === TransactionType.WITHDRAWAL &&
                    "💸 Retiro"}
                  {transaction.type === TransactionType.BET_PENDING &&
                    "⏳ Apuesta Pendiente"}
                  {transaction.type === TransactionType.BET_LOST &&
                    "❌ Apuesta Perdida"}
                  {transaction.type === TransactionType.BET_WON &&
                    "✅ Apuesta Ganada"}
                  {transaction.type === TransactionType.BET_CASHOUT &&
                    "💵 Cashout"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.date)}
                  {transaction.stake && ` • Stake ${transaction.stake}%`}
                </p>
                {transaction.notes && (
                  <p className="text-xs text-gray-600 italic mt-1 truncate">
                    {transaction.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </p>
                <p
                  className={`text-xs font-medium ${
                    transaction.net_profit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.net_profit >= 0 ? "+" : ""}
                  {formatCurrency(transaction.net_profit)}
                </p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No hay transacciones registradas
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleEditSave}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
};
