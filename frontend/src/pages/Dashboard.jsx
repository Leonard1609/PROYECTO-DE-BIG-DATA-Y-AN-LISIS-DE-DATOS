import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorState, KpiCard, LoadingState, Panel } from '../components/ui'
import { api } from '../services/api'

const money = (n) =>
  new Intl.NumberFormat('es-BR', { style: 'currency', currency: 'BRL' }).format(n)

const pct = (n) => `${(n * 100).toFixed(2)}%`

const COLORS = ['#0d5c4d', '#c45c26', '#1d4ed8', '#0f766e', '#64748b']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [kpis, setKpis] = useState(null)
  const [sales, setSales] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const [k, s, c] = await Promise.all([
          api.getKpis(),
          api.getSalesHistory(),
          api.getCategories(),
        ])
        if (!alive) return
        setKpis(k)
        setSales(s.series || [])
        setCategories(c.categories || [])
      } catch (e) {
        if (alive) setError(e.message || 'No se pudo cargar el dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <Panel
        title="Estado del sistema"
        subtitle="Indicadores maestros del CRM analítico Olist (capa de presentación)"
      >
        <div className="grid-kpis" style={{ marginBottom: 0 }}>
          <KpiCard
            label="Clientes en el sistema"
            value={kpis.totalCustomers.toLocaleString('es-PE')}
            hint="olist_order_customer_dataset"
          />
          <KpiCard
            label="Pedidos procesados"
            value={kpis.totalOrders.toLocaleString('es-PE')}
            hint="olist_orders_dataset"
          />
          <KpiCard
            label="Ticket promedio"
            value={money(kpis.avgTicket)}
            hint="Agregado items + payments"
          />
          <KpiCard
            label="Clientes en riesgo"
            value={kpis.atRiskCustomers.toLocaleString('es-PE')}
            hint={`Cancelación ${pct(kpis.cancelRate)} · Review ${kpis.avgReviewScore}`}
          />
        </div>
      </Panel>

      <div className="charts-2" style={{ marginTop: '1rem' }}>
        <Panel
          title="Ventas y volumen histórico"
          subtitle="Módulo de inteligencia — evolución de transacciones por periodo"
        >
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={sales}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d5c4d" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0d5c4d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d5c4d"
                  fill="url(#rev)"
                  strokeWidth={2}
                  name="Ingresos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Distribución por categoría" subtitle="product_category_name">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="sales"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  )
}
