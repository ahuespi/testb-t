import { useMemo } from "react";
import { Transaction, BetOwner, TransactionType } from "../types";
import { formatCurrency } from "../lib/utils";

interface TraderStatsProps {
  transactions: Transaction[];
}

export const TraderStats = ({ transactions }: TraderStatsProps) => {
  const ownerStats = useMemo(() => {
    const owners = [BetOwner.PROPIA, BetOwner.PULPO, BetOwner.TRADE];

    return owners.map((owner) => {
      const ownerTransactions = transactions.filter(
        (t) => t.owner === owner && [
          TransactionType.BET_PENDING,
          TransactionType.BET_LOST,
          TransactionType.BET_WON,
          TransactionType.BET_CASHOUT,
        ].includes(t.type)
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

      const completedBets = ownerTransactions.filter(
        (t) => [TransactionType.BET_WON, TransactionType.BET_LOST, TransactionType.BET_CASHOUT].includes(t.type)
      );

      const totalBet = completedBets.reduce((sum, t) => {
        const stakeAmount = t.amount - t.net_profit;
        return sum + Math.abs(stakeAmount);
      }, 0);

      const netProfit = completedBets.reduce((sum, t) => sum + t.net_profit, 0);

      const roi = totalBet > 0 ? (netProfit / totalBet) * 100 : 0;

      const totalDecidedBets = wonBets + lostBets + cashoutBets;
      const winRate = totalDecidedBets > 0 ? (wonBets / totalDecidedBets) * 100 : 0;

      const avgOdds = ownerTransactions
        .filter((t) => t.odds)
        .reduce((sum, t) => sum + (t.odds || 0), 0) / (ownerTransactions.filter((t) => t.odds).length || 1);

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
      [BetOwner.TRADE]: "💼",
    };
    return icons[owner];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Estadísticas por Trader
        </h1>
        <p className="text-gray-600">
          Comparación de rendimiento entre traders
        </p>
      </div>

      {/* Stats Cards por Owner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ownerStats.map((stats) => (
          <div
            key={stats.owner}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            {/* Header con gradiente */}
            <div
              className={`bg-gradient-to-r ${getOwnerColor(stats.owner)} p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl mb-2">{getOwnerIcon(stats.owner)}</p>
                  <h2 className="text-2xl font-bold">
                    {getOwnerLabel(stats.owner)}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">ROI</p>
                  <p className="text-3xl font-bold">
                    {stats.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Body con estadísticas */}
            <div className="p-6 space-y-4">
              {/* Beneficio Neto */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">Beneficio Neto</p>
                <p
                  className={`text-3xl font-bold ${
                    stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>

              {/* Total Apostado */}
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500 mb-1">Total Apostado</p>
                <p className="text-xl font-semibold text-gray-800">
                  {formatCurrency(stats.totalBet)}
                </p>
              </div>

              {/* Resultados */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    ✅ Ganadas:
                  </span>
                  <span className="font-semibold text-green-600">
                    {stats.wonBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    ❌ Perdidas:
                  </span>
                  <span className="font-semibold text-red-600">
                    {stats.lostBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    💵 Cashout:
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {stats.cashoutBets}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    ⏳ Pendientes:
                  </span>
                  <span className="font-semibold text-blue-600">
                    {stats.pendingBets}
                  </span>
                </div>
              </div>

              {/* Win Rate */}
              <div className="bg-gray-50 rounded-md p-3 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Win Rate
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      stats.winRate >= 50 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stats.winRate >= 50 ? "bg-green-600" : "bg-red-600"
                    }`}
                    style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Cuota Promedio */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cuota Promedio:</span>
                <span className="font-semibold text-gray-800">
                  {stats.avgOdds.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla Comparativa */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Comparación de Traders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganadas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Perdidas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashout
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Apostado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio Neto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ownerStats.map((stats) => (
                <tr key={stats.owner} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {getOwnerIcon(stats.owner)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {getOwnerLabel(stats.owner)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {stats.wonBets}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {stats.lostBets}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {stats.cashoutBets}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`text-sm font-semibold ${
                        stats.winRate >= 50 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stats.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(stats.totalBet)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                      stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.netProfit >= 0 ? "+" : ""}
                    {formatCurrency(stats.netProfit)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                      stats.roi >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.roi >= 0 ? "+" : ""}
                    {stats.roi.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">TOTALES</td>
                <td className="px-6 py-4 text-center text-sm text-green-600">
                  {ownerStats.reduce((sum, s) => sum + s.wonBets, 0)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-red-600">
                  {ownerStats.reduce((sum, s) => sum + s.lostBets, 0)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-yellow-600">
                  {ownerStats.reduce((sum, s) => sum + s.cashoutBets, 0)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">
                  {(
                    (ownerStats.reduce((sum, s) => sum + s.wonBets, 0) /
                      (ownerStats.reduce((sum, s) => sum + s.wonBets + s.lostBets + s.cashoutBets, 0) || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  {formatCurrency(
                    ownerStats.reduce((sum, s) => sum + s.totalBet, 0)
                  )}
                </td>
                <td
                  className={`px-6 py-4 text-right text-sm ${
                    ownerStats.reduce((sum, s) => sum + s.netProfit, 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    ownerStats.reduce((sum, s) => sum + s.netProfit, 0)
                  )}
                </td>
                <td
                  className={`px-6 py-4 text-right text-sm ${
                    ((ownerStats.reduce((sum, s) => sum + s.netProfit, 0) /
                      ownerStats.reduce((sum, s) => sum + s.totalBet, 0)) *
                      100 || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    (ownerStats.reduce((sum, s) => sum + s.netProfit, 0) /
                      (ownerStats.reduce((sum, s) => sum + s.totalBet, 0) || 1)) *
                    100
                  ).toFixed(2)}
                  %
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {ownerStats.map((stats) => (
          <div
            key={stats.owner}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              className={`bg-gradient-to-r ${getOwnerColor(stats.owner)} p-4 text-white`}
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{getOwnerIcon(stats.owner)}</span>
                <div>
                  <h3 className="text-xl font-bold">
                    {getOwnerLabel(stats.owner)}
                  </h3>
                  <p className="text-sm opacity-90">
                    ROI: {stats.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Ganadas</p>
                  <p className="text-lg font-bold text-green-600">
                    {stats.wonBets}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Perdidas</p>
                  <p className="text-lg font-bold text-red-600">
                    {stats.lostBets}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cashout</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {stats.cashoutBets}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Win Rate</p>
                  <p
                    className={`text-lg font-bold ${
                      stats.winRate >= 50 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.winRate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Apostado:</span>
                  <span className="font-semibold">
                    {formatCurrency(stats.totalBet)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Beneficio Neto:</span>
                  <span
                    className={`font-bold ${
                      stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

