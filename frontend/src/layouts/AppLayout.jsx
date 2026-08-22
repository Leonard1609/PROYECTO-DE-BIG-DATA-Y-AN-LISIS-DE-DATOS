import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const links = [
  { to: '/', label: 'Panel general', end: true },
  { to: '/clientes', label: 'Gestión de clientes' },
  { to: '/pedidos', label: 'Gestión de pedidos' },
]

const reports = [
  { to: '/reportes/rfm', label: 'RFM / Segmentación' },
  { to: '/reportes/logistica', label: 'Logística vs reviews' },
  { to: '/reportes/ltv', label: 'LTV por región' },
  { to: '/reportes/pagos', label: 'Pagos vs retención' },
]

const titles = {
  '/': ['Panel general', 'Sistema CRM analítico — visión operativa y comercial'],
  '/clientes': ['Gestión de clientes', 'Registrar, editar, eliminar, consultar, buscar y filtrar'],
  '/pedidos': ['Gestión de pedidos', 'Control de órdenes, estados, pagos y entregas'],
  '/reportes/rfm': ['Reporte RFM', 'Segmentación automática: VIP, leales, en riesgo y perdidos'],
  '/reportes/logistica': [
    'Logística vs satisfacción',
    'Correlación entre retraso de entrega y review_score',
  ],
  '/reportes/ltv': ['LTV por región', 'Ticket, flete y valor de vida por customer_state'],
  '/reportes/pagos': ['Pagos vs retención', 'Métodos de pago, cuotas y tasa de cancelación'],
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [title, subtitle] = titles[pathname] || ['Olist CRM Pulse', 'Sistema analítico']

  function onLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="brand-kicker">Sistema · Big Data</p>
          <h1>Olist CRM Pulse</h1>
          <p className="brand-sub">Plataforma analítica de e-commerce</p>
        </div>

        <nav className="nav">
          <div className="nav-section">Módulos del sistema</div>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          <div className="nav-section">Inteligencia / Reportes</div>
          {reports.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <p className="stack-note">Arquitectura: React · PHP · MySQL (`olist_crm_db`)</p>
          <span className={`mode-pill ${api.mode === 'api' ? 'api' : ''}`}>
            {api.mode === 'mock' ? 'Desarrollo (datos locales)' : 'Conectado a API PHP'}
          </span>
          <button type="button" className="btn btn-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
