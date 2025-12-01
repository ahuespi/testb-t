import { useMemo, useEffect } from "react";
import { Transaction, TransactionType } from "../types";
import { formatCurrency } from "../lib/utils";
import { supabase } from "../lib/supabase";

interface MonthlySummaryProps {
  transactions: Transaction[];
}

interface MonthData {
  month: string;
  year: number;
  monthName: string;
  initialBalance: number;
  finalBalance: number;
  deposits: number;
  withdrawals: number;
  netProfit: number;
  totalBet: number;
  wonBets: number;
  lostBets: number;
  roi: number;
}

export const MonthlySummary = ({ transactions }: MonthlySummaryProps) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Calcular balance actual real (para el último mes)
  const currentBalance = useMemo(() => {
    // Filtrar transacciones históricas
    const realTransactions = transactions.filter(
      (t) => !t.notes?.toLowerCase().includes("históricos")
    );

    const deposits = realTransactions
      .filter((t) => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const withdrawals = realTransactions
      .filter((t) => t.type === TransactionType.WITHDRAWAL)
      .reduce((sum, t) => sum + t.amount, 0);

    // Ganancia neta de apuestas resueltas
    const resolvedNetProfit = realTransactions
      .filter(
        (t) =>
          t.type !== TransactionType.DEPOSIT &&
          t.type !== TransactionType.WITHDRAWAL &&
          t.type !== TransactionType.BET_PENDING
      )
      .reduce((sum, t) => sum + t.net_profit, 0);

    // Restar apuestas pendientes (dinero en riesgo)
    const pendingAmount = realTransactions
      .filter((t) => t.type === TransactionType.BET_PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    return deposits - withdrawals + resolvedNetProfit - pendingAmount;
  }, [transactions]);

  const monthlyData = useMemo(() => {
    // Filtrar transacciones históricas (las que tienen "históricos" en las notas)
    // Estas no deben afectar el resumen mensual
    const realTransactions = transactions.filter(
      (t) => !t.notes?.toLowerCase().includes("históricos")
    );

    // Agrupar transacciones por mes
    const monthsMap = new Map<string, Transaction[]>();

    realTransactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (!monthsMap.has(key)) {
        monthsMap.set(key, []);
      }
      monthsMap.get(key)!.push(t);
    });

    // Ordenar por fecha (más reciente primero)
    const sortedKeys = Array.from(monthsMap.keys()).sort((a, b) =>
      b.localeCompare(a)
    );

    // Calcular datos por mes
    const data: MonthData[] = [];
    let runningBalance = 0;

    // Procesar desde el más antiguo al más reciente para calcular balances
    for (let i = 0; i < sortedKeys.length; i++) {
      const key = sortedKeys[i];
      const [year, month] = key.split("-");
      const monthTransactions = monthsMap.get(key)!;

      const deposits = monthTransactions
        .filter((t) => t.type === TransactionType.DEPOSIT)
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawals = monthTransactions
        .filter((t) => t.type === TransactionType.WITHDRAWAL)
        .reduce((sum, t) => sum + t.amount, 0);

      // Ganancia neta de apuestas resueltas (ganadas/perdidas/cashout)
      const resolvedNetProfit = monthTransactions
        .filter(
          (t) =>
            t.type !== TransactionType.DEPOSIT &&
            t.type !== TransactionType.WITHDRAWAL &&
            t.type !== TransactionType.BET_PENDING
        )
        .reduce((sum, t) => sum + t.net_profit, 0);

      // Monto en apuestas pendientes (se resta porque es dinero en riesgo)
      const pendingAmount = monthTransactions
        .filter((t) => t.type === TransactionType.BET_PENDING)
        .reduce((sum, t) => sum + t.amount, 0);

      // Ganancia neta total = ganancia resuelta - apuestas pendientes
      const netProfit = resolvedNetProfit - pendingAmount;

      const totalBet = monthTransactions
        .filter((t) =>
          [
            TransactionType.BET_LOST,
            TransactionType.BET_WON,
            TransactionType.BET_CASHOUT,
          ].includes(t.type)
        )
        .reduce((sum, t) => {
          if (t.type === TransactionType.BET_LOST) {
            return sum + t.amount;
          }
          const stakeAmount = t.amount - t.net_profit;
          return sum + stakeAmount;
        }, 0);

      const wonBets = monthTransactions.filter(
        (t) =>
          t.type === TransactionType.BET_WON ||
          (t.type === TransactionType.BET_CASHOUT && t.net_profit > 0)
      ).length;

      const lostBets = monthTransactions.filter(
        (t) =>
          t.type === TransactionType.BET_LOST ||
          (t.type === TransactionType.BET_CASHOUT && t.net_profit < 0)
      ).length;

      const roi = totalBet > 0 ? (resolvedNetProfit / totalBet) * 100 : 0;

      const initialBalance = runningBalance;
      // Balance final = balance inicial + depósitos - retiros + ganancia neta (que ya incluye pendientes)
      const finalBalance = runningBalance + deposits - withdrawals + netProfit;
      
      // Actualizar runningBalance para el próximo mes
      runningBalance = finalBalance;

      const monthNames = [
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

      data.unshift({
        month: key,
        year: parseInt(year),
        monthName: monthNames[parseInt(month) - 1],
        initialBalance,
        finalBalance: i === 0 ? currentBalance : finalBalance, // El último mes usa el balance actual real
        deposits,
        withdrawals,
        netProfit,
        totalBet,
        wonBets,
        lostBets,
        roi,
      });
    }

    return data;
  }, [transactions, currentBalance]);

  // Guardar balance final de cada mes en la base de datos
  useEffect(() => {
    const saveFinalBalances = async () => {
      if (monthlyData.length === 0) return;

      for (const monthData of monthlyData) {
        // Extraer año y mes del string "YYYY-MM"
        const [yearStr, monthStr] = monthData.month.split("-");
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);
        
        // Solo guardar si el mes ya terminó (no el mes actual)
        const lastDayOfMonth = new Date(year, month, 0);
        const today = new Date();
        
        // Si el mes ya terminó, guardar su balance final
        if (lastDayOfMonth < today) {
          try {
            await supabase
              .from('monthly_config')
              .upsert(
                {
                  year: year,
                  month: month,
                  final_balance: monthData.finalBalance,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'year,month',
                }
              );
          } catch (err) {
            console.error(`Error saving final balance for ${year}-${month}:`, err);
          }
        } else if (year === currentYear && month === currentMonth) {
          // Para el mes actual, también guardar el balance (se actualizará constantemente)
          try {
            await supabase
              .from('monthly_config')
              .upsert(
                {
                  year: year,
                  month: month,
                  final_balance: monthData.finalBalance,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'year,month',
                }
              );
          } catch (err) {
            console.error(`Error saving final balance for current month:`, err);
          }
        }
      }
    };

    saveFinalBalances();
  }, [monthlyData, currentYear, currentMonth]);

  // Agrupar por año
  const dataByYear = useMemo(() => {
    const years = new Map<number, MonthData[]>();
    monthlyData.forEach((month) => {
      if (!years.has(month.year)) {
        years.set(month.year, []);
      }
      years.get(month.year)!.push(month);
    });
    return Array.from(years.entries()).sort((a, b) => b[0] - a[0]);
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Resumen Mensual
        </h1>
        <p className="text-gray-600">
          Evolución de balance, depósitos, retiros y ganancias por mes
        </p>
      </div>

      {dataByYear.map(([year, months]) => (
        <div key={year} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{year}</h2>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Inicial
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depósitos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retiros
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganancia Neta
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Final
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W/L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {months.map((month) => (
                  <tr key={month.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.monthName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {formatCurrency(month.initialBalance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      +{formatCurrency(month.deposits)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      +{formatCurrency(month.withdrawals)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        month.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {month.netProfit >= 0 ? "+" : ""}
                      {formatCurrency(month.netProfit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(month.finalBalance)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${
                        month.roi >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {month.roi.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {month.wonBets}/{month.lostBets}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    TOTAL {year}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatCurrency(months[0]?.initialBalance || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    +
                    {formatCurrency(
                      months.reduce((sum, m) => sum + m.deposits, 0)
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    -
                    {formatCurrency(
                      months.reduce((sum, m) => sum + m.withdrawals, 0)
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm text-right ${
                      months.reduce((sum, m) => sum + m.netProfit, 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {months.reduce((sum, m) => sum + m.netProfit, 0) >= 0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      months.reduce((sum, m) => sum + m.netProfit, 0)
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatCurrency(
                      months[months.length - 1]?.finalBalance || 0
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {months.reduce((sum, m) => sum + m.totalBet, 0) > 0
                      ? (
                          (months.reduce((sum, m) => sum + m.netProfit, 0) /
                            months.reduce((sum, m) => sum + m.totalBet, 0)) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700">
                    {months.reduce((sum, m) => sum + m.wonBets, 0)}/
                    {months.reduce((sum, m) => sum + m.lostBets, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {months.map((month) => (
              <div
                key={month.month}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {month.monthName}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Monto Inicial:</span>
                    <p className="font-medium">
                      {formatCurrency(month.initialBalance)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Monto Final:</span>
                    <p className="font-semibold">
                      {formatCurrency(month.finalBalance)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Depósitos:</span>
                    <p className="font-medium text-green-600">
                      +{formatCurrency(month.deposits)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Retiros:</span>
                    <p className="font-medium text-green-600">
                      +{formatCurrency(month.withdrawals)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ganancia Neta:</span>
                    <p
                      className={`font-medium ${
                        month.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {month.netProfit >= 0 ? "+" : ""}
                      {formatCurrency(month.netProfit)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">ROI:</span>
                    <p
                      className={`font-medium ${
                        month.roi >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {month.roi.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">W/L:</span>
                    <p className="font-medium">
                      {month.wonBets}/{month.lostBets}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {monthlyData.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No hay datos para mostrar</p>
          <p className="text-gray-400 text-sm mt-2">
            Comienza a registrar transacciones para ver el resumen mensual
          </p>
        </div>
      )}
    </div>
  );
};
