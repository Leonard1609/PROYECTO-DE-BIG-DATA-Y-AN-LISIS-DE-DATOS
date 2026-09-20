import type { ColumnStats, Dataset, DelayReviewInsight, Financials } from '../types/dataset';

export function toNumbers(rows: Record<string, string>[], column: string): number[] {
  return rows
    .map((r) => Number(String(r[column] ?? '').replace(',', '.')))
    .filter((n) => Number.isFinite(n));
}

export function findHeader(headers: string[], candidates: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const name of candidates) {
    const i = lower.indexOf(name.toLowerCase());
    if (i >= 0) return headers[i];
  }
  return null;
}

export function isNumericColumn(dataset: Dataset, column: string): boolean {
  const nums = toNumbers(dataset.rows, column);
  const filled = dataset.rows.filter((r) => String(r[column] ?? '').trim() !== '').length;
  return filled > 0 && nums.length >= Math.ceil(filled * 0.8);
}

export function columnStats(dataset: Dataset, column: string): ColumnStats {
  const values = toNumbers(dataset.rows, column).sort((a, b) => a - b);
  if (values.length === 0) {
    return { column, count: 0, avg: null, median: null, min: null, max: null, sum: null };
  }
  const sum = values.reduce((a, b) => a + b, 0);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
  return {
    column,
    count: values.length,
    avg: Number((sum / values.length).toFixed(4)),
    median: Number(median.toFixed(4)),
    min: values[0],
    max: values[values.length - 1],
    sum: Number(sum.toFixed(4)),
  };
}

export const INGRESO_HEADERS = [
  'ingresos',
  'revenue',
  'monto',
  'price',
  'precio',
  'total',
  'venta',
  'ventas',
  'sales',
  'amount',
  'valor',
  'ticket',
  'payment_value',
];

export const COSTO_HEADERS = [
  'costos',
  'cost',
  'costo',
  'gasto',
  'gastos',
  'expense',
  'cogs',
  'coste',
  'freight_value',
  'freight',
  'shipping',
];

const NON_MONEY_NUMERIC = [
  'id',
  'zip',
  'code',
  'prefix',
  'index',
  'numero',
  'number',
  'qty',
  'quantity',
  'count',
  'item_id',
  'order_id',
  'customer_id',
  'seller_id',
  'product_id',
  'sku',
  'year',
  'año',
  'anio',
  'score',
  'rating',
  'review',
  'estrellas',
  'dias',
  'delay',
];

export function isLikelyMoneyColumn(header: string): boolean {
  const h = header.toLowerCase();
  if (NON_MONEY_NUMERIC.some((p) => h.includes(p))) return false;
  return true;
}

function guessMoneyColumn(headers: string[], rows: Record<string, string>[], candidates: string[]): string {
  const hit = findHeader(headers, candidates);
  if (hit) return hit;
  const numeric = numericHeadersOf(headers, rows).filter(isLikelyMoneyColumn);
  const fuzzy = numeric.find((h) =>
    /price|amount|total|valor|venta|revenue|ingreso|payment|freight|cost|gasto/i.test(h),
  );
  return fuzzy ?? '';
}

export function numericHeadersOf(headers: string[], rows: Record<string, string>[]): string[] {
  const probe = { headers, rows } as Dataset;
  return headers.filter((h) => isNumericColumn(probe, h));
}

export function suggestMoneyMap(headers: string[], rows: Record<string, string>[]): {
  ingresos: string;
  costos: string;
  numeric: string[];
} {
  const numeric = numericHeadersOf(headers, rows);
  const ingresos = guessMoneyColumn(headers, rows, INGRESO_HEADERS);
  let costos = guessMoneyColumn(headers, rows, COSTO_HEADERS);
  if (costos && costos === ingresos) costos = '';
  const moneyNumeric = numeric.filter(isLikelyMoneyColumn);
  return {
    ingresos,
    costos,
    numeric: moneyNumeric.length > 0 ? moneyNumeric : numeric,
  };
}

/** Deja columnas canónicas ingresos/costos para que Postgres y el ranking usen lo mismo. */
export function withCanonicalMoney(
  headers: string[],
  rows: Record<string, string>[],
  map: { ingresos: string; costos: string },
): { headers: string[]; rows: Record<string, string>[] } {
  const nextHeaders = [...headers];
  const nextRows = rows.map((r) => ({ ...r }));
  if (map.ingresos) {
    if (!nextHeaders.includes('ingresos')) nextHeaders.push('ingresos');
    for (const row of nextRows) row.ingresos = row[map.ingresos] ?? '';
  }
  if (map.costos) {
    if (!nextHeaders.includes('costos')) nextHeaders.push('costos');
    for (const row of nextRows) row.costos = row[map.costos] ?? '';
  }
  return { headers: nextHeaders, rows: nextRows };
}

export function sumColumn(dataset: Dataset, candidates: string[]): { header: string; sum: number } | null {
  const header = findHeader(dataset.headers, candidates);
  if (!header || !isNumericColumn(dataset, header)) return null;
  const stats = columnStats(dataset, header);
  if (stats.sum == null) return null;
  return { header, sum: stats.sum };
}

export function financials(dataset: Dataset): Financials {
  // 1. Priorizar totales precargados si existen en el objeto dataset (evita recalcular sobre muestras incompletas)
  if (typeof dataset.ingresos === 'number' && dataset.ingresos > 0) {
    const ingresos = dataset.ingresos;
    const costos = typeof dataset.costos === 'number' ? dataset.costos : 0;
    const gananciaNeta = Number((ingresos - costos).toFixed(2));
    const margen = ingresos === 0 ? 0 : Number((((ingresos - costos) / ingresos) * 100).toFixed(4));
    const basis = costos > 0 ? 'ingresos_costos' : 'solo_ingresos';
    return { ingresos, costos, gananciaNeta, margen, basis };
  }

  // 2. Si no hay totales precargados, calcular dinámicamente sumando la columna
  const ingresosHit = sumColumn(dataset, INGRESO_HEADERS);
  const costosHit = sumColumn(dataset, COSTO_HEADERS);
  const ingresos = ingresosHit?.sum ?? 0;
  const costos = costosHit?.sum ?? 0;
  const gananciaNeta = Number((ingresos - costos).toFixed(2));
  const margen = ingresos === 0 ? 0 : Number((((ingresos - costos) / ingresos) * 100).toFixed(4));

  let basis: Financials['basis'] = 'sin_dinero';
  if (ingresosHit && costosHit) {
    basis = findHeader(dataset.headers, ['ingresos', 'revenue']) ? 'ingresos_costos' : 'monto_y_costos';
  } else if (ingresosHit) {
    basis = 'solo_ingresos';
  }

  return { ingresos, costos, gananciaNeta, margen, basis };
}

export function delayReviewInsight(dataset: Dataset, thresholdDays = 8): DelayReviewInsight | null {
  const delayCol = findHeader(dataset.headers, ['dias_entrega', 'dias', 'delivery_days', 'delay']);
  const reviewCol = findHeader(dataset.headers, ['review_score', 'review', 'score', 'estrellas']);
  if (!delayCol || !reviewCol) return null;

  const late: number[] = [];
  const onTime: number[] = [];
  for (const row of dataset.rows) {
    const days = Number(String(row[delayCol] ?? '').replace(',', '.'));
    const score = Number(String(row[reviewCol] ?? '').replace(',', '.'));
    if (!Number.isFinite(days) || !Number.isFinite(score)) continue;
    (days > thresholdDays ? late : onTime).push(score);
  }

  const pct1 = (scores: number[]) => {
    if (scores.length === 0) return null;
    return Number(((scores.filter((s) => s === 1).length / scores.length) * 100).toFixed(1));
  };

  return {
    delayCol,
    reviewCol,
    thresholdDays,
    nLate: late.length,
    nOnTime: onTime.length,
    pct1StarLate: pct1(late),
    pct1StarOnTime: pct1(onTime),
    sampleTooSmall: late.length + onTime.length < 8,
  };
}

export function sharedNumericHeaders(datasets: Dataset[]): string[] {
  if (datasets.length === 0) return [];
  return datasets[0].headers.filter(
    (h) => datasets.every((d) => d.headers.includes(h) && isNumericColumn(d, h)),
  );
}

export const DATE_HEADERS = ['fecha', 'date', 'created_at', 'order_date', 'dia'];
export const YEAR_HEADERS = ['year', 'año', 'anio', 'yr', 'periodo', 'period'];

export interface PeriodFinancials {
  label: string;
  year: number;
  ingresos: number;
  costos: number;
  ganancia: number;
}

export interface PeriodSeriesResult {
  periods: PeriodFinancials[];
  hasDates: boolean;
  source: 'year_column' | 'date_column' | 'row_split';
}

function parseYearFromValue(raw: string): number | null {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  if (/^\d{4}$/.test(v)) return Number(v);
  const iso = Date.parse(v);
  if (!Number.isNaN(iso)) return new Date(iso).getFullYear();
  const parts = v.split(/[/\-.]/).map((p) => p.trim());
  for (const p of parts) {
    if (/^\d{4}$/.test(p)) return Number(p);
  }
  return null;
}

function moneyColumns(dataset: Dataset): { ingresos: string | null; costos: string | null } {
  return {
    ingresos: findHeader(dataset.headers, INGRESO_HEADERS),
    costos: findHeader(dataset.headers, COSTO_HEADERS),
  };
}

function sumMoneyInRows(
  rows: Record<string, string>[],
  ingresosCol: string | null,
  costosCol: string | null,
): { ingresos: number; costos: number; ganancia: number } {
  let ingresos = 0;
  let costos = 0;
  for (const row of rows) {
    if (ingresosCol) {
      const n = Number(String(row[ingresosCol] ?? '').replace(',', '.'));
      if (Number.isFinite(n)) ingresos += n;
    }
    if (costosCol) {
      const n = Number(String(row[costosCol] ?? '').replace(',', '.'));
      if (Number.isFinite(n)) costos += n;
    }
  }
  return {
    ingresos: Number(ingresos.toFixed(2)),
    costos: Number(costos.toFixed(2)),
    ganancia: Number((ingresos - costos).toFixed(2)),
  };
}

function groupRowsByYear(
  dataset: Dataset,
  yearCol: string | null,
  dateCol: string | null,
): Map<number, Record<string, string>[]> {
  const groups = new Map<number, Record<string, string>[]>();
  for (const row of dataset.rows) {
    const raw = yearCol ? row[yearCol] : dateCol ? row[dateCol] : '';
    const year = parseYearFromValue(String(raw ?? ''));
    if (year == null) continue;
    const bucket = groups.get(year) ?? [];
    bucket.push(row);
    groups.set(year, bucket);
  }
  return groups;
}

function buildFromRowSplit(dataset: Dataset): PeriodSeriesResult {
  const { ingresos: ingCol, costos: costCol } = moneyColumns(dataset);
  const rows = dataset.rows ?? [];
  if (rows.length < 2) {
    const totals = financials(dataset);
    return {
      periods: [
        {
          label: 'Periodo A',
          year: 1,
          ingresos: totals.ingresos,
          costos: totals.costos,
          ganancia: totals.gananciaNeta,
        },
        {
          label: 'Periodo B',
          year: 2,
          ingresos: totals.ingresos,
          costos: totals.costos,
          ganancia: totals.gananciaNeta,
        },
      ],
      hasDates: false,
      source: 'row_split',
    };
  }
  const mid = Math.ceil(rows.length / 2);
  const first = sumMoneyInRows(rows.slice(0, mid), ingCol, costCol);
  const second = sumMoneyInRows(rows.slice(mid), ingCol, costCol);
  return {
    periods: [
      { label: 'Periodo A (inicio)', year: 1, ...first },
      { label: 'Periodo B (cierre)', year: 2, ...second },
    ],
    hasDates: false,
    source: 'row_split',
  };
}

/** Agrupa filas por año y calcula ingresos, costos y ganancia en cada periodo. */
export function buildPeriodSeries(dataset: Dataset): PeriodSeriesResult {
  const yearCol = findHeader(dataset.headers, YEAR_HEADERS);
  const dateCol = findHeader(dataset.headers, DATE_HEADERS);
  const { ingresos: ingCol, costos: costCol } = moneyColumns(dataset);

  if (!ingCol && typeof dataset.ingresos !== 'number') {
    return buildFromRowSplit(dataset);
  }

  const groups = groupRowsByYear(dataset, yearCol, yearCol ? null : dateCol);
  if (groups.size === 0) {
    return buildFromRowSplit(dataset);
  }

  const periods = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, rows]) => {
      const totals = sumMoneyInRows(rows, ingCol, costCol);
      return { label: String(year), year, ...totals };
    });

  return {
    periods,
    hasDates: true,
    source: yearCol ? 'year_column' : 'date_column',
  };
}

export function availableYears(datasets: Dataset[]): number[] {
  const years = new Set<number>();
  for (const d of datasets) {
    for (const p of buildPeriodSeries(d).periods) years.add(p.year);
  }
  return [...years].sort((a, b) => a - b);
}

export function slicePeriodRange(
  series: PeriodSeriesResult,
  yearA: number,
  yearB: number,
): PeriodFinancials[] {
  const lo = Math.min(yearA, yearB);
  const hi = Math.max(yearA, yearB);
  const inRange = series.periods.filter((p) => p.year >= lo && p.year <= hi);
  if (inRange.length >= 2) return inRange;
  if (series.periods.length >= 2) {
    return [series.periods[0], series.periods[series.periods.length - 1]];
  }
  return series.periods;
}

export function metricFromPeriod(p: PeriodFinancials, metric: 'ganancia' | 'ingresos' | 'costos'): number {
  if (metric === 'ingresos') return p.ingresos;
  if (metric === 'costos') return p.costos;
  return p.ganancia;
}

export function growthPct(from: number, to: number): number | null {
  if (from === 0) return to === 0 ? 0 : null;
  return Number((((to - from) / Math.abs(from)) * 100).toFixed(1));
}