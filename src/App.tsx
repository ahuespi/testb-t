import { useState } from "react";
import { useTransactions } from "./hooks/useTransactions";
import { Dashboard } from "./components/Dashboard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionHistory } from "./components/TransactionHistory";
import { TradersStats } from "./components/TradersStats";
import { MonthlySummary } from "./components/MonthlySummary";
import { MonthlyGoals } from "./components/MonthlyGoals";
import { BalanceEvolution } from "./components/BalanceEvolution";
import { TransactionType } from "./types";

type View = "dashboard" | "add" | "history" | "traders" | "monthly" | "goals" | "evolution";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const {
    transactions,
    loading,
    error,
    bankAmount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // Get current year and month for goals
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  const handleAddTransaction = async (formData: any) => {
    const result = await addTransaction(formData);
    if (result.success) {
      setCurrentView("dashboard");
    }
    return result;
  };

  const handleDeleteTransaction = async (id: string) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta transacción?")
    ) {
      await deleteTransaction(id);
    }
  };

  const handleUpdateTransaction = async (
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
    return await updateTransaction(id, updates);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">
                Bet Tracker
              </h1>
              <p className="text-sm text-gray-500">
                Bank:{" "}
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 0,
                }).format(bankAmount)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop: Tabs horizontales */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "dashboard"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("add")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "add"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Nueva Transacción
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "history"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Historial
            </button>
            <button
              onClick={() => setCurrentView("traders")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "traders"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Traders
            </button>
            <button
              onClick={() => setCurrentView("monthly")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "monthly"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Resumen Mensual
            </button>
            <button
              onClick={() => setCurrentView("goals")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "goals"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Objetivos
            </button>
            <button
              onClick={() => setCurrentView("evolution")}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === "evolution"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Evolución
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation - Mobile: Bottom tab bar con iconos */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 safe-area-bottom">
        <div className="grid grid-cols-6 h-16">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "dashboard" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            <span className="text-xs font-medium">Inicio</span>
          </button>

          <button
            onClick={() => setCurrentView("add")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "add" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-xs font-medium">Nueva</span>
          </button>

          <button
            onClick={() => setCurrentView("history")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "history" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">Historial</span>
          </button>

          <button
            onClick={() => setCurrentView("traders")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "traders" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xs font-medium">Traders</span>
          </button>

          <button
            onClick={() => setCurrentView("monthly")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "monthly" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-medium">Mensual</span>
          </button>

          <button
            onClick={() => setCurrentView("goals")}
            className={`flex flex-col items-center justify-center space-y-1 ${
              currentView === "goals" ? "text-primary-600" : "text-gray-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium">Objetivos</span>
          </button>
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Main Content - con padding bottom para el tab bar mobile */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {currentView === "dashboard" && (
          <Dashboard
            transactions={transactions}
            onUpdate={handleUpdateTransaction}
          />
        )}
        {currentView === "add" && (
          <TransactionForm
            onSubmit={handleAddTransaction}
            bankAmount={bankAmount}
          />
        )}
        {currentView === "history" && (
          <TransactionHistory
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onUpdate={handleUpdateTransaction}
          />
        )}
        {currentView === "traders" && (
          <TradersStats transactions={transactions} />
        )}
        {currentView === "monthly" && (
          <MonthlySummary transactions={transactions} />
        )}
        {currentView === "goals" && (
          <MonthlyGoals year={currentYear} month={currentMonth} />
        )}
        {currentView === "evolution" && (
          <BalanceEvolution transactions={transactions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Bet Tracker © {new Date().getFullYear()} - Control de Apuestas
            Deportivas
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
