import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
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
  axisProps,
  gridProps,
  moneyBR,
  moneyBRExact,
  numPE,
} from '../../components/charts/chartKit'
import { DataTable, ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

export default function LtvReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.getLtvReport()
        if (!cancelled) setRegions(res.regions || [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error LTV')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const ranked = useMemo(
    () => [...regions].sort((a, b) => b.ltv - a.ltv),
    [regions],
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const columns = [
    { key: 'customer_state', label: 'Estado' },
    { key: 'customers', label: 'Clientes', render: (r) => r.customers.toLocaleString('es-PE') },
    {
      key: 'avg_ticket',
      label: 'Ticket medio',
      render: (r) => moneyBRExact(r.avg_ticket),
    },
    {
      key: 'avg_freight',
      label: 'Flete medio',
      render: (r) => moneyBRExact(r.avg_freight),
    },
    { key: 'ltv', label: 'LTV', render: (r) => moneyBRExact(r.ltv) },
  ]

  return (
    <>
      <Panel
        title="LTV por región / estado"
        subtitle="Composed chart · LTV + flete · línea de densidad de clientes"
        action={
          <ChartLegendInline
            items={[
              { label: 'LTV', color: CHART.brand },
              { label: 'Flete', color: CHART.accent },
              { label: 'Clientes', color: CHART.blue },
            ]}
          />
        }
      >
        <ChartFrame height={380}>
          <ResponsiveContainer>
            <ComposedChart
              data={ranked}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid {...gridProps} />
              <XAxis type="number" {...axisProps} tickFormatter={(v) => moneyBR(v)} />
              <XAxis
                type="number"
                xAxisId="customers"
                orientation="top"
                {...axisProps}
                tickFormatter={numPE}
                hide
              />
              <YAxis type="category" dataKey="customer_state" width={42} {...axisProps} />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(value, name) =>
                      name === 'Clientes' ? numPE(value) : moneyBRExact(value)
                    }
                  />
                }
              />
              <Legend />
              <Bar
                dataKey="ltv"
                name="LTV"
                fill={CHART.brand}
                radius={[0, 8, 8, 0]}
                barSize={14}
                animationDuration={900}
              />
              <Bar
                dataKey="avg_freight"
                name="Flete"
                fill={CHART.accent}
                radius={[0, 8, 8, 0]}
                barSize={10}
                animationDuration={900}
              />
              <Line
                xAxisId="customers"
                type="monotone"
                dataKey="customers"
                name="Clientes"
                stroke={CHART.blue}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: CHART.blue }}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>
      </Panel>

      <Panel title="Detalle por estado" subtitle="Identifica regiones rentables vs flete alto">
        <DataTable columns={columns} rows={ranked} rowKey={(r) => r.customer_state} />
      </Panel>
    </>
  )
}
