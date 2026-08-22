import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('Beatriz')
  const [role, setRole] = useState('Analista CRM')

  if (isAuthenticated) return <Navigate to="/" replace />

  function onSubmit(e) {
    e.preventDefault()
    login({
      name: name.trim() || 'Analista',
      role: role.trim() || 'Analista CRM',
      enteredAt: new Date().toISOString(),
    })
    navigate('/')
  }

  return (
    <div className="login-screen">
      <div className="login-visual" aria-hidden="true">
        <div className="login-visual-inner">
          <p className="brand-kicker">Big Data · React · PHP · MySQL</p>
          <h1>Olist CRM Pulse</h1>
          <p>
            Sistema analítico de segmentación, retención y experiencia del cliente sobre
            datos transaccionales de e-commerce.
          </p>
          <ul className="login-points">
            <li>Gestión de clientes y pedidos</li>
            <li>Reportes RFM, LTV, logística y pagos</li>
            <li>Arquitectura desacoplada frontend ↔ API</li>
          </ul>
        </div>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <p className="brand-kicker">Acceso al sistema</p>
          <h2>Iniciar sesión</h2>
          <p className="login-help">
            Módulo de presentación. Cuando el backend esté listo, este acceso se conectará
            a autenticación PHP.
          </p>

          <label>
            Nombre de usuario
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label>
            Rol en el sistema
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Analista CRM</option>
              <option>Marketing</option>
              <option>Operaciones</option>
              <option>Administrador</option>
            </select>
          </label>

          <button type="submit" className="btn btn-primary login-submit">
            Entrar al sistema
          </button>
        </form>
      </div>
    </div>
  )
}
