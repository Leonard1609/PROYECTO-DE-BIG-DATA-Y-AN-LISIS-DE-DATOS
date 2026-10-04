import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importaciones con rutas y llaves correctas
import { authStorage } from './utils/authStorage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardPage as CloudOpsDashboard } from './modules/cloud-ops/pages/DashboardPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = authStorage.get();
    return !!session?.email;
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    const session = authStorage.get();
    return session?.email || '';
  });

  useEffect(() => {
    const session = authStorage.get();
    if (session?.email) {
      setUserEmail(session.email);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (email: string) => {
    authStorage.set(email);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authStorage.clear();
    setIsAuthenticated(false);
    setUserEmail('');
  };

  return (
    <Routes>
      {/* Ruta raíz / Login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLogin} />
          )
        }
      />

      {/* Dashboard principal */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardPage userEmail={userEmail} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Módulo CloudOps */}
      <Route
        path="/cloud-ops"
        element={
          isAuthenticated ? (
            <CloudOpsDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Redirección por defecto */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}