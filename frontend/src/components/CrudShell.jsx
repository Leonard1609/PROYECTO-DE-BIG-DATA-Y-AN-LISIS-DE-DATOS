import { Badge, DataTable, ErrorState, LoadingState, Panel } from './ui'

const CRUD_OPS = [
  { key: 'C', label: 'Crear', hint: 'Registrar', action: 'create' },
  { key: 'R', label: 'Consultar', hint: 'Buscar / filtrar', action: 'read' },
  { key: 'U', label: 'Editar', hint: 'Actualizar', action: 'update' },
  { key: 'D', label: 'Eliminar', hint: 'Borrar', action: 'delete' },
]

export function CrudOpsBar({
  entityLabel,
  total,
  onCreate,
  onConsult,
  onEdit,
  onDelete,
  createLabel,
  hasSelection,
}) {
  function handleOp(action) {
    if (action === 'create') onCreate?.()
    else if (action === 'read') onConsult?.()
    else if (action === 'update') {
      if (!hasSelection) {
        alert('Primero selecciona un registro en la tabla para editarlo.')
        return
      }
      onEdit?.()
    } else if (action === 'delete') {
      if (!hasSelection) {
        alert('Primero selecciona un registro en la tabla para eliminarlo.')
        return
      }
      onDelete?.()
    }
  }

  return (
    <div className="crud-ops">
      <div className="crud-ops-intro">
        <p className="crud-ops-kicker">Módulo CRUD del sistema</p>
        <h3>{entityLabel}</h3>
        <p>{total} registro{total === 1 ? '' : 's'} visibles</p>
      </div>
      <div className="crud-ops-grid">
        {CRUD_OPS.map((op) => (
          <button
            key={op.key}
            type="button"
            className={`crud-op-card crud-op-${op.key.toLowerCase()}`}
            onClick={() => handleOp(op.action)}
            title={`${op.label}: ${op.hint}`}
          >
            <span className="crud-op-letter">{op.key}</span>
            <div>
              <strong>{op.label}</strong>
              <small>{op.hint}</small>
            </div>
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary crud-create-btn" onClick={onCreate}>
        + {createLabel}
      </button>
    </div>
  )
}

export function CrudQueryBar({ children, onClear, onApply }) {
  return (
    <Panel
      title="Consultar · Buscar · Filtrar"
      subtitle="Operación de lectura (R) sobre los registros"
    >
      <div id="crud-query-zone" className="toolbar crud-query-bar">
        {children}
      </div>
      <div className="crud-query-actions">
        {onClear ? (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Limpiar
          </button>
        ) : null}
        <button type="button" className="btn btn-primary" onClick={onApply}>
          Aplicar consulta
        </button>
      </div>
    </Panel>
  )
}

export function CrudTablePanel({
  title,
  subtitle,
  loading,
  error,
  columns,
  rows,
  rowKey,
  selectedId,
  onSelect,
  empty,
}) {
  const enhanced = columns.map((col) => {
    if (col.key !== 'actions') return col
    return {
      ...col,
      render: (row) => (
        <div className="actions" onClick={(e) => e.stopPropagation()}>
          {col.render(row)}
        </div>
      ),
    }
  })

  return (
    <Panel title={title} subtitle={subtitle}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <div className="table-wrap crud-table">
          {!rows?.length ? (
            <div className="state-box">{empty || 'Sin registros'}</div>
          ) : (
            <table className="data">
              <thead>
                <tr>
                  <th>Sel.</th>
                  {enhanced.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = rowKey(row)
                  const active = selectedId === id
                  return (
                    <tr
                      key={id}
                      className={active ? 'row-selected' : undefined}
                      onClick={() => onSelect?.(row)}
                    >
                      <td>
                        <input type="radio" readOnly checked={active} aria-label="Seleccionar" />
                      </td>
                      {enhanced.map((col) => (
                        <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Panel>
  )
}

export function CrudSelectionCard({
  title,
  emptyText,
  selected,
  fields,
  onEdit,
  onDelete,
  onClear,
}) {
  if (!selected) {
    return (
      <Panel title={title} subtitle="Selecciona un registro de la tabla para ver / editar / eliminar">
        <div className="state-box">{emptyText}</div>
      </Panel>
    )
  }

  return (
    <Panel title={title} subtitle="Registro activo — operaciones U y D">
      <dl className="crud-detail">
        {fields.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value ?? '—'}</dd>
          </div>
        ))}
      </dl>
      <div className="crud-detail-actions">
        <button type="button" className="btn btn-ghost" onClick={onClear}>
          Quitar selección
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          Editar (U)
        </button>
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          Eliminar (D)
        </button>
      </div>
    </Panel>
  )
}

export function CrudModal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="crud-ops-kicker">Formulario CRUD</p>
            <h3>{title}</h3>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export { Badge, DataTable }
