import { useEffect, useMemo, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { DataTable, ErrorState, LoadingState, Panel } from '../../components/ui'
import { api } from '../../services/api'

const COLORS = ['#0d5c4d', '#c45c26', '#1d4ed8', '#0f766e', '#64748b', '#b45309']

export default function PaymentsReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [methods, setMethods] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await api.getPaymentsReport()
        if (alive) setMethods(res.methods || [])
      } catch (e) {
        if (alive) setError(e.message || 'Error pagos')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const pieData = useMemo(() => {
    const map = new Map()
    for (const m of methods) {
      map.set(m.payment_type, (map.get(m.payment_type) || 0) + m.orders)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [methods])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const columns = [
    { key: 'payment_type', label: 'Método' },
    { key: 'installments_bucket', label: 'Cuotas' },
    { key: 'orders', label: 'Pedidos', render: (r) => r.orders.toLocaleString('es-PE') },
    {
      key: 'cancel_rate',
      label: '% Cancelación',
      render: (r) => `${(r.cancel_rate * 100).toFixed(2)}%`,
    },
  ]

  return (
    <div className="charts-2">
      <Panel
        title="Preferencia de métodos de pago"
        subtitle="credit_card · boleto · voucher · debit_card"
      >
        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Panel>

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
    </div>
  )
}
