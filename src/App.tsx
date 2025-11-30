import { useState } from "react";
import { useTransactions } from "./hooks/useTransactions";
import { Dashboard } from "./components/Dashboard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionHistory } from "./components/TransactionHistory";
import { TradersStats } from "./components/TradersStats";
import { TransactionType } from "./types";

type View = "dashboard" | "add" | "history" | "traders";

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

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
          </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <Dashboard transactions={transactions} />
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
