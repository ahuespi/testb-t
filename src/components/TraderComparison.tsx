import { useMemo } from "react";
import { Transaction, BetOwner, TransactionType, TraderStats } from "../types";
import { formatCurrency } from "../lib/utils";

interface TraderComparisonProps {
  transactions: Transaction[];
}

export const TraderComparison = ({ transactions }: TraderComparisonProps) => {
  // Calcular estadísticas por trader
  const traderStats = useMemo<TraderStats[]>(() => {
    const owners = [BetOwner.PROPIA, BetOwner.PULPO, BetOwner.TRADE];
    
    return owners.map((owner) => {
      const ownerTransactions = transactions.filter(
        (t) => t.owner === owner &&
        [TransactionType.BET_PENDING, TransactionType.BET_LOST, TransactionType.BET_WON, TransactionType.BET_CASHOUT].includes(t.type)
      );

      const wonBets = ownerTransactions.filter(
        (t) => t.type === TransactionType.BET_WON
      ).length;

      const lostBets = ownerTransactions.filter(
        (t) => t.type === TransactionType.BET_LOST
      ).length;

      const cashoutBets = ownerTransactions.filter(
        (t) => t.type === TransactionType.BET_CASHOUT
      ).length;

      const pendingBets = ownerTransactions.filter(
        (t) => t.type === TransactionType.BET_PENDING
      ).length;

      const totalBet = ownerTransactions
        .filter((t) => t.type !== TransactionType.BET_PENDING)
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = ownerTransactions
        .filter((t) => t.type !== TransactionType.BET_PENDING)
        .reduce((sum, t) => sum + t.net_profit, 0);

      const roi = totalBet > 0 ? (netProfit / totalBet) * 100 : 0;

      const totalBets = wonBets + lostBets + cashoutBets;
      const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;

      const avgOdds = ownerTransactions
        .filter((t) => t.odds)
        .reduce((sum, t, _, arr) => sum + (t.odds || 0) / arr.length, 0);

      return {
        owner,
        wonBets,
        lostBets,
        cashoutBets,
        pendingBets,
        totalBet,
        netProfit,
        roi,
        winRate,
        avgOdds,
      };
    });
  }, [transactions]);

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
      [BetOwner.PROPIA]: "from-blue-500 to-blue-600",
      [BetOwner.PULPO]: "from-purple-500 to-purple-600",
      [BetOwner.TRADE]: "from-green-500 to-green-600",
    };
    return colors[owner];
  };

  const getOwnerIcon = (owner: BetOwner) => {
    const icons = {
      [BetOwner.PROPIA]: "👤",
      [BetOwner.PULPO]: "🐙",
      [BetOwner.TRADE]: "📊",
    };
    return icons[owner];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Comparación de Traders
        </h1>
        <p className="text-gray-600">
          Análisis de rendimiento por propietario
        </p>
      </div>

      {/* Trader Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {traderStats.map((stats) => (
          <div
            key={stats.owner}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Header con gradiente */}
            <div
              className={`bg-gradient-to-r ${getOwnerColor(
                stats.owner
              )} p-6 text-white`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getOwnerIcon(stats.owner)}</span>
                <h2 className="text-2xl font-bold">
                  {getOwnerLabel(stats.owner)}
                </h2>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white text-opacity-90 text-sm">
                    Beneficio Neto
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(stats.netProfit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white text-opacity-90 text-sm">ROI</p>
                  <p
                    className={`text-2xl font-bold ${
                      stats.roi >= 0 ? "text-green-100" : "text-red-100"
                    }`}
                  >
                    {stats.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 space-y-4">
              {/* Win Rate */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Win Rate</span>
                  <span className="font-medium text-gray-900">
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stats.winRate >= 50 ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Resultados */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-md p-3">
                  <p className="text-xs text-green-600 font-medium">Ganadas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.wonBets}
                  </p>
                </div>
                <div className="bg-red-50 rounded-md p-3">
                  <p className="text-xs text-red-600 font-medium">Perdidas</p>
                  <p className="text-2xl font-bold text-red-700">
                    {stats.lostBets}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-md p-3">
                  <p className="text-xs text-yellow-600 font-medium">Cashout</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {stats.cashoutBets}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-md p-3">
                  <p className="text-xs text-blue-600 font-medium">Pendientes</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.pendingBets}
                  </p>
                </div>
              </div>

              {/* Métricas adicionales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Apostado</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(stats.totalBet)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuota Promedio</span>
                  <span className="font-medium text-gray-900">
                    {stats.avgOdds > 0 ? stats.avgOdds.toFixed(2) : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Apuestas</span>
                  <span className="font-medium text-gray-900">
                    {stats.wonBets + stats.lostBets + stats.cashoutBets + stats.pendingBets}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla Comparativa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Tabla Comparativa
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trader
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  ROI
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Beneficio
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  G / P / C
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total Apostado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {traderStats.map((stats) => (
                <tr key={stats.owner} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getOwnerIcon(stats.owner)}</span>
                      <span className="font-medium text-gray-900">
                        {getOwnerLabel(stats.owner)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        stats.winRate >= 50
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stats.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-bold ${
                        stats.roi >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stats.roi.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-bold ${
                        stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(stats.netProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    <span className="text-green-600">{stats.wonBets}</span> /{" "}
                    <span className="text-red-600">{stats.lostBets}</span> /{" "}
                    <span className="text-yellow-600">{stats.cashoutBets}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(stats.totalBet)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Comparación */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Comparación Visual
        </h3>
        <div className="space-y-6">
          {/* ROI Comparison */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              ROI (Retorno sobre Inversión)
            </h4>
            <div className="space-y-3">
              {traderStats.map((stats) => {
                const maxROI = Math.max(
                  ...traderStats.map((s) => Math.abs(s.roi))
                );
                const percentage = maxROI > 0 ? (Math.abs(stats.roi) / maxROI) * 100 : 0;

                return (
                  <div key={stats.owner}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {getOwnerIcon(stats.owner)} {getOwnerLabel(stats.owner)}
                      </span>
                      <span
                        className={`font-bold ${
                          stats.roi >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stats.roi.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          stats.roi >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beneficio Neto Comparison */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Beneficio Neto
            </h4>
            <div className="space-y-3">
              {traderStats.map((stats) => {
                const maxProfit = Math.max(
                  ...traderStats.map((s) => Math.abs(s.netProfit))
                );
                const percentage = maxProfit > 0 ? (Math.abs(stats.netProfit) / maxProfit) * 100 : 0;

                return (
                  <div key={stats.owner}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {getOwnerIcon(stats.owner)} {getOwnerLabel(stats.owner)}
                      </span>
                      <span
                        className={`font-bold ${
                          stats.netProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(stats.netProfit)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          stats.netProfit >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🏆 Ranking de Traders
        </h3>
        <div className="space-y-4">
          {[...traderStats]
            .sort((a, b) => b.roi - a.roi)
            .map((stats, index) => (
              <div
                key={stats.owner}
                className="flex items-center gap-4 p-4 rounded-lg bg-gray-50"
              >
                <div className="text-3xl font-bold text-gray-400">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{getOwnerIcon(stats.owner)}</span>
                    <span className="font-semibold text-gray-900">
                      {getOwnerLabel(stats.owner)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {stats.wonBets}G / {stats.lostBets}P • Win Rate:{" "}
                    {stats.winRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      stats.roi >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.roi.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600">ROI</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

