import { useState } from 'react'

export const CHART = {
  brand: '#0d5c4d',
  accent: '#c45c26',
  blue: '#1d4ed8',
  teal: '#0f766e',
  muted: '#64748b',
  warn: '#b45309',
  grid: '#d5e0db',
  ink: '#0f1c18',
  inkMuted: '#5b6b66',
  palette: ['#0d5c4d', '#c45c26', '#1d4ed8', '#0f766e', '#64748b', '#b45309', '#0891b2'],
}

export const moneyBR = (n) =>
  new Intl.NumberFormat('es-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)

export const moneyBRExact = (n) =>
  new Intl.NumberFormat('es-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0)

export const numPE = (n) => new Intl.NumberFormat('es-PE').format(Number(n) || 0)

export const pct = (n, digits = 1) => `${(Number(n) * 100).toFixed(digits)}%`

export const axisProps = {
  tick: { fill: CHART.inkMuted, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: CHART.grid },
}

export const gridProps = {
  strokeDasharray: '4 6',
  stroke: CHART.grid,
  vertical: false,
}

/** Tooltip SaaS avanzado */
export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">
        {labelFormatter ? labelFormatter(label, payload) : label}
      </p>
      <ul>
        {payload.map((entry) => (
          <li key={`${entry.name}-${entry.dataKey}`}>
            <span className="chart-tooltip-swatch" style={{ background: entry.color || CHART.brand }} />
            <span className="chart-tooltip-name">{entry.name}</span>
            <strong>
              {formatter
                ? formatter(entry.value, entry.name, entry)
                : typeof entry.value === 'number'
                  ? numPE(entry.value)
                  : entry.value}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ChartFrame({ height = 320, children, className = '' }) {
  return (
    <div className={`chart-frame ${className}`.trim()} style={{ width: '100%', height }}>
      {children}
    </div>
  )
}

export function ChartLegendInline({ items }) {
  return (
    <div className="chart-legend-inline">
      {items.map((item) => (
        <span key={item.label} className="chart-legend-item">
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

/** Donut interactivo con segmento activo */
export function useActiveIndex() {
  const [activeIndex, setActiveIndex] = useState(null)
  return {
    activeIndex,
    onEnter: (_, index) => setActiveIndex(index),
    onLeave: () => setActiveIndex(null),
  }
}

export function avgOf(rows, key) {
  if (!rows?.length) return 0
  return rows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0) / rows.length
}
