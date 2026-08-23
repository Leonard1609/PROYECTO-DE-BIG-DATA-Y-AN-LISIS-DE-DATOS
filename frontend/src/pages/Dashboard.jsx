import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Sector,
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
  moneyBR,
  moneyBRExact,
  numPE,
  pct,
  useActiveIndex,
} from '../components/charts/chartKit'
import { ErrorState, KpiCard, LoadingState, Panel } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const FEATURES = [
  'Datos orientados a CRM',
  'Gestión CRUD',
  'Segmentación RFM',
  'LTV y logística',
  'Decisiones con datos',
]

function renderActiveShape(props) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="chart-donut-center-title">
        {payload.category || payload.name}
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

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [kpis, setKpis] = useState(null)
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])
  const donut = useActiveIndex()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const [k, s, c] = await Promise.all([
          api.getKpis(),
          api.getSalesHistory(),
          api.getCategories(),
        ])
        if (cancelled) return
        setKpis(k)
        setSales(s.series || [])
        setCategories(c.categories || [])
      } catch (e) {
        if (!cancelled) setError(e.message || 'No se pudo cargar el dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const avgRevenue = useMemo(() => avgOf(sales, 'revenue'), [sales])
  const totalCategorySales = useMemo(
    () => categories.reduce((sum, row) => sum + (row.sales || 0), 0),
    [categories],
  )

  if (loading || !kpis) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className="dash-page">
      <section className="dash-hero">
        <div>
          <p className="dash-kicker">Panel general del sistema</p>
          <h3>¡Bienvenida, {user?.name || 'analista'}!</h3>
          <div className="dash-hero-actions">
            <Link className="btn btn-primary" to="/clientes">
              Ir a gestión de clientes
            </Link>
            <Link className="btn btn-ghost" to="/reportes/rfm">
              Ver reportes
            </Link>
          </div>
        </div>
        <div className="dash-hero-side">
          <strong>Olist CRM Pulse</strong>
          <span>Plataforma Analítica y Gestión de E-commerce</span>
        </div>
      </section>

      <div className="grid-kpis grid-kpis-5">
        <KpiCard
          label="Clientes"
          value={kpis.totalCustomers.toLocaleString('es-PE')}
          trend="+12.4% vs periodo"
          hint="olist_order_customer_dataset"
        />
        <KpiCard
          label="Pedidos"
          value={kpis.totalOrders.toLocaleString('es-PE')}
          trend="+9.8% vs periodo"
          hint="olist_orders_dataset"
        />
        <KpiCard
          label="Ticket promedio"
          value={moneyBRExact(kpis.avgTicket)}
          trend="+3.1% vs periodo"
          hint="Agregado items + payments"
        />
        <KpiCard
          label="Review promedio"
          value={kpis.avgReviewScore.toFixed(2)}
          trend="+1.2% vs periodo"
          hint="olist_order_reviews_dataset"
        />
        <KpiCard
          label="Clientes en riesgo"
          value={kpis.atRiskCustomers.toLocaleString('es-PE')}
          trend={`Cancelación ${pct(kpis.cancelRate)}`}
          hint="Segmentación CRM"
        />
      </div>

      <div className="charts-2">
        <Panel
          title="Ventas y volumen histórico"
          subtitle="Composed chart · ingresos + pedidos · línea de promedio móvil del periodo"
          action={
            <ChartLegendInline
              items={[
                { label: 'Ingresos', color: CHART.brand },
                { label: 'Pedidos', color: CHART.accent },
                { label: 'Promedio ingresos', color: CHART.blue },
              ]}
            />
          }
        >
          <ChartFrame height={340}>
            <ResponsiveContainer>
              <ComposedChart data={sales} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.brand} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART.brand} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="period" {...axisProps} />
                <YAxis
                  yAxisId="left"
                  {...axisProps}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <YAxis yAxisId="right" orientation="right" {...axisProps} />
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value, name) =>
                        name === 'Ingresos' ? moneyBR(value) : numPE(value)
                      }
                    />
                  }
                />
                <Legend />
                <ReferenceLine
                  yAxisId="left"
                  y={avgRevenue}
                  stroke={CHART.blue}
                  strokeDasharray="6 4"
                  label={{
                    value: 'Promedio',
                    fill: CHART.blue,
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Ingresos"
                  stroke={CHART.brand}
                  fill="url(#revFill)"
                  strokeWidth={2.5}
                  animationDuration={900}
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  name="Pedidos"
                  fill={CHART.accent}
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                  animationDuration={900}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Tendencia"
                  stroke={CHART.teal}
                  strokeWidth={1.5}
                  dot={false}
                  strokeOpacity={0.35}
                  legendType="none"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>

        <Panel
          title="Distribución por categoría"
          subtitle="Donut interactivo · hover para detalle de participación"
          action={<span className="chart-meta">Total {numPE(totalCategorySales)}</span>}
        >
          <ChartFrame height={340}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  activeIndex={donut.activeIndex ?? undefined}
                  activeShape={renderActiveShape}
                  data={categories}
                  dataKey="sales"
                  nameKey="category"
                  innerRadius={68}
                  outerRadius={108}
                  paddingAngle={3}
                  onMouseEnter={donut.onEnter}
                  onMouseLeave={donut.onLeave}
                  animationDuration={800}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={CHART.palette[i % CHART.palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      formatter={(value) => numPE(value)}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.category}
                    />
                  }
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartFrame>
        </Panel>
      </div>

      <div className="dash-features">
        {FEATURES.map((item) => (
          <div key={item} className="dash-feature">
            <span />
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
