import { useState, useMemo } from 'react';
import { useMonthlyGoals } from '../hooks/useMonthlyGoals';
import { GoalType, GOAL_LABELS, MonthlyGoal } from '../types';
import { formatCurrency } from '../lib/utils';

interface MonthlyGoalsProps {
  year: number;
  month: number;
}

export const MonthlyGoals = ({ year, month }: MonthlyGoalsProps) => {
  const { goals, loading, error, toggleGoalCompletion, updateGoalNotes, fetchCompletedGoalsHistory } = useMonthlyGoals(year, month);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<MonthlyGoal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const completedCount = useMemo(() => {
    return goals.filter(g => g.completed).length;
  }, [goals]);

  const totalGoals = goals.length;

  const handleToggleCompletion = async (goalId: string, currentStatus: boolean) => {
    await toggleGoalCompletion(goalId, !currentStatus);
  };

  const handleLoadHistory = async () => {
    setLoadingHistory(true);
    const result = await fetchCompletedGoalsHistory(100);
    if (result.success && result.data) {
      setHistory(result.data);
      setShowHistory(true);
    }
    setLoadingHistory(false);
  };

  const handleUpdateNotes = async (goalId: string) => {
    const notes = editingNotes[goalId] || '';
    await updateGoalNotes(goalId, notes);
    setEditingNotes((prev) => {
      const newState = { ...prev };
      delete newState[goalId];
      return newState;
    });
  };

  const getGoalColor = (goalType: GoalType) => {
    switch (goalType) {
      case GoalType.PULPO:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case GoalType.TRADE:
        return 'bg-green-100 text-green-700 border-green-300';
      case GoalType.AUTO:
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case GoalType.GASTOS:
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Cargando objetivos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Month Goals */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              Objetivos Mensuales - {monthNames[month - 1]} {year}
            </h2>
            <div className="text-white text-sm font-medium">
              {completedCount} / {totalGoals} completados
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso del mes</span>
              <span>{Math.round((completedCount / totalGoals) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalGoals) * 100}%` }}
              />
            </div>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`border-2 rounded-lg p-4 transition-all flex flex-col ${
                  goal.completed
                    ? `${getGoalColor(goal.goal_type)} opacity-75`
                    : `${getGoalColor(goal.goal_type)}`
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => handleToggleCompletion(goal.id, goal.completed)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 cursor-pointer mt-1"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-base md:text-lg ${goal.completed ? 'line-through' : ''}`}>
                        {GOAL_LABELS[goal.goal_type]}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(goal.target_amount)}
                      </p>
                      {goal.completed && goal.completed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(goal.completed_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes Section */}
                  {editingNotes[goal.id] !== undefined ? (
                    <div className="mt-3">
                      <textarea
                        value={editingNotes[goal.id] || goal.notes || ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        rows={2}
                        placeholder="Agregar notas..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateNotes(goal.id)}
                          className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors flex-1"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() =>
                            setEditingNotes((prev) => {
                              const newState = { ...prev };
                              delete newState[goal.id];
                              return newState;
                            })
                          }
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors flex-1"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      {goal.notes ? (
                        <p className="text-xs text-gray-600 italic mb-1">{goal.notes}</p>
                      ) : null}
                      <button
                        onClick={() =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            [goal.id]: goal.notes || '',
                          }))
                        }
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        {goal.notes ? 'Editar notas' : 'Agregar notas'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Historial de Objetivos Completados</h2>
            <button
              onClick={() => {
                if (!showHistory) {
                  handleLoadHistory();
                } else {
                  setShowHistory(false);
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
              disabled={loadingHistory}
            >
              {loadingHistory ? 'Cargando...' : showHistory ? 'Ocultar' : 'Ver Historial'}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="p-6">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay objetivos completados en el historial.</p>
            ) : (
              <div className="space-y-4">
                {history.map((goal) => {
                  const goalType = goal.goal_type as GoalType;
                  return (
                    <div
                      key={goal.id}
                      className={`border-2 rounded-lg p-4 ${getGoalColor(goalType)} opacity-75`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg line-through">
                            {GOAL_LABELS[goalType]}
                          </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {monthNames[goal.month - 1]} {goal.year} - Objetivo: {formatCurrency(goal.target_amount)}
                        </p>
                        {goal.completed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completado el: {new Date(goal.completed_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        )}
                        {goal.notes && (
                          <p className="text-sm text-gray-600 italic mt-2">{goal.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

