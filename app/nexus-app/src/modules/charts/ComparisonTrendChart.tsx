import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { formatMoney } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export interface TrendSeries {
  label: string;
  color: string;
  values: number[];
}

export function ComparisonTrendChart({
  labels,
  series,
  metricLabel,
}: {
  labels: string[];
  series: TrendSeries[];
  metricLabel: string;
}) {
  const { theme } = useTheme();
  const ink = theme === 'light' ? '#475569' : '#94a3b8';
  const grid = theme === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.12)';
  const tipBg = theme === 'light' ? '#ffffff' : '#0f172a';
  const tipTitle = theme === 'light' ? '#0f172a' : '#e2e8f0';
  const tipBody = theme === 'light' ? '#334155' : '#cbd5e1';

  return (
    <div className="h-72">
      <Line
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.values,
            borderColor: s.color,
            backgroundColor: `${s.color}22`,
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: s.color,
            borderWidth: 2.5,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                color: ink,
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            tooltip: {
              backgroundColor: tipBg,
              titleColor: tipTitle,
              bodyColor: tipBody,
              borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${formatMoney(Number(ctx.parsed.y ?? 0))}`,
                afterTitle: () => metricLabel,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Periodo',
                color: ink,
                font: { size: 11 },
              },
              ticks: { color: ink, maxRotation: 0 },
              grid: { color: grid },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: metricLabel,
                color: ink,
                font: { size: 11 },
              },
              ticks: {
                color: ink,
                callback: (value) => formatMoney(Number(value)),
              },
              grid: { color: grid },
            },
          },
        }}
      />
    </div>
  );
}
