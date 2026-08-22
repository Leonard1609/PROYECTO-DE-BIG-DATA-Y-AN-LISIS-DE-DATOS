/** Datos mock alineados al esquema olist_crm_db (para desarrollo sin backend). */

export const mockKpis = {
  totalCustomers: 99441,
  totalOrders: 99441,
  avgTicket: 136.48,
  cancelRate: 0.0062,
  avgReviewScore: 4.08,
  atRiskCustomers: 18240,
}

export const mockCustomers = [
  {
    customer_id: 'c001',
    customer_unique_id: 'u001',
    customer_city: 'sao paulo',
    customer_state: 'SP',
    customer_zip_code_prefix: 1301,
    orders_count: 5,
    total_spent: 842.5,
    segment: 'VIP',
  },
  {
    customer_id: 'c002',
    customer_unique_id: 'u002',
    customer_city: 'rio de janeiro',
    customer_state: 'RJ',
    customer_zip_code_prefix: 20040,
    orders_count: 3,
    total_spent: 410.2,
    segment: 'Leal',
  },
  {
    customer_id: 'c003',
    customer_unique_id: 'u003',
    customer_city: 'belo horizonte',
    customer_state: 'MG',
    customer_zip_code_prefix: 30130,
    orders_count: 1,
    total_spent: 89.9,
    segment: 'En riesgo',
  },
  {
    customer_id: 'c004',
    customer_unique_id: 'u004',
    customer_city: 'curitiba',
    customer_state: 'PR',
    customer_zip_code_prefix: 80010,
    orders_count: 2,
    total_spent: 221.0,
    segment: 'Leal',
  },
  {
    customer_id: 'c005',
    customer_unique_id: 'u005',
    customer_city: 'salvador',
    customer_state: 'BA',
    customer_zip_code_prefix: 40020,
    orders_count: 1,
    total_spent: 45.0,
    segment: 'Perdido',
  },
  {
    customer_id: 'c006',
    customer_unique_id: 'u006',
    customer_city: 'porto alegre',
    customer_state: 'RS',
    customer_zip_code_prefix: 90010,
    orders_count: 4,
    total_spent: 678.3,
    segment: 'VIP',
  },
]

export const mockOrders = [
  {
    order_id: 'o1001',
    customer_id: 'c001',
    order_status: 'delivered',
    order_purchase_timestamp: '2018-06-12T14:22:00',
    order_delivered_customer_date: '2018-06-20T10:00:00',
    order_estimated_delivery_date: '2018-06-22T00:00:00',
    payment_type: 'credit_card',
    payment_value: 189.9,
    review_score: 5,
  },
  {
    order_id: 'o1002',
    customer_id: 'c002',
    order_status: 'delivered',
    order_purchase_timestamp: '2018-07-01T09:10:00',
    order_delivered_customer_date: '2018-07-18T16:30:00',
    order_estimated_delivery_date: '2018-07-12T00:00:00',
    payment_type: 'boleto',
    payment_value: 120.5,
    review_score: 2,
  },
  {
    order_id: 'o1003',
    customer_id: 'c003',
    order_status: 'canceled',
    order_purchase_timestamp: '2018-05-20T11:00:00',
    order_delivered_customer_date: null,
    order_estimated_delivery_date: '2018-05-28T00:00:00',
    payment_type: 'boleto',
    payment_value: 89.9,
    review_score: null,
  },
  {
    order_id: 'o1004',
    customer_id: 'c004',
    order_status: 'delivered',
    order_purchase_timestamp: '2018-08-03T18:40:00',
    order_delivered_customer_date: '2018-08-08T12:00:00',
    order_estimated_delivery_date: '2018-08-10T00:00:00',
    payment_type: 'credit_card',
    payment_value: 221.0,
    review_score: 4,
  },
  {
    order_id: 'o1005',
    customer_id: 'c005',
    order_status: 'canceled',
    order_purchase_timestamp: '2018-04-11T08:15:00',
    order_delivered_customer_date: null,
    order_estimated_delivery_date: '2018-04-20T00:00:00',
    payment_type: 'voucher',
    payment_value: 45.0,
    review_score: null,
  },
  {
    order_id: 'o1006',
    customer_id: 'c006',
    order_status: 'shipped',
    order_purchase_timestamp: '2018-08-15T13:05:00',
    order_delivered_customer_date: null,
    order_estimated_delivery_date: '2018-08-25T00:00:00',
    payment_type: 'credit_card',
    payment_value: 312.4,
    review_score: null,
  },
]

export const mockRfm = {
  segments: [
    { segment: 'VIP', count: 8200, avg_monetary: 620, color: '#0f766e' },
    { segment: 'Leales', count: 21400, avg_monetary: 280, color: '#1d4ed8' },
    { segment: 'En riesgo', count: 18240, avg_monetary: 95, color: '#c2410c' },
    { segment: 'Perdidos', count: 51601, avg_monetary: 42, color: '#64748b' },
  ],
  scatter: [
    { recency: 12, frequency: 5, monetary: 820, segment: 'VIP' },
    { recency: 28, frequency: 3, monetary: 410, segment: 'Leales' },
    { recency: 95, frequency: 1, monetary: 90, segment: 'En riesgo' },
    { recency: 210, frequency: 1, monetary: 45, segment: 'Perdidos' },
    { recency: 18, frequency: 4, monetary: 678, segment: 'VIP' },
    { recency: 40, frequency: 2, monetary: 221, segment: 'Leales' },
    { recency: 120, frequency: 1, monetary: 110, segment: 'En riesgo' },
    { recency: 180, frequency: 1, monetary: 55, segment: 'Perdidos' },
    { recency: 8, frequency: 6, monetary: 980, segment: 'VIP' },
    { recency: 55, frequency: 2, monetary: 190, segment: 'Leales' },
  ],
}

export const mockLogistics = [
  { delay_bucket: 'A tiempo', avg_review: 4.6, orders: 42000 },
  { delay_bucket: '1-3 días', avg_review: 4.1, orders: 28000 },
  { delay_bucket: '4-7 días', avg_review: 3.2, orders: 15000 },
  { delay_bucket: '8+ días', avg_review: 2.1, orders: 8000 },
]

export const mockLtvByRegion = [
  { customer_state: 'SP', avg_ticket: 148.2, avg_freight: 18.4, ltv: 312.5, customers: 42000 },
  { customer_state: 'RJ', avg_ticket: 142.1, avg_freight: 22.8, ltv: 265.0, customers: 14000 },
  { customer_state: 'MG', avg_ticket: 131.0, avg_freight: 24.1, ltv: 210.4, customers: 11000 },
  { customer_state: 'RS', avg_ticket: 139.5, avg_freight: 26.5, ltv: 245.2, customers: 6500 },
  { customer_state: 'PR', avg_ticket: 136.8, avg_freight: 23.0, ltv: 228.7, customers: 5800 },
  { customer_state: 'BA', avg_ticket: 118.4, avg_freight: 34.2, ltv: 145.0, customers: 4200 },
  { customer_state: 'SC', avg_ticket: 133.2, avg_freight: 25.8, ltv: 220.1, customers: 3900 },
  { customer_state: 'GO', avg_ticket: 125.6, avg_freight: 28.9, ltv: 180.3, customers: 2500 },
]

export const mockPaymentsRetention = [
  { payment_type: 'credit_card', installments_bucket: '1', orders: 32000, cancel_rate: 0.004 },
  { payment_type: 'credit_card', installments_bucket: '2-5', orders: 28000, cancel_rate: 0.006 },
  { payment_type: 'credit_card', installments_bucket: '6+', orders: 15000, cancel_rate: 0.009 },
  { payment_type: 'boleto', installments_bucket: '1', orders: 18000, cancel_rate: 0.018 },
  { payment_type: 'voucher', installments_bucket: '1', orders: 5000, cancel_rate: 0.011 },
  { payment_type: 'debit_card', installments_bucket: '1', orders: 1400, cancel_rate: 0.005 },
]

export const mockSalesHistory = [
  { period: '2017-Q3', orders: 8200, revenue: 980000 },
  { period: '2017-Q4', orders: 14500, revenue: 1780000 },
  { period: '2018-Q1', orders: 21000, revenue: 2650000 },
  { period: '2018-Q2', orders: 28500, revenue: 3520000 },
  { period: '2018-Q3', orders: 27200, revenue: 3410000 },
]

export const mockCategories = [
  { category: 'beleza_saude', sales: 9800 },
  { category: 'relogios_presentes', sales: 7200 },
  { category: 'cama_mesa_banho', sales: 6800 },
  { category: 'esporte_lazer', sales: 6100 },
  { category: 'informatica_acessorios', sales: 5400 },
]
