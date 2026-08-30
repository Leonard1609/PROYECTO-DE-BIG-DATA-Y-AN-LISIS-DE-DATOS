import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatMoney } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function ProfitBarChart({
  labels,
  values,
  label,
}: {
  labels: string[];
  values: number[];
  label: string;
}) {
  return (
    <div className="h-72">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label,
              data: values,
              backgroundColor: labels.map((_, i) => (i === 0 ? '#3b82f6' : '#1d4ed8')),
              borderRadius: 8,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#e2e8f0',
              bodyColor: '#93c5fd',
              borderColor: '#1e293b',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => formatMoney(Number(ctx.parsed.y ?? 0)),
              },
            },
          },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
            y: {
              ticks: { color: '#94a3b8', callback: (value) => formatMoney(Number(value)) },
              grid: { color: 'rgba(148,163,184,0.12)' },
            },
          },
        }}
      />
    </div>
  );
}
