import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { formatMoney } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BAR_COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

export function FinancialDistributionChart({
  ingresos,
  costos,
  ganancia,
}: {
  ingresos: number;
  costos: number;
  ganancia: number;
}) {
  const { theme } = useTheme();
  const ink = theme === 'light' ? '#334155' : '#94a3b8';
  const grid = theme === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.12)';
  const tipBg = theme === 'light' ? '#ffffff' : '#0f172a';
  const tipTitle = theme === 'light' ? '#0f172a' : '#e2e8f0';

  const labels = ['Ingresos', 'Costos', 'Ganancia neta'];
  const values = [ingresos, costos, ganancia];

  return (
    <div className="h-64">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Distribución financiera',
              data: values,
              backgroundColor: BAR_COLORS,
              borderRadius: 8,
              maxBarThickness: 72,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: tipBg,
              titleColor: tipTitle,
              bodyColor: BAR_COLORS[2],
              borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => formatMoney(Number(ctx.parsed.y ?? 0)),
              },
            },
          },
          scales: {
            x: { ticks: { color: ink, font: { weight: 500 } }, grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { color: ink, callback: (v) => formatMoney(Number(v)) },
              grid: { color: grid },
            },
          },
        }}
      />
    </div>
  );
}
