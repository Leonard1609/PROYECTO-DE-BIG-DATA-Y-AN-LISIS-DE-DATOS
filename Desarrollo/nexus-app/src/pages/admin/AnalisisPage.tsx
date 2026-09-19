import React, { useEffect, useMemo, useState } from 'react';
import { useDatasets } from '../../context/DatasetContext';
import {
  availableYears,
  buildPeriodSeries,
  financials,
  growthPct,
  metricFromPeriod,
  slicePeriodRange,
} from '../../lib/analyze';
import { formatMoney, formatPct } from '../../lib/format';
import { ComparisonTrendChart } from '../../modules/charts/ComparisonTrendChart';
import { FinancialDistributionChart } from '../../modules/charts/FinancialDistributionChart';
import { HeadToHeadChart } from '../../modules/charts/HeadToHeadChart';
import { Brain, TrendingDown, TrendingUp, FileDown, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateAIInsight } from '../../lib/aiInsight';
import { REPORT_INSIGHT_KEY } from '../../lib/buildComparisonReport';

export const AnalisisPage: React.FC = () => {
  const { datasets } = useDatasets();
  const navigate = useNavigate();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const mine = datasets.find((d) => d.isMine) ?? datasets[0];
  const competitors = datasets.filter((d) => d.id !== mine?.id);
  const [competitorId, setCompetitorId] = useState(competitors[0]?.id ?? '');
  const [metric, setMetric] = useState<'ganancia' | 'ingresos' | 'costos'>('ganancia');
  const competitor = competitors.find((d) => d.id === competitorId) ?? competitors[0];

  useEffect(() => {
    if (competitors.length && !competitors.some((c) => c.id === competitorId)) {
      setCompetitorId(competitors[0].id);
    }
  }, [competitors, competitorId]);

  const mineSeries = useMemo(() => (mine ? buildPeriodSeries(mine) : null), [mine]);
  const compSeries = useMemo(() => (competitor ? buildPeriodSeries(competitor) : null), [competitor]);
  const mineFin = useMemo(() => (mine ? financials(mine) : null), [mine]);
  const compFin = useMemo(() => (competitor ? financials(competitor) : null), [competitor]);

  const yearOptions = useMemo(
    () => (mine && competitor ? availableYears([mine, competitor]) : []),
    [mine, competitor],
  );

  const [yearA, setYearA] = useState<number | null>(null);
  const [yearB, setYearB] = useState<number | null>(null);

  useEffect(() => {
    if (yearOptions.length === 0) {
      setYearA(1);
      setYearB(2);
      return;
    }
    setYearA((prev) => (prev != null && yearOptions.includes(prev) ? prev : yearOptions[0]));
    setYearB((prev) =>
      prev != null && yearOptions.includes(prev) ? prev : yearOptions[yearOptions.length - 1],
    );
  }, [yearOptions]);

  const mineRange = useMemo(() => {
    if (!mineSeries || yearA == null || yearB == null) return [];
    return slicePeriodRange(mineSeries, yearA, yearB);
  }, [mineSeries, yearA, yearB]);

  const compRange = useMemo(() => {
    if (!compSeries || yearA == null || yearB == null) return [];
    return slicePeriodRange(compSeries, yearA, yearB);
  }, [compSeries, yearA, yearB]);

  const chartLabels = useMemo(() => {
    const labels = new Set<string>();
    for (const p of mineRange) labels.add(p.label);
    for (const p of compRange) labels.add(p.label);
    if (labels.size === 0) return ['Periodo A', 'Periodo B'];
    return [...labels].sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [mineRange, compRange]);

  const metricLabel = metric === 'ganancia' ? 'Ganancia neta' : metric === 'ingresos' ? 'Ingresos' : 'Costos';

  const valueAt = (range: typeof mineRange, label: string) => {
    const hit = range.find((p) => p.label === label);
    return hit ? metricFromPeriod(hit, metric) : null;
  };

  const mineTrend = chartLabels.map((l) => valueAt(mineRange, l) ?? 0);
  const compTrend = chartLabels.map((l) => valueAt(compRange, l) ?? 0);

  const mineStart = mineRange[0] ? metricFromPeriod(mineRange[0], metric) : 0;
  const mineEnd = mineRange.at(-1) ? metricFromPeriod(mineRange.at(-1)!, metric) : 0;
  const compStart = compRange[0] ? metricFromPeriod(compRange[0], metric) : 0;
  const compEnd = compRange.at(-1) ? metricFromPeriod(compRange.at(-1)!, metric) : 0;

  const mineGrowth = growthPct(mineStart, mineEnd);
  const compGrowth = growthPct(compStart, compEnd);
  const diffEnd = mineEnd - compEnd;

  const periodNote =
    mineSeries?.hasDates && compSeries?.hasDates
      ? 'Series por fecha/año en el CSV.'
      : 'Sin fecha: primera mitad vs segunda mitad de filas.';

  const noMoney =
    mineFin?.basis === 'sin_dinero' ||
    compFin?.basis === 'sin_dinero' ||
    (mineEnd === 0 && compEnd === 0 && mineStart === 0 && compStart === 0);

  const sameDataset = mine?.id === competitor?.id;

  const insight =
    !mine || !competitor
      ? 'Seleccioná dos datasets distintos para iniciar el análisis.'
      : sameDataset
        ? 'Elegí un dataset de competencia diferente al tuyo.'
        : noMoney
          ? 'Estos archivos no tienen columnas de dinero (price, amount, payment_value). Subí CSVs de ventas/pedidos, no solo de clientes.'
          : diffEnd > 0
            ? `Mi empresa cierra ${chartLabels.at(-1) ?? 'B'} con ventaja de ${formatMoney(diffEnd)} en ${metricLabel.toLowerCase()}. Crecimiento A→B: ${mineGrowth != null ? formatPct(Math.abs(mineGrowth) / 100) : '—'}.`
            : diffEnd < 0
              ? `${competitor.name} supera en ${formatMoney(Math.abs(diffEnd))} al cierre. Conviene analizar qué variables explican esa brecha.`
              : `Ambas empresas terminan el periodo con el mismo ${metricLabel.toLowerCase()}.`;

  if (!datasets.length) {
    return (
      <div className="nx-card p-8">
        <h1 className="nx-title text-2xl font-bold">Análisis</h1>
        <p className="nx-subtitle mt-2">Subí datasets para comenzar.</p>
      </div>
    );
  }

  const canCompare =
    mine &&
    competitor &&
    !sameDataset &&
    mineSeries &&
    compSeries &&
    yearA != null &&
    yearB != null;

  return (
    <div className="space-y-7 max-w-6xl pb-10">
      <div>
        <p className="text-xs text-blue-500 font-semibold tracking-widest uppercase">Inteligencia de negocio</p>
        <h1 className="font-display nx-title text-4xl font-extrabold mt-1">Análisis y comparación</h1>
        <p className="nx-subtitle mt-2">
          Gráficos individuales de cada empresa, comparativa central y conclusiones.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="nx-card p-5 border-blue-500/30">
          <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Mi empresa</p>
          <h2 className="nx-title text-lg font-semibold mt-2 truncate">{mine?.name ?? 'Sin dataset'}</h2>
          <p className="text-xs nx-muted mt-1">{mine?.filename ?? '—'}</p>
        </div>
        <div className="nx-card p-5 border-amber-500/30">
          <p className="text-xs text-amber-500 uppercase tracking-wide font-semibold">Competencia</p>
          {competitors.length > 0 ? (
            <select
              className="nx-input !mt-2"
              value={competitor?.id ?? ''}
              onChange={(e) => {
                setCompetitorId(e.target.value);
                setAiInsight(null);
              }}
            >
              {competitors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.filename}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm nx-muted mt-2">Subí otro dataset para comparar.</p>
          )}
        </div>
      </div>

      {sameDataset && (
        <div className="nx-info-box flex items-start gap-2 text-sm nx-body">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          Estás comparando el mismo dataset consigo mismo. Elegí otro archivo en Competencia.
        </div>
      )}

      {noMoney && !sameDataset && mine && competitor && (
        <div className="nx-info-box flex items-start gap-2 text-sm nx-body">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          Sin datos financieros detectados. Usá CSVs con columnas <strong>price</strong>, <strong>amount</strong> o{' '}
          <strong>payment_value</strong> (ej. order_items, no customers).
        </div>
      )}

      {canCompare ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="nx-title text-xl font-semibold">Evolución por empresa</h2>
              <p className="text-xs nx-muted mt-1">{periodNote}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="nx-input !w-auto !mt-0"
                value={metric}
                onChange={(e) => {
                  setMetric(e.target.value as typeof metric);
                  setAiInsight(null);
                }}
              >
                <option value="ganancia">Ganancia neta</option>
                <option value="ingresos">Ingresos</option>
                <option value="costos">Costos</option>
              </select>
              {yearOptions.length > 0 && yearOptions[0] > 10 && (
                <>
                  <select className="nx-input !w-auto !mt-0" value={yearA} onChange={(e) => setYearA(Number(e.target.value))}>
                    {yearOptions.map((y) => (
                      <option key={`a-${y}`} value={y}>
                        Año A: {y}
                      </option>
                    ))}
                  </select>
                  <select className="nx-input !w-auto !mt-0" value={yearB} onChange={(e) => setYearB(Number(e.target.value))}>
                    {yearOptions.map((y) => (
                      <option key={`b-${y}`} value={y}>
                        Año B: {y}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Gráficos individuales — uno por empresa */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="nx-card p-5 border-blue-500/25">
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-1">Mi empresa</p>
              <h3 className="nx-title font-semibold truncate mb-4">{mine.name}</h3>
              <ComparisonTrendChart
                labels={chartLabels}
                metricLabel={metricLabel}
                series={[{ label: mine.name, color: '#3b82f6', values: mineTrend }]}
              />
            </div>
            <div className="nx-card p-5 border-amber-500/25">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wide mb-1">Competencia</p>
              <h3 className="nx-title font-semibold truncate mb-4">{competitor.name}</h3>
              <ComparisonTrendChart
                labels={chartLabels}
                metricLabel={metricLabel}
                series={[{ label: competitor.name, color: '#f59e0b', values: compTrend }]}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="nx-card p-5 border-blue-500/25">
              <p className="text-xs text-blue-500 font-bold uppercase tracking-wide mb-1">Mi empresa — distribución</p>
              <h3 className="nx-title font-semibold truncate mb-4">{mine.name}</h3>
              {mineFin && mineFin.basis !== 'sin_dinero' ? (
                <FinancialDistributionChart
                  ingresos={mineFin.ingresos}
                  costos={mineFin.costos}
                  ganancia={mineFin.gananciaNeta}
                />
              ) : (
                <p className="text-sm nx-muted py-10 text-center">Sin datos financieros.</p>
              )}
            </div>
            <div className="nx-card p-5 border-amber-500/25">
              <p className="text-xs text-amber-500 font-bold uppercase tracking-wide mb-1">Competencia — distribución</p>
              <h3 className="nx-title font-semibold truncate mb-4">{competitor.name}</h3>
              {compFin && compFin.basis !== 'sin_dinero' ? (
                <FinancialDistributionChart
                  ingresos={compFin.ingresos}
                  costos={compFin.costos}
                  ganancia={compFin.gananciaNeta}
                />
              ) : (
                <p className="text-sm nx-muted py-10 text-center">Sin datos financieros.</p>
              )}
            </div>
          </div>

          {/* Resumen inicio vs cierre — debajo de cada gráfico conceptualmente */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="nx-card p-5 border-blue-500/20">
              <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Mi empresa — A vs B</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] nx-muted uppercase">Periodo A</p>
                  <p className="nx-title text-xl font-bold mt-1">{formatMoney(mineStart)}</p>
                </div>
                <div>
                  <p className="text-[10px] nx-muted uppercase">Periodo B</p>
                  <p className="nx-title text-xl font-bold mt-1">{formatMoney(mineEnd)}</p>
                </div>
              </div>
              {mineGrowth != null && (
                <p className="text-xs mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  {mineGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  A→B: {mineGrowth >= 0 ? '+' : ''}
                  {formatPct(Math.abs(mineGrowth) / 100)}
                </p>
              )}
            </div>
            <div className="nx-card p-5 border-amber-500/20">
              <p className="text-xs text-amber-500 uppercase tracking-wide font-semibold">Competencia — A vs B</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] nx-muted uppercase">Periodo A</p>
                  <p className="nx-title text-xl font-bold mt-1">{formatMoney(compStart)}</p>
                </div>
                <div>
                  <p className="text-[10px] nx-muted uppercase">Periodo B</p>
                  <p className="nx-title text-xl font-bold mt-1">{formatMoney(compEnd)}</p>
                </div>
              </div>
              {compGrowth != null && (
                <p className="text-xs mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  {compGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  A→B: {compGrowth >= 0 ? '+' : ''}
                  {formatPct(Math.abs(compGrowth) / 100)}
                </p>
              )}
            </div>
          </div>

          {/* Centro abajo — ¿por qué uno es mejor? */}
          <div className="nx-card p-6 border-violet-500/30">
            <div className="text-center mb-5">
              <p className="text-xs text-violet-500 uppercase tracking-widest font-bold">Comparativa central</p>
              <h2 className="nx-title text-xl font-semibold mt-1">¿Por qué un dataset es mejor que el otro?</h2>
              <p className="text-xs nx-muted mt-1">
                Inicio, cierre y variación lado a lado — {metricLabel.toLowerCase()}
              </p>
            </div>
            <HeadToHeadChart
              mineName={mine.name}
              compName={competitor.name}
              mineA={mineStart}
              mineB={mineEnd}
              compA={compStart}
              compB={compEnd}
              mineGrowth={mineGrowth}
              compGrowth={compGrowth}
              metricLabel={metricLabel}
            />
          </div>

          {/* Insight — al final */}
          <div className="nx-card p-6 border-blue-500/30">
            <div className="flex items-start gap-3">
              <Brain className="text-blue-500 mt-1 shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-blue-500 uppercase tracking-wide font-semibold">Conclusión</p>
                    <h2 className="nx-title text-lg font-semibold mt-1">Insight del análisis</h2>
                  </div>
                  <button
                    disabled={aiLoading || noMoney}
                    onClick={async () => {
                      setAiLoading(true);
                      try {
                        setAiInsight(
                          await generateAIInsight({
                            company: mine.name,
                            competitor: competitor.name,
                            metric: metricLabel,
                            companyValue: mineEnd,
                            competitorValue: compEnd,
                            companyRows: mine.rows.slice(0, 30),
                            competitorRows: competitor.rows.slice(0, 30),
                          }),
                        );
                      } catch {
                        setAiInsight(insight);
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    className="nx-btn text-xs"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Analizando...
                      </>
                    ) : (
                      <>
                        <Brain size={14} /> Generar insight con IA
                      </>
                    )}
                  </button>
                </div>
                <p className="nx-body text-sm leading-7 mt-4">{aiInsight ?? insight}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    className="nx-btn-ghost text-xs"
                    onClick={() => {
                      try {
                        sessionStorage.setItem(REPORT_INSIGHT_KEY, aiInsight ?? insight);
                      } catch {
                        /* ignore */
                      }
                      navigate(
                        `/big-data/reporte?mine=${mine.id}&competitor=${competitor.id}&metric=${metric}&yearA=${yearA}&yearB=${yearB}`,
                      );
                    }}
                  >
                    <FileDown size={14} /> Generar reporte PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="nx-card p-8 text-center">
          <p className="nx-subtitle">
            {competitors.length === 0
              ? 'Necesitás al menos dos datasets: uno tuyo y otro de competencia.'
              : 'Seleccioná datasets distintos para comparar.'}
          </p>
        </div>
      )}
    </div>
  );
};
