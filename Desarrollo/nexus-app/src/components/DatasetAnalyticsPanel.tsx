import React, { useMemo } from 'react';
import { BarChart3, LineChart, Search, Star, Trash2, Save } from 'lucide-react';
import type { Dataset } from '../types/dataset';
import { buildPeriodSeries, financials, metricFromPeriod } from '../lib/analyze';
import { rubroLabel } from '../lib/catalog';
import { formatMoney, formatPct } from '../lib/format';
import { csvKindLabel } from '../lib/inspectCsv';
import { FinancialDistributionChart } from '../modules/charts/FinancialDistributionChart';
import { ComparisonTrendChart } from '../modules/charts/ComparisonTrendChart';

interface Props {
  dataset: Dataset;
  mode?: 'preview' | 'saved';
  onMarkMine?: () => void;
  onRemove?: () => void;
  onOpenFull?: () => void;
  onSave?: () => void;
  saving?: boolean;
}

const KPI_STYLES = [
  {
    key: 'ingresos',
    label: 'Ingresos estimados',
    hint: 'Monto total de ventas',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'costos',
    label: 'Costos operativos',
    hint: 'Gastos calculados',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
    accent: 'text-rose-600 dark:text-rose-400',
  },
  {
    key: 'ganancia',
    label: 'Ganancia neta',
    hint: 'Utilidad real estimada',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'margen',
    label: 'Margen comercial',
    hint: 'Rentabilidad sobre ventas',
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/10',
    accent: 'text-violet-600 dark:text-violet-400',
  },
] as const;

export const DatasetAnalyticsPanel: React.FC<Props> = ({
  dataset,
  mode = 'saved',
  onMarkMine,
  onRemove,
  onOpenFull,
  onSave,
  saving,
}) => {
  const isPreview = mode === 'preview';
  const money = useMemo(() => financials(dataset), [dataset]);
  const series = useMemo(() => buildPeriodSeries(dataset), [dataset]);

  const trendLabels = series.periods.map((p) => p.label);
  const trendValues = series.periods.map((p) => metricFromPeriod(p, 'ganancia'));
  const hasTrend = trendLabels.length >= 2;

  const kpiValues: Record<string, string> = {
    ingresos: money.basis === 'sin_dinero' ? '—' : formatMoney(money.ingresos),
    costos: money.basis === 'sin_dinero' || money.basis === 'solo_ingresos' ? '—' : formatMoney(money.costos),
    ganancia: money.basis === 'sin_dinero' ? '—' : formatMoney(money.gananciaNeta),
    margen: money.basis === 'sin_dinero' ? '—' : formatPct(money.margen),
  };

  return (
    <div className="nx-card overflow-hidden">
      <div className="p-6 border-b flex flex-wrap items-start justify-between gap-4" style={{ borderColor: 'var(--nx-border)' }}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold nx-title truncate">{dataset.name}</h2>
            {isPreview && (
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Vista previa
              </span>
            )}
            {!isPreview && dataset.isMine && (
              <span className="text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                Mi base
              </span>
            )}
          </div>
          <p className="text-xs nx-muted mt-2">
            Rubro: {rubroLabel(dataset.rubro)} · Metodología: {dataset.metodologia}
          </p>
          <p className="text-xs nx-muted mt-1">
            {csvKindLabel(dataset)} · {dataset.rows.length.toLocaleString('es-AR')} filas · {dataset.filename}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPreview && onSave && (
            <button type="button" disabled={saving} onClick={onSave} className="nx-btn text-xs flex items-center gap-1.5">
              <Save size={14} /> {saving ? 'Guardando…' : 'Guardar dataset'}
            </button>
          )}
          {!isPreview && !dataset.isMine && onMarkMine && (
            <button type="button" onClick={onMarkMine} className="nx-btn-ghost text-xs flex items-center gap-1.5">
              <Star size={14} /> Marcar como base
            </button>
          )}
          {onOpenFull && (
            <button type="button" onClick={onOpenFull} className="nx-btn-ghost text-xs flex items-center gap-1.5">
              <Search size={14} /> Abrir visor completo
            </button>
          )}
          {onRemove && (
            <button type="button" onClick={onRemove} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {KPI_STYLES.map((kpi) => (
            <div key={kpi.key} className={`rounded-xl border p-4 ${kpi.border} ${kpi.bg}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${kpi.accent}`}>{kpi.label}</p>
              <p className="text-2xl font-extrabold nx-title mt-2 tabular-nums">{kpiValues[kpi.key]}</p>
              <p className="text-[11px] nx-muted mt-1">{kpi.hint}</p>
            </div>
          ))}
        </div>

        {money.basis === 'sin_dinero' && (
          <div className="nx-info-box text-sm nx-body">
            No se detectaron columnas de dinero en este archivo. Elegí una columna como{' '}
            <strong>price</strong>, <strong>amount</strong> o <strong>payment_value</strong> en la configuración de abajo.
            Archivos solo de clientes (IDs, ciudad, CP) no sirven para comparar ganancias — subí el CSV de ventas/pedidos.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="nx-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-blue-500" />
              <h3 className="font-semibold nx-title text-sm">Distribución financiera del archivo</h3>
            </div>
            {money.basis !== 'sin_dinero' ? (
              <FinancialDistributionChart
                ingresos={money.ingresos}
                costos={money.costos}
                ganancia={money.gananciaNeta}
              />
            ) : (
              <p className="text-sm nx-muted py-10 text-center">Seleccioná la columna de ingresos para ver el gráfico.</p>
            )}
          </div>

          <div className="nx-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <LineChart size={18} className="text-violet-500" />
              <h3 className="font-semibold nx-title text-sm">Evolución de ganancia por periodo</h3>
            </div>
            {hasTrend && money.basis !== 'sin_dinero' ? (
              <ComparisonTrendChart
                labels={trendLabels}
                metricLabel="Ganancia neta"
                series={[{ label: dataset.name, color: '#8b5cf6', values: trendValues }]}
              />
            ) : (
              <p className="text-sm nx-muted py-10 text-center">No hay suficiente recorrido temporal para mostrar el gráfico.</p>
            )}
          </div>
        </div>

        {hasTrend && money.basis !== 'sin_dinero' && (
          <div className="nx-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <LineChart size={18} className="text-emerald-500" />
              <h3 className="font-semibold nx-title text-sm">Evolución de ganancia por periodo</h3>
            </div>
            <p className="text-xs nx-muted mb-4">
              {series.hasDates ? 'Agrupado por fecha/año del CSV.' : 'Primera mitad vs segunda mitad de filas.'}
            </p>
            <ComparisonTrendChart
              labels={trendLabels}
              metricLabel="Ganancia neta"
              series={[{ label: dataset.name, color: '#22c55e', values: trendValues }]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
