import { api } from '../services/api'
import { BrandLogo } from './BrandLogo'

export function SystemHeader({ title, subtitle, user, onLogout }) {
  const today = new Intl.DateTimeFormat('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="system-header">
      <div className="system-header-bar">
        <div className="system-header-brand">
          <BrandLogo variant="mark" />
          <div>
            <strong>Olist CRM Pulse</strong>
            <small>Plataforma Analítica y Gestión de E-commerce</small>
          </div>
        </div>

        <div className="system-header-meta">
          <span className="system-chip">{today}</span>
          <span className={`system-chip ${api.mode === 'api' ? 'is-live' : 'is-dev'}`}>
            {api.mode === 'api' ? 'API en vivo' : 'Modo desarrollo'}
          </span>
          <div className="system-user">
            <span className="system-avatar" aria-hidden="true">
              {(user?.name || 'U').slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
          <button type="button" className="btn btn-ghost system-logout" onClick={onLogout}>
            Salir
          </button>
        </div>
      </div>

      <div className="system-header-page">
        <div>
          <p className="system-breadcrumb">Sistema / Módulo activo</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
    </header>
  )
}

export function SystemFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="system-footer">
      <div className="system-footer-inner">
        <div>
          <strong>Olist CRM Pulse</strong>
          <span>Más que un CRM, tu aliado estratégico para crecer</span>
        </div>
        <div className="system-footer-center">
          <span>React</span>
          <span aria-hidden="true">·</span>
          <span>PHP</span>
          <span aria-hidden="true">·</span>
          <span>MySQL</span>
        </div>
        <div className="system-footer-right">
          <span>v1.0 · Frontend</span>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  )
}

export function AuthChrome({ children }) {
  return (
    <div className="auth-chrome">
      <header className="auth-header">
        <div className="auth-header-brand">
          <BrandLogo variant="mark" className="auth-brand-logo" />
          <strong>Olist CRM Pulse</strong>
        </div>
        <div className="auth-header-right">
          <span className="auth-status">
            <span className="auth-status-dot" aria-hidden="true" />
            Sistema en línea
          </span>
          <a className="auth-support" href="mailto:soporte@olistcrm.pulse">
            Soporte Técnico
          </a>
        </div>
      </header>

      {children}

      <footer className="auth-footer">
        <p className="auth-footer-left">
          © 2026 Olist CRM Pulse. Todos los derechos reservados.
        </p>
        <p className="auth-footer-center">Desarrollado con React · PHP · MySQL</p>
        <div className="auth-footer-right">
          <a href="#terminos">Términos</a>
          <a href="#privacidad">Privacidad</a>
        </div>
      </footer>
    </div>
  )
}
