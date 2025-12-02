import { useMemo, useState } from "react";
import { Transaction, BetOwner, TransactionType } from "../types";
import { formatCurrency, parseLocalDate } from "../lib/utils";

interface TradersStatsProps {
  transactions: Transaction[];
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const TradersStats = ({ transactions }: TradersStatsProps) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach((tx) => {
      years.add(parseLocalDate(tx.date).getFullYear());
    });
    years.add(selectedYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, selectedYear]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = parseLocalDate(tx.date);
      return (
        txDate.getFullYear() === selectedYear &&
        txDate.getMonth() + 1 === selectedMonth
      );
    });
  }, [transactions, selectedYear, selectedMonth]);

  const statsByOwner = useMemo(() => {
    const stats = {
      [BetOwner.PROPIA]: {
        owner: BetOwner.PROPIA,
        wonBets: 0,
        lostBets: 0,
        cashoutBets: 0,
        pendingBets: 0,
        totalBet: 0,
        netProfit: 0,
        totalAmount: 0,
        roi: 0,
        winRate: 0,
      },
      [BetOwner.PULPO]: {
        owner: BetOwner.PULPO,
        wonBets: 0,
        lostBets: 0,
        cashoutBets: 0,
        pendingBets: 0,
        totalBet: 0,
        netProfit: 0,
        totalAmount: 0,
        roi: 0,
        winRate: 0,
      },
      [BetOwner.TRADE]: {
        owner: BetOwner.TRADE,
        wonBets: 0,
        lostBets: 0,
        cashoutBets: 0,
        pendingBets: 0,
        totalBet: 0,
        netProfit: 0,
        totalAmount: 0,
        roi: 0,
        winRate: 0,
      },
    };

    filteredTransactions.forEach((tx) => {
      if (!tx.owner) return; // Skip transactions without owner

      const ownerStats = stats[tx.owner];
      if (!ownerStats) return;

      // Count by type
      if (tx.type === TransactionType.BET_WON) {
        ownerStats.wonBets++;
      } else if (tx.type === TransactionType.BET_LOST) {
        ownerStats.lostBets++;
      } else if (tx.type === TransactionType.BET_CASHOUT) {
        ownerStats.cashoutBets++;
      } else if (tx.type === TransactionType.BET_PENDING) {
        ownerStats.pendingBets++;
      }

      // Calculate total bet (stake amount)
      if (
        [
          TransactionType.BET_PENDING,
          TransactionType.BET_LOST,
          TransactionType.BET_WON,
          TransactionType.BET_CASHOUT,
        ].includes(tx.type)
      ) {
        // For lost/pending, amount is the stake
        // For won/cashout, calculate stake from amount and net_profit
        let stakeAmount = 0;
        
        if (tx.type === TransactionType.BET_LOST || tx.type === TransactionType.BET_PENDING) {
          stakeAmount = tx.amount; // Amount is the stake
        } else if (tx.type === TransactionType.BET_WON || tx.type === TransactionType.BET_CASHOUT) {
          // For won/cashout: stake = amount - net_profit
          // Example: amount=37500, net_profit=22500, stake=15000
          stakeAmount = tx.amount - tx.net_profit;
        }

        ownerStats.totalBet += stakeAmount;
      }

      // Sum net profit
      ownerStats.netProfit += tx.net_profit;
      ownerStats.totalAmount += tx.amount;
    });

    // Calculate ROI and Win Rate for each owner
    Object.values(stats).forEach((stat) => {
      const totalResolvedBets =
        stat.wonBets + stat.lostBets + stat.cashoutBets;
      stat.roi = stat.totalBet > 0 ? (stat.netProfit / stat.totalBet) * 100 : 0;
      stat.winRate =
        totalResolvedBets > 0
          ? (stat.wonBets / totalResolvedBets) * 100
          : 0;
    });

    return stats;
  }, [filteredTransactions]);

  const getOwnerLabel = (owner: BetOwner) => {
    const labels = {
      [BetOwner.PROPIA]: "Propia",
      [BetOwner.PULPO]: "Pulpo",
      [BetOwner.TRADE]: "Trade",
    };
    return labels[owner];
  };

  const getOwnerColor = (owner: BetOwner) => {
    const colors = {
      [BetOwner.PROPIA]: "bg-blue-50 border-blue-200 text-blue-900",
      [BetOwner.PULPO]: "bg-purple-50 border-purple-200 text-purple-900",
      [BetOwner.TRADE]: "bg-green-50 border-green-200 text-green-900",
    };
    return colors[owner];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Estadísticas por Trader
          </h1>
          <p className="text-gray-600">
            Desempeño individual de cada estrategia de apuestas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Mostrando</p>
            <p>
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </p>
            <p>{filteredTransactions.length} transacciones</p>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            No hay registros para {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            . Los valores se mantienen en cero para facilitar la comparación.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.values(BetOwner).map((owner) => {
          const stats = statsByOwner[owner];
          const totalResolvedBets =
            stats.wonBets + stats.lostBets + stats.cashoutBets;

          return (
            <div
              key={owner}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${getOwnerColor(
                owner
              )}`}
            >
              <h2 className="text-2xl font-bold mb-4">{getOwnerLabel(owner)}</h2>

              {/* Apuestas */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Apuestas Ganadas:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {stats.wonBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Apuestas Perdidas:</span>
                  <span className="text-lg font-semibold text-red-600">
                    {stats.lostBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cashout:</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {stats.cashoutBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pendientes:</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats.pendingBets}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Resueltas:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {totalResolvedBets}
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas Financieras */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Apostado:</span>
                  <span className="text-base font-semibold text-gray-900">
                    {formatCurrency(stats.totalBet)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Beneficio Neto:</span>
                  <span
                    className={`text-xl font-bold ${
                      stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>

              {/* ROI y Win Rate */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ROI:</span>
                  <span
                    className={`text-xl font-bold ${
                      stats.roi >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.roi.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Win Rate:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Resumen Visual */}
              {totalResolvedBets > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">
                    Distribución de Resultados
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${(stats.wonBets / totalResolvedBets) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${(stats.lostBets / totalResolvedBets) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-yellow-500"
                      style={{
                        width: `${(stats.cashoutBets / totalResolvedBets) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla Comparativa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Comparativa de Traders
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trader
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ganadas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Perdidas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Cashout
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Apostado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Beneficio Neto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  ROI
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Win Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.values(BetOwner).map((owner) => {
                const stats = statsByOwner[owner];

                return (
                  <tr key={owner} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {getOwnerLabel(owner)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                      {stats.wonBets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">
                      {stats.lostBets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-yellow-600 font-medium">
                      {stats.cashoutBets}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(stats.totalBet)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(stats.netProfit)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                        stats.roi >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stats.roi.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stats.winRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

