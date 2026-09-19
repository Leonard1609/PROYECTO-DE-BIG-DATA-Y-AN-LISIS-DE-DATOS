import React, { useMemo } from 'react';
import type { Dataset } from '../types/dataset';
import { buildPeriodSeries, financials, metricFromPeriod } from '../lib/analyze';
import { formatMoney } from '../lib/format';
import { ProfitBarChart } from '../modules/charts/ProfitBarChart';
import { FinancialDistributionChart } from '../modules/charts/FinancialDistributionChart';
import { ComparisonTrendChart } from '../modules/charts/ComparisonTrendChart';

export const DatasetModal: React.FC<{ dataset: Dataset | null; isOpen: boolean; onClose: () => void }> = ({
  dataset,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !dataset) return null;

  const fin = financials(dataset);
  const series = useMemo(() => buildPeriodSeries(dataset), [dataset]);
  const trendLabels = series.periods.map((p) => p.label);
  const trendValues = series.periods.map((p) => metricFromPeriod(p, 'ganancia'));
  const hasTrend = trendLabels.length >= 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ background: 'var(--nx-overlay)' }}
    >
      <div className="nx-modal-panel w-full max-w-6xl rounded-2xl shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--nx-border)' }}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-blue-500 font-semibold">Visualización del dataset</p>
            <h3 className="text-xl font-bold nx-title mt-1">{dataset.name}</h3>
            <p className="text-xs nx-muted mt-1">
              {dataset.filename} · {dataset.rows.length} registros
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 nx-muted hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid md:grid-cols-3 gap-3">
            {[
              ['Ingresos', fin.ingresos],
              ['Costos', fin.costos],
              ['Ganancia neta', fin.gananciaNeta],
            ].map(([label, val]) => (
              <div key={label} className="nx-card p-4">
                <p className="text-xs nx-muted">{label}</p>
                <p className="text-2xl font-bold nx-title mt-1">{formatMoney(val as number)}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="nx-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-blue-500 font-semibold text-xs uppercase tracking-wide">Distribución financiera</span>
              </div>
              <FinancialDistributionChart
                ingresos={fin.ingresos}
                costos={fin.costos}
                ganancia={fin.gananciaNeta}
              />
            </div>

            <div className="nx-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-violet-500 font-semibold text-xs uppercase tracking-wide">Evolución y rendimiento</span>
              </div>
              {hasTrend ? (
                <ComparisonTrendChart
                  labels={trendLabels}
                  metricLabel="Ganancia neta"
                  series={[{ label: dataset.name, color: '#8b5cf6', values: trendValues }]}
                />
              ) : (
                <p className="text-sm nx-muted py-10 text-center">Sin suficientes periodos para visualizar tendencia.</p>
              )}
            </div>
          </div>

          <div className="nx-card p-5">
            <h4 className="nx-title font-semibold">Resultado visual comparativo</h4>
            <p className="text-xs nx-muted mt-1">Ingresos, costos y ganancia neta del dataset</p>
            <div className="mt-4">
              <ProfitBarChart
                labels={['Ingresos', 'Costos', 'Ganancia']}
                values={[fin.ingresos, fin.costos, fin.gananciaNeta]}
                label="Resultados"
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-3 flex justify-end" style={{ borderColor: 'var(--nx-border)' }}>
          <button onClick={onClose} className="nx-btn-ghost text-xs">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
