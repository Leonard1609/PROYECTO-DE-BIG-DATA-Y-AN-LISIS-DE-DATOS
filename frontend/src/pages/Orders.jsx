import { useEffect, useState } from 'react'
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
  customer_id: '',
  order_status: 'delivered',
  order_estimated_delivery_date: '',
  payment_type: 'credit_card',
  payment_value: '',
  order_delivered_customer_date: '',
}

export default function Orders() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load(params = {}) {
    try {
      setLoading(true)
      setError('')
      const res = await api.getOrders(params)
      const data = res.data || []
      setRows(data)
      if (selected) {
        const still = data.find((r) => r.order_id === selected.order_id)
        setSelected(still || null)
      }
    } catch (e) {
      setError(e.message || 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(row) {
    setSelected(row)
    setEditing(row)
    setForm({
      customer_id: row.customer_id,
      order_status: row.order_status,
      order_estimated_delivery_date: row.order_estimated_delivery_date?.slice(0, 16) || '',
      payment_type: row.payment_type || 'credit_card',
      payment_value: row.payment_value ?? '',
      order_delivered_customer_date: row.order_delivered_customer_date?.slice(0, 16) || '',
    })
    setOpen(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        payment_value: Number(form.payment_value) || 0,
        order_delivered_customer_date: form.order_delivered_customer_date || null,
      }
      if (editing) await api.updateOrder(editing.order_id, payload)
      else await api.createOrder(payload)
      setOpen(false)
      await load({ q, status })
    } catch (err) {
      setError(err.message || 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('¿Eliminar este pedido? Esta acción es la operación D del CRUD.')) return
    await api.deleteOrder(id)
    setSelected(null)
    await load({ q, status })
  }

  const columns = [
    { key: 'order_id', label: 'Pedido' },
    { key: 'customer_id', label: 'Cliente' },
    {
      key: 'order_status',
      label: 'Estado',
      render: (r) => <Badge value={r.order_status} />,
    },
    {
      key: 'order_purchase_timestamp',
      label: 'Compra',
      render: (r) => r.order_purchase_timestamp?.replace('T', ' ').slice(0, 16),
    },
    { key: 'payment_type', label: 'Pago' },
    {
      key: 'payment_value',
      label: 'Monto',
      render: (r) => `R$ ${Number(r.payment_value || 0).toFixed(2)}`,
    },
    {
      key: 'review_score',
      label: 'Review',
      render: (r) => r.review_score ?? '—',
    },
    {
      key: 'actions',
      label: 'CRUD',
      render: (r) => (
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={() => openEdit(r)}>
            Editar
          </button>
          <button type="button" className="btn btn-danger" onClick={() => onDelete(r.order_id)}>
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
        entityLabel="Gestión de pedidos"
        total={rows.length}
        hasSelection={Boolean(selected)}
        onCreate={openCreate}
        onConsult={focusQuery}
        onEdit={() => openEdit(selected)}
        onDelete={() => onDelete(selected.order_id)}
        createLabel="Registrar pedido (C)"
      />

      <CrudQueryBar
        onClear={() => {
          setQ('')
          setStatus('')
          load()
        }}
        onApply={() => load({ q, status })}
      >
        <input
          className="input"
          placeholder="Buscar por pedido, cliente, pago…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="delivered">delivered</option>
          <option value="shipped">shipped</option>
          <option value="canceled">canceled</option>
          <option value="invoiced">invoiced</option>
        </select>
      </CrudQueryBar>

      <div className="crud-split">
        <CrudTablePanel
          title="Listado de pedidos (R)"
          subtitle="Haz clic en una fila para seleccionar · tabla olist_orders_dataset"
          loading={loading}
          error={error}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.order_id}
          selectedId={selected?.order_id}
          onSelect={setSelected}
          empty="No hay pedidos con esos filtros"
        />

        <CrudSelectionCard
          title="Registro seleccionado"
          emptyText="Ningún pedido seleccionado"
          selected={selected}
          fields={
            selected
              ? [
                  { label: 'order_id', value: selected.order_id },
                  { label: 'customer_id', value: selected.customer_id },
                  { label: 'Estado', value: selected.order_status },
                  { label: 'Pago', value: selected.payment_type },
                  {
                    label: 'Monto',
                    value: `R$ ${Number(selected.payment_value || 0).toFixed(2)}`,
                  },
                  { label: 'Review', value: selected.review_score ?? '—' },
                  {
                    label: 'Compra',
                    value: selected.order_purchase_timestamp?.replace('T', ' ').slice(0, 16),
                  },
                ]
              : []
          }
          onEdit={() => openEdit(selected)}
          onDelete={() => onDelete(selected.order_id)}
          onClear={() => setSelected(null)}
        />
      </div>

      {open && (
        <CrudModal
          title={editing ? 'Editar pedido (U)' : 'Registrar pedido (C)'}
          onClose={() => setOpen(false)}
        >
          <form className="form-grid form-grid-2" onSubmit={onSubmit}>
            <label>
              Customer ID
              <input
                className="input"
                required
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              />
            </label>
            <label>
              Estado del pedido
              <select
                className="select"
                value={form.order_status}
                onChange={(e) => setForm({ ...form, order_status: e.target.value })}
              >
                <option value="delivered">delivered</option>
                <option value="shipped">shipped</option>
                <option value="canceled">canceled</option>
                <option value="invoiced">invoiced</option>
              </select>
            </label>
            <label>
              Entrega estimada
              <input
                className="input"
                type="datetime-local"
                required
                value={form.order_estimated_delivery_date}
                onChange={(e) =>
                  setForm({ ...form, order_estimated_delivery_date: e.target.value })
                }
              />
            </label>
            <label>
              Entrega real
              <input
                className="input"
                type="datetime-local"
                value={form.order_delivered_customer_date}
                onChange={(e) =>
                  setForm({ ...form, order_delivered_customer_date: e.target.value })
                }
              />
            </label>
            <label>
              Tipo de pago
              <select
                className="select"
                value={form.payment_type}
                onChange={(e) => setForm({ ...form, payment_type: e.target.value })}
              >
                <option value="credit_card">credit_card</option>
                <option value="boleto">boleto</option>
                <option value="voucher">voucher</option>
                <option value="debit_card">debit_card</option>
              </select>
            </label>
            <label>
              Monto
              <input
                className="input"
                type="number"
                step="0.01"
                required
                value={form.payment_value}
                onChange={(e) => setForm({ ...form, payment_value: e.target.value })}
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
