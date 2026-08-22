import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

export default function LogisticsReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [buckets, setBuckets] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await api.getLogisticsReport()
        if (alive) setBuckets(res.buckets || [])
      } catch (e) {
        if (alive) setError(e.message || 'Error logística')
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
    <Panel
      title="Impacto logístico vs satisfacción"
      subtitle="Retraso = delivered_customer_date − estimated_delivery_date · Y = review_score"
    >
      <div style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer>
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
            <XAxis dataKey="delay_bucket" />
            <YAxis yAxisId="left" domain={[0, 5]} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="avg_review"
              name="Review promedio"
              fill="#0d5c4d"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              name="Pedidos"
              fill="#c45c26"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}
