import { useState, useMemo } from "react";
import { Transaction, FilterPeriod, TransactionType } from "../types";
import {
  formatCurrency,
  formatDate,
  getTransactionTypeLabel,
  getTransactionTypeColor,
} from "../lib/utils";
import { FilterBar } from "./FilterBar";
import { EditTransactionModal } from "./EditTransactionModal";

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: {
      type?: TransactionType;
      amount?: number;
      date?: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean }>;
}

type SortField = "date" | "amount" | "net_profit";
type SortDirection = "asc" | "desc";

export const TransactionHistory = ({
  transactions,
  onDelete,
  onUpdate,
}: TransactionHistoryProps) => {
  const [filters, setFilters] = useState<{
    period: FilterPeriod;
    type?: TransactionType;
    dateRange?: { start: string; end: string };
    searchQuery?: string;
  }>({ period: "month" });

  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by date range
    if (filters.dateRange) {
      const startTime = new Date(filters.dateRange.start).getTime();
      const endTime = new Date(filters.dateRange.end).getTime();
      filtered = filtered.filter((t) => {
        const txTime = new Date(t.date).getTime();
        return txTime >= startTime && txTime <= endTime;
      });
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.notes?.toLowerCase().includes(query));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case "date":
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case "amount":
          aVal = a.amount;
          bVal = b.amount;
          break;
        case "net_profit":
          aVal = a.net_profit;
          bVal = b.net_profit;
          break;
        default:
          return 0;
      }

      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [transactions, filters, sortField, sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      amount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
      netProfit: filteredTransactions.reduce((sum, t) => sum + t.net_profit, 0),
    };
  }, [filteredTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortDirection === "asc" ? <span>↑</span> : <span>↓</span>;
  };

  const canEditTransaction = (transaction: Transaction) => {
    return (
      transaction.type === TransactionType.BET_PENDING ||
      transaction.type === TransactionType.BET_WON ||
      transaction.type === TransactionType.BET_CASHOUT ||
      transaction.type === TransactionType.BET_LOST
    );
  };

  return (
    <div className="space-y-6">
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={onUpdate}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      <FilterBar onFilterChange={setFilters} />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Historial de Transacciones
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredTransactions.length} registros)
            </span>
          </h2>
        </div>

        {/* Table for larger screens */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("date")}
                >
                  Fecha <SortIcon field="date" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propietario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stake
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuota
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Apostado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Ganado
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("net_profit")}
                >
                  Beneficio <SortIcon field="net_profit" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                        transaction.type
                      )}`}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.owner ? (
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                          transaction.owner === "PROPIA"
                            ? "bg-purple-100 text-purple-700"
                            : transaction.owner === "PULPO"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {transaction.owner === "PROPIA"
                          ? "Propia"
                          : transaction.owner === "PULPO"
                          ? "Pulpo"
                          : "Trade"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.stake ? `${transaction.stake}%` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {transaction.odds ? transaction.odds.toFixed(2) : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                    {transaction.potential_profit
                      ? formatCurrency(transaction.potential_profit)
                      : "-"}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.net_profit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(transaction.net_profit)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {transaction.notes || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex gap-2 justify-center">
                      {canEditTransaction(transaction) && (
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-sm text-gray-900">
                  TOTALES
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(totals.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(
                    filteredTransactions
                      .filter(
                        (t) =>
                          t.type === TransactionType.BET_WON ||
                          t.type === TransactionType.BET_CASHOUT
                      )
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right ${
                    totals.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(totals.netProfit)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cards for mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(
                      transaction.type
                    )}`}
                  >
                    {getTransactionTypeLabel(transaction.type)}
                  </span>
                  {transaction.owner && (
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                        transaction.owner === "PROPIA"
                          ? "bg-purple-100 text-purple-700"
                          : transaction.owner === "PULPO"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {transaction.owner === "PROPIA"
                        ? "Propia"
                        : transaction.owner === "PULPO"
                        ? "Pulpo"
                        : "Trade"}
                    </span>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canEditTransaction(transaction) && (
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {transaction.stake && (
                  <div>
                    <span className="text-gray-500">Stake:</span>
                    <span className="ml-2 font-medium">
                      {transaction.stake}%
                    </span>
                  </div>
                )}
                {transaction.odds && (
                  <div>
                    <span className="text-gray-500">Cuota:</span>
                    <span className="ml-2 font-medium">
                      {transaction.odds.toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Monto Apostado:</span>
                  <span className="ml-2 font-medium">
                    {(() => {
                      if (
                        transaction.type === TransactionType.BET_LOST ||
                        transaction.type === TransactionType.BET_PENDING
                      ) {
                        return formatCurrency(transaction.amount);
                      } else {
                        const stake =
                          transaction.amount - transaction.net_profit;
                        return formatCurrency(stake);
                      }
                    })()}
                  </span>
                </div>
                {(transaction.type === TransactionType.BET_WON ||
                  transaction.type === TransactionType.BET_CASHOUT) && (
                  <div>
                    <span className="text-gray-500">Monto Ganado:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-gray-500">Beneficio:</span>
                  <span
                    className={`ml-2 font-medium ${
                      transaction.net_profit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(transaction.net_profit)}
                  </span>
                </div>
              </div>

              {transaction.notes && (
                <p className="text-sm text-gray-600 italic">
                  {transaction.notes}
                </p>
              )}
            </div>
          ))}

          {/* Mobile totals */}
          <div className="p-4 bg-gray-50 font-semibold">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total Monto:</span>
                <span>{formatCurrency(totals.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Beneficio:</span>
                <span
                  className={
                    totals.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {formatCurrency(totals.netProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No hay transacciones que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};
