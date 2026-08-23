import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CHART,
  ChartFrame,
  ChartTooltip,
  axisProps,
  gridProps,
  numPE,
  pct,
  useActiveIndex,
} from '../../components/charts/chartKit'
import { DataTable, ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } =
    props
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="chart-donut-center-title">
        {payload.name}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="chart-donut-center-value">
        {numPE(value)} · {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  )
}

export default function PaymentsReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [methods, setMethods] = useState([])
  const donut = useActiveIndex()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.getPaymentsReport()
        if (!cancelled) setMethods(res.methods || [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error pagos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const pieData = useMemo(() => {
    const map = new Map()
    for (const m of methods) {
      map.set(m.payment_type, (map.get(m.payment_type) || 0) + m.orders)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [methods])

  const cancelSeries = useMemo(
    () =>
      methods.map((m) => ({
        label: `${m.payment_type} · ${m.installments_bucket}`,
        cancel_rate: Number((m.cancel_rate * 100).toFixed(2)),
        orders: m.orders,
      })),
    [methods],
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const columns = [
    { key: 'payment_type', label: 'Método' },
    { key: 'installments_bucket', label: 'Cuotas' },
    { key: 'orders', label: 'Pedidos', render: (r) => r.orders.toLocaleString('es-PE') },
    {
      key: 'cancel_rate',
      label: '% Cancelación',
      render: (r) => pct(r.cancel_rate),
    },
  ]

  return (
    <>
      <div className="charts-2">
        <Panel
          title="Preferencia de métodos de pago"
          subtitle="Donut interactivo · volumen por payment_type"
        >
          <ChartFrame height={360}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  activeIndex={donut.activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={3}
                  onMouseEnter={donut.onEnter}
                  onMouseLeave={donut.onLeave}
                  animationDuration={850}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART.palette[i % CHART.palette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={(v) => numPE(v)} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel
          title="Cancelación por método y cuotas"
          subtitle="Barras avanzadas · tasa de cancelación (%)"
        >
          <ChartFrame height={360}>
            <ResponsiveContainer>
              <BarChart data={cancelSeries} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="label"
                  {...axisProps}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={60}
                />
                <YAxis {...axisProps} unit="%" />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, name) =>
                        name === 'Pedidos' ? numPE(value) : `${value}%`
                      }
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="cancel_rate"
                  name="% Cancelación"
                  fill={CHART.accent}
                  radius={[8, 8, 0, 0]}
                  animationDuration={900}
                >
                  {cancelSeries.map((row) => (
                    <Cell
                      key={row.label}
                      fill={row.cancel_rate >= 1 ? CHART.accent : CHART.brand}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <Panel
        title="Pagos vs retención"
        subtitle="payment_installments cruzado con order_status = canceled"
      >
        <DataTable
          columns={columns}
          rows={methods}
          rowKey={(r) => `${r.payment_type}-${r.installments_bucket}`}
        />
      </Panel>
    </>
  )
}
