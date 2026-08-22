import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'olist_crm_session'

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession())

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login(nextUser) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
      },
      logout() {
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
