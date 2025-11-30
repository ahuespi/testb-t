import { useState, useEffect } from "react";
import { Transaction, TransactionType, BetOwner } from "../types";
import { formatCurrency } from "../lib/utils";

interface EditTransactionModalProps {
  transaction: Transaction;
  onSave: (
    id: string,
    updates: {
      type?: TransactionType;
      amount?: number;
      date?: string;
      odds?: number;
      owner?: BetOwner;
      notes?: string;
    }
  ) => Promise<{ success: boolean }>;
  onClose: () => void;
}

export const EditTransactionModal = ({
  transaction,
  onSave,
  onClose,
}: EditTransactionModalProps) => {
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount);
  // Extract date part only (YYYY-MM-DD) to avoid timezone issues
  const getDatePart = (dateString: string) => {
    return dateString.split("T")[0];
  };
  const [date, setDate] = useState(getDatePart(transaction.date));
  const [odds, setOdds] = useState(transaction.odds || 0);
  const [owner, setOwner] = useState(transaction.owner || BetOwner.PROPIA);
  const [notes, setNotes] = useState(transaction.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Monto apostado (stake) - editable
  // Para pendientes/perdidas: amount es el stake
  // Para ganadas/cashout: stake = amount - net_profit
  const getOriginalStakeValue = () => {
    if (
      transaction.type === TransactionType.BET_PENDING ||
      transaction.type === TransactionType.BET_LOST
    ) {
      return transaction.amount;
    }
    return transaction.amount - transaction.net_profit;
  };
  
  const [stake, setStake] = useState(getOriginalStakeValue());

  const isPending = transaction.type === TransactionType.BET_PENDING;
  const isBettingTransaction = [
    TransactionType.BET_PENDING,
    TransactionType.BET_LOST,
    TransactionType.BET_WON,
    TransactionType.BET_CASHOUT,
  ].includes(transaction.type);

  const originalStakeValue = getOriginalStakeValue();
  
  // Calcular amount basado en el stake y tipo actual
  const calculatedAmount = 
    type === TransactionType.BET_PENDING || type === TransactionType.BET_LOST
      ? stake
      : type === TransactionType.BET_WON || type === TransactionType.BET_CASHOUT
      ? stake + transaction.net_profit // Para ganadas/cashout, mantener el net_profit original
      : amount;
  
  // Calcular net_profit basado en el tipo y stake
  const calculatedNetProfit = 
    type === TransactionType.BET_PENDING || type === TransactionType.BET_LOST
      ? -stake
      : type === TransactionType.BET_WON || type === TransactionType.BET_CASHOUT
      ? calculatedAmount - stake
      : transaction.net_profit;
  
  const profitChange = calculatedNetProfit - transaction.net_profit;

  // Calcular pago esperado si gana
  const expectedPayout = odds > 0 ? stake * odds : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updates: {
        type?: TransactionType;
        amount?: number;
        date?: string;
        odds?: number;
        owner?: BetOwner;
        notes?: string;
      } = {};

      if (type !== transaction.type) {
        updates.type = type;
      }

      // Si el stake cambió, recalcular amount y net_profit
      const currentStake = stake;
      const originalStakeValue = getOriginalStakeValue();
      
      if (currentStake !== originalStakeValue) {
        // El stake cambió, recalcular amount según el tipo
        if (type === TransactionType.BET_PENDING || type === TransactionType.BET_LOST) {
          // Para pendientes/perdidas: amount = stake
          updates.amount = currentStake;
        } else if (type === TransactionType.BET_WON || type === TransactionType.BET_CASHOUT) {
          // Para ganadas/cashout: mantener el net_profit y ajustar amount
          // nuevo amount = nuevo stake + net_profit original
          const originalNetProfit = transaction.net_profit;
          updates.amount = currentStake + originalNetProfit;
        }
      } else if (amount !== transaction.amount) {
        // Solo cambió el amount, no el stake
        updates.amount = amount;
      }

      const currentDatePart = getDatePart(transaction.date);
      if (date !== currentDatePart) {
        updates.date = date;
      }

      if (odds !== transaction.odds) {
        updates.odds = odds;
      }

      if (owner !== transaction.owner) {
        updates.owner = owner;
      }

      if (notes !== transaction.notes) {
        updates.notes = notes;
      }

      if (Object.keys(updates).length > 0) {
        const result = await onSave(transaction.id, updates);
        if (result.success) {
          onClose();
        }
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEdit =
    isPending ||
    transaction.type === TransactionType.BET_WON ||
    transaction.type === TransactionType.BET_CASHOUT ||
    transaction.type === TransactionType.BET_LOST;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isPending ? "Resolver Apuesta" : "Editar Transacción"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {!canEdit ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Solo puedes editar apuestas <strong>Pendientes</strong>,{" "}
                <strong>Ganadas</strong>, <strong>Perdidas</strong> o{" "}
                <strong>Cashout</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Cuota - Editable */}
              {isBettingTransaction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuota (Odds)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={odds || ""}
                    onChange={(e) => setOdds(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* Propietario - Editable (solo para apuestas) */}
              {isBettingTransaction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Propietario
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setOwner(BetOwner.PROPIA)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        owner === BetOwner.PROPIA
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Propia
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwner(BetOwner.PULPO)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        owner === BetOwner.PULPO
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Pulpo
                    </button>
                    <button
                      type="button"
                      onClick={() => setOwner(BetOwner.TRADE)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        owner === BetOwner.TRADE
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Trade
                    </button>
                  </div>
                </div>
              )}

              {/* Monto Apostado (Stake) - Editable */}
              {isBettingTransaction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto Apostado (Stake)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={stake || ""}
                    onChange={(e) => setStake(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    El monto que apostaste originalmente
                  </p>
                </div>
              )}

              {/* Info calculada */}
              {isBettingTransaction && (
                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                  {odds > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pago si gana:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(expectedPayout)}
                      </span>
                    </div>
                  )}
                  {(type === TransactionType.BET_WON || type === TransactionType.BET_CASHOUT) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monto final calculado:</span>
                      <span className="font-medium">
                        {formatCurrency(calculatedAmount)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Selector de Resultado (solo si es pendiente) */}
              {isPending && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cuál fue el resultado?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setType(TransactionType.BET_WON);
                        setAmount(expectedPayout);
                      }}
                      className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        type === TransactionType.BET_WON
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ✅ Ganó
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setType(TransactionType.BET_LOST);
                        setAmount(stake);
                      }}
                      className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        type === TransactionType.BET_LOST
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ❌ Perdió
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setType(TransactionType.BET_CASHOUT);
                        setAmount(stake * 0.8); // Ejemplo: 80% del stake
                      }}
                      className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        type === TransactionType.BET_CASHOUT
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      💵 Cashout
                    </button>
                  </div>
                </div>
              )}

              {/* Monto Final - Solo editable si ganó o cashout */}
              {(type === TransactionType.BET_WON ||
                type === TransactionType.BET_CASHOUT) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {type === TransactionType.BET_WON
                      ? "Monto Ganado (ARS)"
                      : "Monto Cashout (ARS)"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {type === TransactionType.BET_WON
                      ? "Ingresa el monto total recibido (incluyendo bonos)"
                      : "Ingresa el monto que te devolvieron en el cashout"}
                  </p>
                </div>
              )}

              {/* Info si perdió */}
              {type === TransactionType.BET_LOST && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-900">
                    Pérdida confirmada: {formatCurrency(stake)}
                  </p>
                </div>
              )}

              {/* Preview del resultado */}
              {type !== transaction.type && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Vista previa del cambio:
                  </p>
                  <div className="space-y-1 text-sm">
                    {isPending && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium">
                          Pendiente →{" "}
                          {type === TransactionType.BET_WON && "Ganada"}
                          {type === TransactionType.BET_LOST && "Perdida"}
                          {type === TransactionType.BET_CASHOUT && "Cashout"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beneficio original:</span>
                      <span
                        className={
                          transaction.net_profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {formatCurrency(transaction.net_profit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nuevo beneficio:</span>
                      <span
                        className={
                          calculatedNetProfit >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(calculatedNetProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t border-blue-300">
                      <span className="text-gray-700">Impacto:</span>
                      <span
                        className={
                          profitChange >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {profitChange >= 0 ? "+" : ""}
                        {formatCurrency(profitChange)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder={
                    isPending
                      ? "Ej: Ganó en el minuto 90"
                      : "Ej: Bono del 10% por promoción"
                  }
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : isPending
                    ? "Resolver"
                    : "Guardar"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
