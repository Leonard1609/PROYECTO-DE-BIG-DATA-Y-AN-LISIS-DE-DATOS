import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import {
  CHART,
  ChartFrame,
  ChartLegendInline,
  ChartTooltip,
  axisProps,
  gridProps,
  moneyBRExact,
  numPE,
} from '../../components/charts/chartKit'
import { ErrorState, KpiCard, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

const segmentColor = {
  VIP: '#0f766e',
  Leales: '#1d4ed8',
  'En riesgo': '#c2410c',
  Perdidos: '#64748b',
}

export default function RfmReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.getRfmReport()
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error RFM')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data) return <LoadingState />

  return (
    <>
      <div className="grid-kpis">
        {data.segments.map((s) => (
          <KpiCard
            key={s.segment}
            label={s.segment}
            value={s.count.toLocaleString('es-PE')}
            hint={`Ticket medio R$ ${s.avg_monetary}`}
          />
        ))}
      </div>

      <div className="charts-2">
        <Panel
          title="Dispersión RFM avanzada"
          subtitle="Recencia × Frecuencia · burbuja = valor monetario · semáforo por segmento"
          action={
            <ChartLegendInline
              items={Object.entries(segmentColor).map(([label, color]) => ({ label, color }))}
            />
          }
        >
          <ChartFrame height={360}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid {...gridProps} horizontal vertical />
                <XAxis
                  type="number"
                  dataKey="recency"
                  name="Recencia"
                  unit=" d"
                  {...axisProps}
                  label={{
                    value: 'Recencia (días desde última compra)',
                    position: 'insideBottom',
                    offset: -2,
                    fill: CHART.inkMuted,
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="frequency"
                  name="Frecuencia"
                  {...axisProps}
                  label={{
                    value: 'Frecuencia',
                    angle: -90,
                    position: 'insideLeft',
                    fill: CHART.inkMuted,
                    fontSize: 11,
                  }}
                />
                <ZAxis type="number" dataKey="monetary" range={[80, 420]} />
                <Tooltip
                  cursor={{ strokeDasharray: '4 4', stroke: CHART.muted }}
                  content={
                    <ChartTooltip
                      formatter={(value, name) => {
                        if (name === 'monetary' || name === 'Monetario') return moneyBRExact(value)
                        return numPE(value)
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.segment
                          ? `Segmento ${payload[0].payload.segment}`
                          : 'Cliente RFM'
                      }
                    />
                  }
                />
                <Legend />
                {Object.keys(segmentColor).map((seg) => (
                  <Scatter
                    key={seg}
                    name={seg}
                    data={data.scatter.filter((d) => d.segment === seg)}
                    fill={segmentColor[seg]}
                    fillOpacity={0.85}
                    animationDuration={850}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel title="Volumen por segmento" subtitle="Barras horizontales · semáforo de riesgo comercial">
          <ChartFrame height={360}>
            <ResponsiveContainer>
              <BarChart
                data={data.segments}
                layout="vertical"
                margin={{ left: 16, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid {...gridProps} />
                <XAxis type="number" {...axisProps} tickFormatter={numPE} />
                <YAxis type="category" dataKey="segment" width={88} {...axisProps} />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, name) =>
                        name === 'Ticket medio' ? moneyBRExact(value) : numPE(value)
                      }
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  name="Clientes"
                  radius={[0, 10, 10, 0]}
                  barSize={22}
                  animationDuration={900}
                >
                  {data.segments.map((s) => (
                    <Cell key={s.segment} fill={s.color} />
                  ))}
                </Bar>
                <Bar
                  dataKey="avg_monetary"
                  name="Ticket medio"
                  radius={[0, 10, 10, 0]}
                  barSize={10}
                  fill={CHART.accent}
                  fillOpacity={0.55}
                  animationDuration={900}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>
    </>
  )
}
