import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART,
  ChartFrame,
  ChartLegendInline,
  ChartTooltip,
  avgOf,
  axisProps,
  gridProps,
  numPE,
} from '../../components/charts/chartKit'
import { ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

export default function LogisticsReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buckets, setBuckets] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.getLogisticsReport()
        if (!cancelled) setBuckets(res.buckets || [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error logística')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const avgReview = useMemo(() => avgOf(buckets, 'avg_review'), [buckets])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <Panel
      title="Impacto logístico vs satisfacción"
      subtitle="Composed chart · retraso vs review_score · línea de review promedio del sistema"
      action={
        <ChartLegendInline
          items={[
            { label: 'Review promedio', color: CHART.brand },
            { label: 'Pedidos', color: CHART.accent },
            { label: 'Tendencia review', color: CHART.blue },
          ]}
        />
      }
    >
      <ChartFrame height={400}>
        <ResponsiveContainer>
          <ComposedChart data={buckets} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="delay_bucket" {...axisProps} />
            <YAxis yAxisId="left" domain={[0, 5]} {...axisProps} />
            <YAxis yAxisId="right" orientation="right" {...axisProps} tickFormatter={numPE} />
            <Tooltip
              content={
                <ChartTooltip
                  formatter={(value, name) =>
                    name === 'Review promedio' || name === 'Tendencia review'
                      ? Number(value).toFixed(2)
                      : numPE(value)
                  }
                />
              }
            />
            <Legend />
            <ReferenceLine
              yAxisId="left"
              y={avgReview}
              stroke={CHART.muted}
              strokeDasharray="5 5"
              label={{ value: 'Avg review', position: 'insideTopLeft', fill: CHART.muted, fontSize: 11 }}
            />
            <Bar
              yAxisId="left"
              dataKey="avg_review"
              name="Review promedio"
              fill={CHART.brand}
              radius={[8, 8, 0, 0]}
              barSize={36}
              animationDuration={900}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="Pedidos"
              fill={CHART.accent}
              radius={[8, 8, 0, 0]}
              barSize={22}
              fillOpacity={0.85}
              animationDuration={900}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avg_review"
              name="Tendencia review"
              stroke={CHART.blue}
              strokeWidth={2.5}
              dot={{ r: 4, fill: CHART.blue }}
              animationDuration={1000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
    </Panel>
  )
}
