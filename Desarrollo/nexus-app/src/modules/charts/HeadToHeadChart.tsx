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
import { formatMoney, formatPct } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function HeadToHeadChart({
  mineName,
  compName,
  mineA,
  mineB,
  compA,
  compB,
  mineGrowth,
  compGrowth,
  metricLabel,
}: {
  mineName: string;
  compName: string;
  mineA: number;
  mineB: number;
  compA: number;
  compB: number;
  mineGrowth: number | null;
  compGrowth: number | null;
  metricLabel: string;
}) {
  const { theme } = useTheme();
  const ink = theme === 'light' ? '#334155' : '#94a3b8';
  const grid = theme === 'light' ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.12)';
  const tipBg = theme === 'light' ? '#ffffff' : '#0f172a';
  const tipTitle = theme === 'light' ? '#0f172a' : '#e2e8f0';

  const gapB = mineB - compB;
  const winner = gapB >= 0 ? mineName : compName;
  const gapAbs = Math.abs(gapB);

  return (
    <div className="space-y-4">
      <div className="h-72">
        <Bar
          data={{
            labels: ['Periodo A (inicio)', 'Periodo B (cierre)', 'Variación A→B (%)'],
            datasets: [
              {
                label: mineName,
                data: [mineA, mineB, mineGrowth ?? 0],
                backgroundColor: '#3b82f6',
                borderRadius: 6,
                maxBarThickness: 56,
              },
              {
                label: compName,
                data: [compA, compB, compGrowth ?? 0],
                backgroundColor: '#f59e0b',
                borderRadius: 6,
                maxBarThickness: 56,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: { color: ink, usePointStyle: true, pointStyle: 'circle', boxWidth: 10 },
              },
              tooltip: {
                backgroundColor: tipBg,
                titleColor: tipTitle,
                borderColor: theme === 'light' ? '#e2e8f0' : '#1e293b',
                borderWidth: 1,
                callbacks: {
                  label: (ctx) => {
                    const v = Number(ctx.parsed.y ?? 0);
                    const isPct = ctx.label === 'Variación A→B (%)';
                    return `${ctx.dataset.label}: ${isPct ? formatPct(Math.abs(v) / 100) : formatMoney(v)}`;
                  },
                  afterTitle: () => metricLabel,
                },
              },
            },
            scales: {
              x: { ticks: { color: ink, font: { size: 11 } }, grid: { display: false } },
              y: {
                beginAtZero: true,
                ticks: {
                  color: ink,
                  callback: (value) => {
                    const v = Number(value);
                    const maxVal = Math.max(mineA, mineB, compA, compB, 1);
                    if (maxVal < 100 && Math.abs(v) <= 100) {
                      return `${v}%`;
                    }
                    return formatMoney(v);
                  },
                },
                grid: { color: grid },
              },
            },
          }}
        />
      </div>

      <div
        className={`rounded-xl border p-4 text-center text-sm ${
          gapB >= 0
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
        }`}
      >
        {gapAbs === 0 ? (
          <span>Ambos datasets empatan en el cierre del periodo.</span>
        ) : (
          <span>
            <strong>{winner}</strong> cierra con ventaja de{' '}
            <strong>{formatMoney(gapAbs)}</strong> en {metricLabel.toLowerCase()}.
            {gapB >= 0
              ? ' Tu dataset mantiene o amplía la diferencia frente a la competencia.'
              : ' La competencia supera tu base en el periodo analizado.'}
          </span>
        )}
      </div>
    </div>
  );
}
