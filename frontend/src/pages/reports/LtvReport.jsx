import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable, ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

export default function LtvReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [regions, setRegions] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await api.getLtvReport()
        if (alive) setRegions(res.regions || [])
      } catch (e) {
        if (alive) setError(e.message || 'Error LTV')
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

  const columns = [
    { key: 'customer_state', label: 'Estado' },
    { key: 'customers', label: 'Clientes', render: (r) => r.customers.toLocaleString('es-PE') },
    {
      key: 'avg_ticket',
      label: 'Ticket medio',
      render: (r) => `R$ ${r.avg_ticket.toFixed(2)}`,
    },
    {
      key: 'avg_freight',
      label: 'Flete medio',
      render: (r) => `R$ ${r.avg_freight.toFixed(2)}`,
    },
    { key: 'ltv', label: 'LTV', render: (r) => `R$ ${r.ltv.toFixed(2)}` },
  ]

  return (
    <>
      <Panel
        title="LTV por región / estado"
        subtitle="customer_state · ticket · freight_value · valor acumulado"
      >
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={regions} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="customer_state" width={40} />
              <Tooltip />
              <Bar dataKey="ltv" name="LTV" fill="#0d5c4d" radius={[0, 8, 8, 0]} />
              <Bar dataKey="avg_freight" name="Flete" fill="#c45c26" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Detalle por estado" subtitle="Identifica regiones rentables vs flete alto">
        <DataTable columns={columns} rows={regions} rowKey={(r) => r.customer_state} />
      </Panel>
    </>
  )
}
