import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones con rutas y llaves correctas según tus archivos
import { authStorage } from './utils/authStorage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// Importación del Dashboard de CloudOps (ajusta el nombre interno si en su archivo no se llama DashboardPage)
import { DashboardPage as CloudOpsDashboard } from './modules/cloud-ops/pages/DashboardPage';

export default function App() {
  // Inicialización síncrona: evalúa la sesión guardada en localStorage antes del primer renderizado
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = authStorage.get();
    return !!session?.email;
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    const session = authStorage.get();
    return session?.email || '';
  });

  // Re-evaluación por seguridad al montar el componente
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
    <BrowserRouter>
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

        {/* Redirección para cualquier otra ruta no encontrada */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}