import { useState } from "react";
import { TransactionType, TransactionFormData, BetOwner } from "../types";
import { calculateStakeAmount, formatCurrency } from "../lib/utils";

interface TransactionFormProps {
  onSubmit: (
    data: TransactionFormData
  ) => Promise<{ success: boolean; error?: string }>;
  bankAmount: number;
}

export const TransactionForm = ({
  onSubmit,
  bankAmount,
}: TransactionFormProps) => {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState<TransactionFormData>({
    date: today,
    type: TransactionType.BET_PENDING,
    owner: BetOwner.PROPIA,
    stake: 5,
    customStake: false,
    useFixedAmount: false,
    amount: calculateStakeAmount(5, bankAmount),
    odds: 2.0,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBettingTransaction = [
    TransactionType.BET_PENDING,
    TransactionType.BET_LOST,
    TransactionType.BET_WON,
    TransactionType.BET_CASHOUT,
  ].includes(formData.type);

  const handleStakeChange = (stake: number) => {
    if (!formData.useFixedAmount) {
      const calculatedAmount = calculateStakeAmount(stake, bankAmount);
      setFormData((prev) => ({
        ...prev,
        stake,
        amount: calculatedAmount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        stake,
      }));
    }
  };

  const handleAmountModeToggle = (useFixed: boolean) => {
    setFormData((prev) => ({
      ...prev,
      useFixedAmount: useFixed,
      amount:
        !useFixed && prev.stake
          ? calculateStakeAmount(prev.stake, bankAmount)
          : prev.amount,
    }));
  };

  const handleTypeChange = (type: TransactionType) => {
    const isBetting = [
      TransactionType.BET_PENDING,
      TransactionType.BET_LOST,
      TransactionType.BET_WON,
      TransactionType.BET_CASHOUT,
    ].includes(type);

    setFormData((prev) => ({
      ...prev,
      type,
      stake: isBetting ? prev.stake || 5 : undefined,
      odds: isBetting ? prev.odds || 2.0 : undefined,
      owner: isBetting ? prev.owner : undefined,
      amount:
        isBetting && !prev.useFixedAmount && prev.stake
          ? calculateStakeAmount(prev.stake, bankAmount)
          : 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        // Reset form
        setFormData({
          date: today,
          type: TransactionType.BET_PENDING,
          owner: BetOwner.PROPIA,
          stake: 5,
          customStake: false,
          useFixedAmount: false,
          amount: calculateStakeAmount(5, bankAmount),
          odds: 2.0,
          notes: "",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedStakeAmount = formData.stake
    ? calculateStakeAmount(formData.stake, bankAmount)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Nueva Transacción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Transacción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transacción
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: TransactionType.BET_PENDING,
                  stake: 5,
                  amount: calculateStakeAmount(5, bankAmount),
                  odds: 2.0,
                }))
              }
              className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isBettingTransaction
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🎯 Apuesta
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: TransactionType.DEPOSIT,
                  amount: 0,
                }))
              }
              className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.type === TransactionType.DEPOSIT
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              💰 Depósito
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type: TransactionType.WITHDRAWAL,
                  amount: 0,
                }))
              }
              className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                formData.type === TransactionType.WITHDRAWAL
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              💸 Retiro
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        {/* Owner - Solo para apuestas */}
        {isBettingTransaction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propietario
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, owner: BetOwner.PROPIA }))
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.owner === BetOwner.PROPIA
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Propia
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, owner: BetOwner.PULPO }))
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.owner === BetOwner.PULPO
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pulpo
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, owner: BetOwner.TRADE }))
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.owner === BetOwner.TRADE
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Trade
              </button>
            </div>
          </div>
        )}

        {/* Transaction Type - Solo para Depósitos y Retiros */}
        {!isBettingTransaction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Transacción
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.DEPOSIT)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.type === TransactionType.DEPOSIT
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Depósito
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange(TransactionType.WITHDRAWAL)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.type === TransactionType.WITHDRAWAL
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Retiro
              </button>
            </div>
          </div>
        )}

        {/* Monto para Depósitos/Retiros */}
        {!isBettingTransaction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              placeholder="Ingrese el monto"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === TransactionType.DEPOSIT
                ? "Monto que deseas depositar"
                : "Monto que deseas retirar"}
            </p>
          </div>
        )}

        {/* Cuota (Solo para apuestas) */}
        {isBettingTransaction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuota (Odds)
            </label>
            <input
              type="number"
              step="0.01"
              min="1.01"
              value={formData.odds || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  odds: Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              placeholder="Ej: 2.50"
            />
          </div>
        )}

        {/* Modo de ingreso: Stake % o Monto Fijo */}
        {isBettingTransaction && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Apuesta
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleAmountModeToggle(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  !formData.useFixedAmount
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Por Stake (%)
              </button>
              <button
                type="button"
                onClick={() => handleAmountModeToggle(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.useFixedAmount
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Monto Fijo
              </button>
            </div>
          </div>
        )}

        {/* Stake Selection con SELECT en vez de botones */}
        {isBettingTransaction && !formData.useFixedAmount && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stake ({formData.stake}% = {formatCurrency(calculatedStakeAmount)}
              )
            </label>
            <select
              value={formData.stake || 5}
              onChange={(e) => handleStakeChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {[
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19, 20,
              ].map((stake) => (
                <option key={stake} value={stake}>
                  {stake}% -{" "}
                  {formatCurrency(calculateStakeAmount(stake, bankAmount))}
                </option>
              ))}
              <option value={25}>
                25% - {formatCurrency(calculateStakeAmount(25, bankAmount))}
              </option>
              <option value={30}>
                30% - {formatCurrency(calculateStakeAmount(30, bankAmount))}
              </option>
              <option value={50}>
                50% - {formatCurrency(calculateStakeAmount(50, bankAmount))}
              </option>
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isBettingTransaction && !formData.useFixedAmount
              ? "Monto Apostado (calculado)"
              : "Monto (ARS)"}
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: Number(e.target.value),
              }))
            }
            disabled={isBettingTransaction && !formData.useFixedAmount}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
            required
            placeholder="Ingrese el monto"
          />
          {isBettingTransaction && !formData.useFixedAmount && (
            <p className="text-sm text-gray-500 mt-1">
              El monto se calcula automáticamente según el stake
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Detalles de la apuesta: partido, tipo de apuesta, etc."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Guardando..."
            : isBettingTransaction
            ? "Registrar Apuesta Pendiente"
            : formData.type === TransactionType.DEPOSIT
            ? "Registrar Depósito"
            : "Registrar Retiro"}
        </button>
      </form>
    </div>
  );
};
