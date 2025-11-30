import { MetricsSummary } from "../types";
import { formatCurrency } from "../lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral";
}

const MetricCard = ({
  title,
  value,
  subtitle,
  trend = "neutral",
}: MetricCardProps) => {
  const trendColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${trendColors[trend]}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

interface DashboardMetricsProps {
  metrics: MetricsSummary;
  initialMonthBalance?: number;
}

export const DashboardMetrics = ({ metrics, initialMonthBalance }: DashboardMetricsProps) => {
  // Determinar el trend del balance actual comparado con el inicio del mes
  const balanceTrend = initialMonthBalance !== undefined
    ? metrics.currentBalance >= initialMonthBalance
      ? "positive"
      : "negative"
    : metrics.currentBalance >= 0
    ? "positive"
    : "negative";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title="Balance Actual"
        value={formatCurrency(metrics.currentBalance)}
        trend={balanceTrend}
        subtitle={
          initialMonthBalance !== undefined
            ? `Inicio del mes: ${formatCurrency(initialMonthBalance)}`
            : undefined
        }
      />

      <MetricCard
        title="ROI del Período"
        value={`${metrics.monthlyROI.toFixed(2)}%`}
        trend={metrics.monthlyROI >= 0 ? "positive" : "negative"}
      />

      <MetricCard
        title="Total Apostado"
        value={formatCurrency(metrics.totalBet)}
        trend="neutral"
      />

      <MetricCard
        title="Beneficio Neto"
        value={formatCurrency(metrics.netProfit)}
        trend={metrics.netProfit >= 0 ? "positive" : "negative"}
      />

      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        subtitle={`${metrics.wonBets}G / ${metrics.lostBets}P / ${metrics.pendingBets}Pend`}
        trend={metrics.winRate >= 50 ? "positive" : "negative"}
      />

      <MetricCard
        title="Total de Apuestas"
        value={metrics.wonBets + metrics.lostBets + metrics.pendingBets}
        subtitle={`${metrics.wonBets} ganadas, ${metrics.pendingBets} pendientes`}
        trend="neutral"
      />
    </div>
  );
};
