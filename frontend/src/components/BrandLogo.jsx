const LOGO_SRC = '/logo-olist-crm-pulse.jpg'

/** Logo oficial Olist CRM Pulse */
export function BrandLogo({ variant = 'full', className = '' }) {
  const alt = 'Olist CRM Pulse — Plataforma Analítica y Gestión de E-commerce'

  if (variant === 'mark') {
    return (
      <img
        className={`brand-logo brand-logo-mark ${className}`.trim()}
        src={LOGO_SRC}
        alt={alt}
      />
    )
  }

  return (
    <img
      className={`brand-logo brand-logo-full ${className}`.trim()}
      src={LOGO_SRC}
      alt={alt}
    />
  )
}
