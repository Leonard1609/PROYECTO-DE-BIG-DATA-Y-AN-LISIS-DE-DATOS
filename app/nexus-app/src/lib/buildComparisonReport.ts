import type { Dataset } from '../types/dataset';
import {
  availableYears,
  buildPeriodSeries,
  financials,
  growthPct,
  metricFromPeriod,
  slicePeriodRange,
} from './analyze';
import { rubroLabel } from './catalog';
import { formatMoney, formatPct } from './format';

export type ReportMetric = 'ganancia' | 'ingresos' | 'costos';

export interface ComparisonReport {
  generatedAt: string;
  metric: ReportMetric;
  metricLabel: string;
  yearA: number;
  yearB: number;
  periodNote: string;
  chartLabels: string[];
  mine: Dataset;
  competitor: Dataset;
  mineFin: ReturnType<typeof financials>;
  compFin: ReturnType<typeof financials>;
  mineStart: number;
  mineEnd: number;
  compStart: number;
  compEnd: number;
  mineGrowth: number | null;
  compGrowth: number | null;
  diffEnd: number;
  mineTrend: number[];
  compTrend: number[];
  winner: string;
  winnerReason: string;
  insight: string;
  recommendations: string[];
  engineeringDocumentation: string[];
}

function metricLabelOf(metric: ReportMetric): string {
  if (metric === 'ingresos') return 'Ingresos';
  if (metric === 'costos') return 'Costos';
  return 'Ganancia neta';
}

function buildEngineeringDocumentation(
  mine: Dataset,
  competitor: Dataset,
  metricLabel: string,
  chartLabels: string[],
  mineGrowth: number | null,
  compGrowth: number | null,
  diffEnd: number,
): string[] {
  const start = chartLabels[0] ?? 'Periodo A';
  const end = chartLabels.at(-1) ?? 'Periodo B';
  const winner = diffEnd >= 0 ? mine.name : competitor.name;
  const leaderGap = Math.abs(diffEnd);

  const docs = [
    `Documento técnico de software: comparación de datasets entre ${mine.name} y ${competitor.name}.`,
    `Contexto funcional: ${rubroLabel(mine.rubro)} y ${rubroLabel(competitor.rubro)} analizados con la métrica ${metricLabel.toLowerCase()}.`,
    `Alcance analítico: dataset base ${mine.name} (${mine.filename}) con ${mine.rows.length} filas y dataset competencia ${competitor.name} (${competitor.filename}) con ${competitor.rows.length} filas.`,
    `Pipeline de análisis: lectura CSV, inferencia de columnas, detección financiera, construcción de series temporales y comparación de periodos ${start} → ${end}.`,
    `Modelo de negocios: la métrica ${metricLabel.toLowerCase()} se normaliza a nivel financiero y se compara en términos de inicio, cierre y variación entre periodos.`,
    `Reglas de validación: se exige consistencia de columnas de dinero, tipo de archivo, registros y método de cálculo para evitar sesgos de ingeniería de datos.`,
    `Estructura de reportes: resumen ejecutivo, KPIs financieros, evolución por periodo, distribución financiera y comparación head-to-head.`,
    `Comparativa de resultados: ${winner} lidera el cierre del periodo con una diferencia de ${formatMoney(leaderGap)} en ${metricLabel.toLowerCase()}.`,
    `${mine.name} presenta crecimiento ${mineGrowth != null ? formatPct(Math.abs(mineGrowth) / 100) : 'sin dato'} entre ${start} y ${end}; ${competitor.name} presenta crecimiento ${compGrowth != null ? formatPct(Math.abs(compGrowth) / 100) : 'sin dato'}.`,
    `Conclusión de ingeniería: el sistema recomienda transformar el insight operativo en una política de decisiones técnicas: monitorizar resultado financiero, revisar costos y evaluar variables de volumen.`,
  ];

  return docs;
}

function buildInsight(
  mine: Dataset,
  competitor: Dataset,
  metricLabel: string,
  diffEnd: number,
  chartLabels: string[],
  mineGrowth: number | null,
): { insight: string; recommendations: string[]; winner: string; winnerReason: string } {
  const winner = diffEnd >= 0 ? mine.name : competitor.name;
  const gap = Math.abs(diffEnd);

  let insight: string;
  const recommendations: string[] = [];

  if (diffEnd > 0) {
    insight = `${mine.name} cierra el periodo (${chartLabels.at(-1) ?? 'B'}) con ventaja de ${formatMoney(diffEnd)} en ${metricLabel.toLowerCase()} frente a ${competitor.name}.`;
    recommendations.push('Conservar la metodología y variables que explican la ventaja actual.');
    recommendations.push(`Monitorear si ${competitor.name} reduce la brecha en el próximo periodo.`);
  } else if (diffEnd < 0) {
    insight = `${competitor.name} supera a ${mine.name} por ${formatMoney(gap)} al cierre del análisis (${chartLabels.at(-1) ?? 'B'}).`;
    recommendations.push(`Analizar qué prácticas de ${competitor.name} explican la diferencia en ${metricLabel.toLowerCase()}.`);
    recommendations.push('Evaluar ajustes operativos en costos, pricing o volumen de ventas.');
  } else {
    insight = `Ambas empresas empatan en ${metricLabel.toLowerCase()} al cierre del periodo analizado.`;
    recommendations.push('Comparar otras métricas (margen, costos, volumen) para encontrar ventajas.');
  }

  if (mineGrowth != null && mineGrowth > 0) {
    recommendations.push(`${mine.name} creció ${formatPct(Math.abs(mineGrowth) / 100)} entre periodo A y B.`);
  }

  const winnerReason =
    diffEnd === 0
      ? 'Resultados equivalentes al cierre del periodo.'
      : `${winner} presenta mayor ${metricLabel.toLowerCase()} en el periodo B por ${formatMoney(gap)}.`;

  return { insight, recommendations, winner, winnerReason };
}

export function buildComparisonReport(
  mine: Dataset,
  competitor: Dataset,
  metric: ReportMetric = 'ganancia',
  yearA?: number | null,
  yearB?: number | null,
  customInsight?: string | null,
): ComparisonReport {
  const metricLabel = metricLabelOf(metric);
  const mineSeries = buildPeriodSeries(mine);
  const compSeries = buildPeriodSeries(competitor);
  const years = availableYears([mine, competitor]);

  const yA = yearA ?? years[0] ?? 1;
  const yB = yearB ?? years.at(-1) ?? 2;

  const mineRange = slicePeriodRange(mineSeries, yA, yB);
  const compRange = slicePeriodRange(compSeries, yA, yB);

  const labelSet = new Set<string>();
  for (const p of mineRange) labelSet.add(p.label);
  for (const p of compRange) labelSet.add(p.label);
  const chartLabels =
    labelSet.size === 0
      ? ['Periodo A', 'Periodo B']
      : [...labelSet].sort((a, b) => {
          const na = Number(a);
          const nb = Number(b);
          if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
          return a.localeCompare(b);
        });

  const valueAt = (range: typeof mineRange, label: string) => {
    const hit = range.find((p) => p.label === label);
    return hit ? metricFromPeriod(hit, metric) : 0;
  };

  const mineStart = mineRange[0] ? metricFromPeriod(mineRange[0], metric) : 0;
  const mineEnd = mineRange.at(-1) ? metricFromPeriod(mineRange.at(-1)!, metric) : 0;
  const compStart = compRange[0] ? metricFromPeriod(compRange[0], metric) : 0;
  const compEnd = compRange.at(-1) ? metricFromPeriod(compRange.at(-1)!, metric) : 0;

  const mineGrowth = growthPct(mineStart, mineEnd);
  const compGrowth = growthPct(compStart, compEnd);
  const diffEnd = mineEnd - compEnd;

  const periodNote =
    mineSeries.hasDates && compSeries.hasDates
      ? 'Periodos detectados por columna de fecha/año en los CSV.'
      : 'Sin columna de fecha: periodo A = primera mitad de filas, periodo B = segunda mitad.';

  const { insight, recommendations, winner, winnerReason } = buildInsight(
    mine,
    competitor,
    metricLabel,
    diffEnd,
    chartLabels,
    mineGrowth,
  );

  const engineeringDocumentation = buildEngineeringDocumentation(
    mine,
    competitor,
    metricLabel,
    chartLabels,
    mineGrowth,
    compGrowth,
    diffEnd,
  );

  return {
    generatedAt: new Date().toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' }),
    metric,
    metricLabel,
    yearA: yA,
    yearB: yB,
    periodNote,
    chartLabels,
    mine,
    competitor,
    mineFin: financials(mine),
    compFin: financials(competitor),
    mineStart,
    mineEnd,
    compStart,
    compEnd,
    mineGrowth,
    compGrowth,
    diffEnd,
    mineTrend: chartLabels.map((l) => valueAt(mineRange, l)),
    compTrend: chartLabels.map((l) => valueAt(compRange, l)),
    winner,
    winnerReason,
    insight: customInsight?.trim() || insight,
    recommendations,
    engineeringDocumentation,
  };
}

export const REPORT_INSIGHT_KEY = 'nexus-report-insight';
