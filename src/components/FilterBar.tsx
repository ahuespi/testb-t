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
  
  // Estado para selección de mes/año
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Generar años disponibles (últimos 5 años + año actual)
  const availableYears = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePeriodChange = (newPeriod: FilterPeriod) => {
    setPeriod(newPeriod);
    if (newPeriod === "month-select") {
      // Calcular fechas basado en mes y año seleccionados
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0);
      onFilterChange({
        period: newPeriod,
        type: type || undefined,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
        searchQuery,
      });
    } else if (newPeriod !== "custom") {
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

  const handleMonthYearChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    
    if (period === "month-select") {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      onFilterChange({
        period: "month-select",
        type: type || undefined,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
        searchQuery,
      });
    }
  };

  const handleTypeChange = (newType: TransactionType | "") => {
    setType(newType);
    let dateRange;
    if (period === "custom") {
      dateRange = { start: customStart, end: customEnd };
    } else if (period === "month-select") {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0);
      dateRange = {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else {
      dateRange = getDateRangeForPeriod(period as "day" | "week" | "month" | "year");
    }

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
    let dateRange;
    if (period === "custom") {
      dateRange = { start: customStart, end: customEnd };
    } else if (period === "month-select") {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0);
      dateRange = {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    } else {
      dateRange = getDateRangeForPeriod(period as "day" | "week" | "month" | "year");
    }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handlePeriodChange("day")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "day"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => handlePeriodChange("week")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "week"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => handlePeriodChange("month")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "month"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mes Actual
          </button>
          <button
            onClick={() => handlePeriodChange("month-select")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "month-select"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Mes Anterior
          </button>
          <button
            onClick={() => handlePeriodChange("year")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "year"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Año
          </button>
          <button
            onClick={() => handlePeriodChange("custom")}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              period === "custom"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Personalizado
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      {period === "month-select" && (
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthYearChange(selectedYear, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
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
              onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedMonth)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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
          <option value={TransactionType.BET_PENDING}>Pendiente</option>
          <option value={TransactionType.BET_LOST}>Perdida</option>
          <option value={TransactionType.BET_WON}>Ganada</option>
          <option value={TransactionType.BET_CASHOUT}>Cashout</option>
        </select>
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar en notas
        </label>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
