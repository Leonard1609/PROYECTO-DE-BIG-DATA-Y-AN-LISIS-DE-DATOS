export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="topbar">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function KpiCard({ label, value, hint }) {
  return (
    <article className="kpi">
      <p className="kpi-label">{label}</p>
      <p className="kpi-value">{value}</p>
      {hint ? <p className="kpi-hint">{hint}</p> : null}
    </article>
  )
}

export function LoadingState({ label = 'Cargando…' }) {
  return <div className="state-box">{label}</div>
}

export function ErrorState({ message }) {
  return <div className="state-box">Error: {message}</div>
}

export function Panel({ title, subtitle, action, children }) {
  return (
    <section className="panel">
      {(title || action) && (
        <div className="panel-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

const segmentClass = {
  VIP: 'badge-vip',
  Leal: 'badge-leal',
  Leales: 'badge-leal',
  'En riesgo': 'badge-riesgo',
  Perdido: 'badge-perdido',
  Perdidos: 'badge-perdido',
  delivered: 'badge-delivered',
  shipped: 'badge-shipped',
  canceled: 'badge-canceled',
}

export function Badge({ value }) {
  const cls = segmentClass[value] || 'badge-perdido'
  return <span className={`badge ${cls}`}>{value}</span>
}

export function DataTable({ columns, rows, rowKey, empty = 'Sin registros' }) {
  if (!rows?.length) {
    return <div className="state-box">{empty}</div>
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
