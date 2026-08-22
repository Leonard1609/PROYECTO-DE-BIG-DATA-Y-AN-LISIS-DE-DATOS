import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
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
    let alive = true
    ;(async () => {
      try {
        const res = await api.getRfmReport()
        if (alive) setData(res)
      } catch (e) {
        if (alive) setError(e.message || 'Error RFM')
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
          title="Dispersión RFM"
          subtitle="Eje X: Recencia (días) · Y: Frecuencia · tamaño ~ valor monetario"
        >
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
                <XAxis type="number" dataKey="recency" name="Recencia" unit="d" />
                <YAxis type="number" dataKey="frequency" name="Frecuencia" />
                <ZAxis type="number" dataKey="monetary" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                {Object.keys(segmentColor).map((seg) => (
                  <Scatter
                    key={seg}
                    name={seg}
                    data={data.scatter.filter((d) => d.segment === seg)}
                    fill={segmentColor[seg]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Volumen por segmento" subtitle="Semáforo de riesgo comercial">
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={data.segments} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e0db" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="segment" width={90} />
                <Tooltip />
                <Bar dataKey="count" name="Clientes" radius={[0, 8, 8, 0]}>
                  {data.segments.map((s) => (
                    <Cell key={s.segment} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  )
}
