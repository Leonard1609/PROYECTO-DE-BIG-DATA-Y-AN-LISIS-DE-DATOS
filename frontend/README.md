# Olist CRM Pulse — Frontend del sistema

Capa de presentación del **sistema CRM analítico** (React + PHP + MySQL).

- Este repositorio/carpeta: **solo frontend**
- Backend PHP y MySQL (`olist_crm_db`): a cargo del compañero
- Contrato de integración: [API_CONTRACT.md](./API_CONTRACT.md)

## Arranque

```bash
cd frontend
npm install
npm run dev
```

Flujo del sistema en UI:

1. Acceso (`/login`)
2. Panel general
3. Módulos de gestión (clientes / pedidos)
4. Módulos de reportes (RFM, logística, LTV, pagos)

Sin `.env` usa datos locales de desarrollo. Con `VITE_API_URL` consume la API PHP real.

## Conectar al backend

1. Copia `.env.example` → `.env`
2. Define `VITE_API_URL`
3. Reinicia `npm run dev`
