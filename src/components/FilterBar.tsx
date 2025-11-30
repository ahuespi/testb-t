import { useState } from "react";
import { FilterPeriod, TransactionType } from "../types";
import { getDateRangeForPeriod } from "../lib/utils";

interface FilterBarProps {
  onFilterChange: (filters: {
    period: FilterPeriod;
    type?: TransactionType;
    dateRange?: { start: string; end: string };
    searchQuery?: string;
  }) => void;
}

export const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [period, setPeriod] = useState<FilterPeriod>("month");
  const [type, setType] = useState<TransactionType | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handlePeriodChange = (newPeriod: FilterPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      const dateRange = getDateRangeForPeriod(
        newPeriod as "day" | "week" | "month" | "year"
      );
      onFilterChange({
        period: newPeriod,
        type: type || undefined,
        dateRange,
        searchQuery,
      });
    }
  };

  const handleTypeChange = (newType: TransactionType | "") => {
    setType(newType);
    const dateRange =
      period === "custom"
        ? { start: customStart, end: customEnd }
        : getDateRangeForPeriod(period as "day" | "week" | "month" | "year");

    onFilterChange({
      period,
      type: newType || undefined,
      dateRange: period !== "custom" ? dateRange : undefined,
      searchQuery,
    });
  };

  const handleCustomDateChange = () => {
    if (customStart && customEnd) {
      onFilterChange({
        period: "custom",
        type: type || undefined,
        dateRange: { start: customStart, end: customEnd },
        searchQuery,
      });
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const dateRange =
      period === "custom"
        ? { start: customStart, end: customEnd }
        : getDateRangeForPeriod(period as "day" | "week" | "month" | "year");

    onFilterChange({
      period,
      type: type || undefined,
      dateRange: period !== "custom" ? dateRange : undefined,
      searchQuery: query,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>

      {/* Period Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Período
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(["day", "week", "month", "year", "custom"] as FilterPeriod[]).map(
            (p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "day" && "Hoy"}
                {p === "week" && "Semana"}
                {p === "month" && "Mes"}
                {p === "year" && "Año"}
                {p === "custom" && "Personalizado"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Custom Date Range */}
      {period === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              onBlur={handleCustomDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              onBlur={handleCustomDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Transacción
        </label>
        <select
          value={type}
          onChange={(e) =>
            handleTypeChange(e.target.value as TransactionType | "")
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todos</option>
          <option value={TransactionType.DEPOSIT}>Depósito</option>
          <option value={TransactionType.WITHDRAWAL}>Retiro</option>
          <option value={TransactionType.BET_PENDING}>Apuesta Pendiente</option>
          <option value={TransactionType.BET_LOST}>Apuesta Perdida</option>
          <option value={TransactionType.BET_WON}>Apuesta Ganada</option>
          <option value={TransactionType.BET_CASHOUT}>Cashout</option>
        </select>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar en notas
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
