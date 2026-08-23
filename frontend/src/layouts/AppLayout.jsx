import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { SystemFooter, SystemHeader } from '../components/SystemChrome'
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
  '/': ['Panel general', 'Visión operativa y comercial del CRM analítico'],
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
          <BrandLogo variant="full" className="sidebar-logo" />
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
          <span className={`mode-pill ${api.mode === 'api' ? 'api' : ''}`}>
            {api.mode === 'mock' ? 'Desarrollo (datos locales)' : 'Conectado a API PHP'}
          </span>
        </div>
      </aside>

      <div className="main">
        <SystemHeader title={title} subtitle={subtitle} user={user} onLogout={onLogout} />
        <main className="content">
          <Outlet />
        </main>
        <SystemFooter />
      </div>
    </div>
  )
}
