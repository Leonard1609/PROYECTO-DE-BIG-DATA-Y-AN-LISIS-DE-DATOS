import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  CrudModal,
  CrudOpsBar,
  CrudQueryBar,
  CrudSelectionCard,
  CrudTablePanel,
} from '../components/CrudShell'
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
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load(params = {}) {
    try {
      setLoading(true)
      setError('')
      const res = await api.getCustomers(params)
      const data = res.data || []
      setRows(data)
      if (selected) {
        const still = data.find((r) => r.customer_id === selected.customer_id)
        setSelected(still || null)
      }
    } catch (e) {
      setError(e.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSelected(row)
    setEditing(row)
    setForm({
      customer_unique_id: row.customer_unique_id,
      customer_city: row.customer_city,
      customer_state: row.customer_state,
      customer_zip_code_prefix: String(row.customer_zip_code_prefix ?? ''),
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
    if (!confirm('¿Eliminar este cliente? Esta acción es la operación D del CRUD.')) return
    await api.deleteCustomer(id)
    setSelected(null)
    await load({ q, state })
  }

  const columns = [
    { key: 'customer_id', label: 'ID' },
    { key: 'customer_unique_id', label: 'Unique ID' },
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
        r.total_spent != null ? `R$ ${Number(r.total_spent).toFixed(2)}` : '—',
    },
    {
      key: 'segment',
      label: 'Segmento',
      render: (r) => (r.segment ? <Badge value={r.segment} /> : '—'),
    },
    {
      key: 'actions',
      label: 'CRUD',
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

  function focusQuery() {
    const zone = document.getElementById('crud-query-zone')
    zone?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    zone?.querySelector('input, select')?.focus()
  }

  return (
    <div className="crud-page">
      <CrudOpsBar
        entityLabel="Gestión de clientes"
        total={rows.length}
        hasSelection={Boolean(selected)}
        onCreate={openCreate}
        onConsult={focusQuery}
        onEdit={() => openEdit(selected)}
        onDelete={() => onDelete(selected.customer_id)}
        createLabel="Registrar cliente (C)"
      />

      <CrudQueryBar
        onClear={() => {
          setQ('')
          setState('')
          load()
        }}
        onApply={() => load({ q, state })}
      >
        <input
          className="input"
          placeholder="Buscar por ID, ciudad, estado…"
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
      </CrudQueryBar>

      <div className="crud-split">
        <CrudTablePanel
          title="Listado de clientes (R)"
          subtitle="Haz clic en una fila para seleccionar · tabla olist_order_customer_dataset"
          loading={loading}
          error={error}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.customer_id}
          selectedId={selected?.customer_id}
          onSelect={setSelected}
          empty="No hay clientes con esos filtros"
        />

        <CrudSelectionCard
          title="Registro seleccionado"
          emptyText="Ningún cliente seleccionado"
          selected={selected}
          fields={
            selected
              ? [
                  { label: 'customer_id', value: selected.customer_id },
                  { label: 'customer_unique_id', value: selected.customer_unique_id },
                  { label: 'Ciudad', value: selected.customer_city },
                  { label: 'Estado', value: selected.customer_state },
                  { label: 'CEP prefix', value: selected.customer_zip_code_prefix },
                  { label: 'Segmento', value: selected.segment },
                  {
                    label: 'Gasto',
                    value:
                      selected.total_spent != null
                        ? `R$ ${Number(selected.total_spent).toFixed(2)}`
                        : '—',
                  },
                ]
              : []
          }
          onEdit={() => openEdit(selected)}
          onDelete={() => onDelete(selected.customer_id)}
          onClear={() => setSelected(null)}
        />
      </div>

      {open && (
        <CrudModal
          title={editing ? 'Editar cliente (U)' : 'Registrar cliente (C)'}
          onClose={() => setOpen(false)}
        >
          <form className="form-grid form-grid-2" onSubmit={onSubmit}>
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
            <div className="modal-actions form-span-2">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : editing ? 'Guardar cambios (U)' : 'Crear registro (C)'}
              </button>
            </div>
          </form>
        </CrudModal>
      )}
    </div>
  )
}
