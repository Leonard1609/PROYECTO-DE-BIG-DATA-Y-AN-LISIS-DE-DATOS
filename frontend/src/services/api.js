import { deleteJson, getJson, postJson, putJson, useMock } from './client'
import {
  mockCategories,
  mockCustomers,
  mockKpis,
  mockLogistics,
  mockLtvByRegion,
  mockOrders,
  mockPaymentsRetention,
  mockRfm,
  mockSalesHistory,
} from './mocks'

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

let customersStore = [...mockCustomers]
let ordersStore = [...mockOrders]

function filterRows(rows, { q, state, status } = {}) {
  let list = [...rows]
  if (q) {
    const needle = q.toLowerCase()
    list = list.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(needle)),
    )
  }
  if (state) list = list.filter((r) => r.customer_state === state)
  if (status) list = list.filter((r) => r.order_status === status)
  return list
}

/** Capa única de datos: mock local o API PHP del compañero. */
export const api = {
  mode: useMock ? 'mock' : 'api',

  async getKpis() {
    if (useMock) {
      await delay()
      return mockKpis
    }
    return getJson('/dashboard/kpis')
  },

  async getCustomers(params = {}) {
    if (useMock) {
      await delay()
      return { data: filterRows(customersStore, params), total: customersStore.length }
    }
    return getJson('/customers', params)
  },

  async createCustomer(payload) {
    if (useMock) {
      await delay()
      const row = {
        ...payload,
        customer_id: `c${Date.now()}`,
        orders_count: 0,
        total_spent: 0,
        segment: 'Nuevo',
      }
      customersStore = [row, ...customersStore]
      return row
    }
    return postJson('/customers', payload)
  },

  async updateCustomer(id, payload) {
    if (useMock) {
      await delay()
      customersStore = customersStore.map((c) =>
        c.customer_id === id ? { ...c, ...payload } : c,
      )
      return customersStore.find((c) => c.customer_id === id)
    }
    return putJson(`/customers/${id}`, payload)
  },

  async deleteCustomer(id) {
    if (useMock) {
      await delay()
      customersStore = customersStore.filter((c) => c.customer_id !== id)
      return { ok: true }
    }
    return deleteJson(`/customers/${id}`)
  },

  async getOrders(params = {}) {
    if (useMock) {
      await delay()
      return { data: filterRows(ordersStore, params), total: ordersStore.length }
    }
    return getJson('/orders', params)
  },

  async createOrder(payload) {
    if (useMock) {
      await delay()
      const row = {
        ...payload,
        order_id: `o${Date.now()}`,
        order_purchase_timestamp: new Date().toISOString(),
        review_score: null,
      }
      ordersStore = [row, ...ordersStore]
      return row
    }
    return postJson('/orders', payload)
  },

  async updateOrder(id, payload) {
    if (useMock) {
      await delay()
      ordersStore = ordersStore.map((o) => (o.order_id === id ? { ...o, ...payload } : o))
      return ordersStore.find((o) => o.order_id === id)
    }
    return putJson(`/orders/${id}`, payload)
  },

  async deleteOrder(id) {
    if (useMock) {
      await delay()
      ordersStore = ordersStore.filter((o) => o.order_id !== id)
      return { ok: true }
    }
    return deleteJson(`/orders/${id}`)
  },

  async getRfmReport() {
    if (useMock) {
      await delay()
      return mockRfm
    }
    return getJson('/reports/rfm')
  },

  async getLogisticsReport() {
    if (useMock) {
      await delay()
      return { buckets: mockLogistics }
    }
    return getJson('/reports/logistics-satisfaction')
  },

  async getLtvReport() {
    if (useMock) {
      await delay()
      return { regions: mockLtvByRegion }
    }
    return getJson('/reports/ltv-by-region')
  },

  async getPaymentsReport() {
    if (useMock) {
      await delay()
      return { methods: mockPaymentsRetention }
    }
    return getJson('/reports/payments-retention')
  },

  async getSalesHistory() {
    if (useMock) {
      await delay()
      return { series: mockSalesHistory }
    }
    return getJson('/reports/sales-history')
  },

  async getCategories() {
    if (useMock) {
      await delay()
      return { categories: mockCategories }
    }
    return getJson('/reports/categories')
  },
}
