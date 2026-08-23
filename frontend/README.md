# Olist CRM Pulse — Frontend

Capa de presentación del sistema CRM analítico (React + PHP + MySQL).

**Todo el frontend vive solo en esta carpeta:** `frontend/`

## Stack

- Vite + React
- React Router
- Recharts (gráficos avanzados)
- Axios

## Arranque

```bash
cd frontend
npm install
npm run dev
```

Abre: http://localhost:5173/

## Qué incluye

- Login / Registro
- Panel general (KPIs + gráficos)
- CRUD de clientes y pedidos
- Reportes: RFM, logística, LTV, pagos
- Header / Footer del sistema
- Logo Olist CRM Pulse
- Contrato API para backend: [API_CONTRACT.md](./API_CONTRACT.md)

## Datos

Sin `.env` → **modo desarrollo (mocks)**  
Con backend PHP:

1. Copia `.env.example` → `.env`
2. Define:

```env
VITE_API_URL=http://localhost/ruta-de-tu-backend
```

3. Reinicia `npm run dev`

## Rama

Trabajo en: `Beatriz-frontend`
