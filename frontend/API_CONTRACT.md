# API Contract — Olist CRM Pulse (Frontend ↔ PHP)

Base URL: valor de `VITE_API_URL` (ej. `http://localhost/olist-crm/api`)

El frontend **no** consulta MySQL. Espera JSON ya agregado.

Si `VITE_API_URL` no está definido, corre en modo **MOCK**.

## Endpoints

### `GET /dashboard/kpis`
```json
{
  "totalCustomers": 99441,
  "totalOrders": 99441,
  "avgTicket": 136.48,
  "cancelRate": 0.0062,
  "avgReviewScore": 4.08,
  "atRiskCustomers": 18240
}
```

### `GET /customers?q=&state=`
```json
{
  "data": [
    {
      "customer_id": "string",
      "customer_unique_id": "string",
      "customer_city": "string",
      "customer_state": "SP",
      "customer_zip_code_prefix": 1301,
      "orders_count": 3,
      "total_spent": 410.2,
      "segment": "VIP | Leal | En riesgo | Perdido"
    }
  ],
  "total": 1
}
```

### `POST /customers` · `PUT /customers/:id` · `DELETE /customers/:id`
Body create/update:
```json
{
  "customer_unique_id": "string",
  "customer_city": "string",
  "customer_state": "SP",
  "customer_zip_code_prefix": 1301
}
```

### `GET /orders?q=&status=`
```json
{
  "data": [
    {
      "order_id": "string",
      "customer_id": "string",
      "order_status": "delivered | shipped | canceled | invoiced",
      "order_purchase_timestamp": "2018-06-12T14:22:00",
      "order_delivered_customer_date": "2018-06-20T10:00:00",
      "order_estimated_delivery_date": "2018-06-22T00:00:00",
      "payment_type": "credit_card",
      "payment_value": 189.9,
      "review_score": 5
    }
  ],
  "total": 1
}
```

### `POST /orders` · `PUT /orders/:id` · `DELETE /orders/:id`

### `GET /reports/rfm`
```json
{
  "segments": [
    { "segment": "VIP", "count": 8200, "avg_monetary": 620, "color": "#0f766e" }
  ],
  "scatter": [
    { "recency": 12, "frequency": 5, "monetary": 820, "segment": "VIP" }
  ]
}
```

### `GET /reports/logistics-satisfaction`
```json
{
  "buckets": [
    { "delay_bucket": "A tiempo", "avg_review": 4.6, "orders": 42000 }
  ]
}
```

### `GET /reports/ltv-by-region`
```json
{
  "regions": [
    {
      "customer_state": "SP",
      "avg_ticket": 148.2,
      "avg_freight": 18.4,
      "ltv": 312.5,
      "customers": 42000
    }
  ]
}
```

### `GET /reports/payments-retention`
```json
{
  "methods": [
    {
      "payment_type": "boleto",
      "installments_bucket": "1",
      "orders": 18000,
      "cancel_rate": 0.018
    }
  ]
}
```

### `GET /reports/sales-history`
```json
{
  "series": [{ "period": "2018-Q2", "orders": 28500, "revenue": 3520000 }]
}
```

### `GET /reports/categories`
```json
{
  "categories": [{ "category": "beleza_saude", "sales": 9800 }]
}
```

## Tablas MySQL de referencia (`olist_crm_db`)

### Cómo se conectan (ER — no olvidar)

```
olist_orders_dataset  (hub)
  ├─ order_id      → olist_order_reviews_dataset
  ├─ order_id      → olist_order_payments_dataset
  ├─ order_id      → olist_order_items_dataset
  │                    ├─ product_id → olist_products_dataset
  │                    └─ seller_id  → olist_sellers_dataset
  │                                      └─ zip_code_prefix → olist_geolocation_dataset
  └─ customer_id   → olist_order_customer_dataset
                       └─ zip_code_prefix → olist_geolocation_dataset
```

| Desde | Llave | Hacia |
|-------|-------|-------|
| orders | `order_id` | reviews, payments, items |
| orders | `customer_id` | customers |
| items | `product_id` | products |
| items | `seller_id` | sellers |
| customers / sellers | `zip_code_prefix` | geolocation |

Tablas:
- `olist_order_customer_dataset`
- `olist_orders_dataset`
- `olist_order_items_dataset`
- `olist_order_payments_dataset`
- `olist_order_reviews_dataset`
- `olist_products_dataset`
- `olist_sellers_dataset`
- `olist_geolocation_dataset`

## CORS

El backend PHP debe permitir el origen del Vite (`http://localhost:5173`) en desarrollo.
