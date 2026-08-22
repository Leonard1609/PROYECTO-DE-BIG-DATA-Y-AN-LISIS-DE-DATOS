import { useEffect, useMemo, useState } from 'react'
import { Badge, DataTable, ErrorState, LoadingState, Panel } from '../components/ui'
import { api } from '../services/api'

const emptyForm = {
  customer_unique_id: '',
  customer_city: '',
  customer_state: '',
  customer_zip_code_prefix: '',
}

export default function Customers() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [state, setState] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load(params = {}) {
    try {
      setLoading(true)
      setError('')
      const res = await api.getCustomers(params)
      setRows(res.data || [])
    } catch (e) {
      setError(e.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const states = useMemo(
    () => [...new Set(rows.map((r) => r.customer_state).filter(Boolean))].sort(),
    [rows],
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm({
      customer_unique_id: row.customer_unique_id,
      customer_city: row.customer_city,
      customer_state: row.customer_state,
      customer_zip_code_prefix: row.customer_zip_code_prefix,
    })
    setOpen(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        customer_zip_code_prefix: Number(form.customer_zip_code_prefix) || 0,
      }
      if (editing) await api.updateCustomer(editing.customer_id, payload)
      else await api.createCustomer(payload)
      setOpen(false)
      await load({ q, state })
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    await api.deleteCustomer(id)
    await load({ q, state })
  }

  const columns = [
    { key: 'customer_id', label: 'ID' },
    { key: 'customer_city', label: 'Ciudad' },
    { key: 'customer_state', label: 'Estado' },
    {
      key: 'orders_count',
      label: 'Pedidos',
      render: (r) => r.orders_count ?? '—',
    },
    {
      key: 'total_spent',
      label: 'Gasto',
      render: (r) =>
        r.total_spent != null
          ? `R$ ${Number(r.total_spent).toFixed(2)}`
          : '—',
    },
    {
      key: 'segment',
      label: 'Segmento',
      render: (r) => (r.segment ? <Badge value={r.segment} /> : '—'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (r) => (
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={() => openEdit(r)}>
            Editar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onDelete(r.customer_id)}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <Panel
        title="Gestión de clientes"
        subtitle="Registrar · editar · eliminar · consultar · buscar · filtrar"
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Nuevo cliente
          </button>
        }
      >
        <div className="toolbar">
          <input
            className="input"
            placeholder="Buscar…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="select" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Todos los estados</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost" onClick={() => load({ q, state })}>
            Filtrar
          </button>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.customer_id} />
        )}
      </Panel>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Unique ID
                <input
                  className="input"
                  required
                  value={form.customer_unique_id}
                  onChange={(e) => setForm({ ...form, customer_unique_id: e.target.value })}
                />
              </label>
              <label>
                Ciudad
                <input
                  className="input"
                  required
                  value={form.customer_city}
                  onChange={(e) => setForm({ ...form, customer_city: e.target.value })}
                />
              </label>
              <label>
                Estado (UF)
                <input
                  className="input"
                  required
                  maxLength={2}
                  value={form.customer_state}
                  onChange={(e) =>
                    setForm({ ...form, customer_state: e.target.value.toUpperCase() })
                  }
                />
              </label>
              <label>
                CEP (prefix)
                <input
                  className="input"
                  required
                  value={form.customer_zip_code_prefix}
                  onChange={(e) =>
                    setForm({ ...form, customer_zip_code_prefix: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
