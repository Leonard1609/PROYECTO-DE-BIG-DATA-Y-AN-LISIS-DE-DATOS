import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../components/BrandLogo'
import { AuthChrome } from '../components/SystemChrome'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('Beatriz')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Analista CRM')

  if (isAuthenticated) return <Navigate to="/" replace />

  function onSubmit(e) {
    e.preventDefault()
    login({
      name: name.trim() || 'Analista',
      role: role.trim() || 'Analista CRM',
      email: email.trim() || undefined,
      enteredAt: new Date().toISOString(),
    })
    navigate('/')
  }

  const isRegister = mode === 'register'

  return (
    <AuthChrome>
      <div className="login-screen">
        <div className="login-visual">
          <div className="login-visual-inner">
            <h1>Olist CRM Pulse</h1>
            <p className="login-subtitle">Plataforma Analítica y Gestión de E-commerce</p>
            <div className="login-divider" aria-hidden="true" />
            <p className="login-description">
              El centro de mando que unifica la gestión operativa de tus ventas con
              inteligencia de negocios.
            </p>
            <p className="login-description login-description-soft">
              Controla clientes y pedidos en tiempo real mientras el sistema analiza
              automáticamente la retención, el comportamiento de compra y la experiencia
              logística.
            </p>
          </div>
        </div>

        <div className="login-panel">
          <form className="login-card login-card-lg" onSubmit={onSubmit}>
            <div className="login-card-brand">
              <BrandLogo variant="full" className="login-card-logo" />
            </div>

            <p className="brand-kicker">
              {isRegister ? 'Crear cuenta' : 'Acceso al sistema'}
            </p>
            <h2>{isRegister ? 'Registrarse' : 'Iniciar sesión'}</h2>
            <p className="login-help">
              {isRegister
                ? 'Complete sus datos para crear una cuenta en el sistema.'
                : 'Ingrese su nombre y seleccione su rol en el sistema.'}
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

            {isRegister ? (
              <>
                <label>
                  Correo electrónico
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </label>
              </>
            ) : null}

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
              {isRegister ? 'Crear cuenta' : 'Entrar al sistema'}
            </button>

            <p className="login-switch">
              {isRegister ? (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" className="login-switch-btn" onClick={() => setMode('login')}>
                    Iniciar sesión
                  </button>
                </>
              ) : (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    className="login-switch-btn"
                    onClick={() => setMode('register')}
                  >
                    Registrarse
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </AuthChrome>
  )
}
