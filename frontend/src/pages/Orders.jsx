import { useEffect, useState } from 'react'
import { Badge, DataTable, ErrorState, LoadingState, Panel } from '../components/ui'
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
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load(params = {}) {
    try {
      setLoading(true)
      setError('')
      const res = await api.getOrders(params)
      setRows(res.data || [])
    } catch (e) {
      setError(e.message || 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(row) {
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
    if (!confirm('¿Eliminar este pedido?')) return
    await api.deleteOrder(id)
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
      label: 'Acciones',
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

  return (
    <>
      <Panel
        title="Gestión de pedidos"
        subtitle="Estados, pagos y fechas de entrega"
        action={
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Nuevo pedido
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
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="delivered">delivered</option>
            <option value="shipped">shipped</option>
            <option value="canceled">canceled</option>
          </select>
          <button type="button" className="btn btn-ghost" onClick={() => load({ q, status })}>
            Filtrar
          </button>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.order_id} />
        )}
      </Panel>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Editar pedido' : 'Nuevo pedido'}</h3>
            <form className="form-grid" onSubmit={onSubmit}>
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
                Estado
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
