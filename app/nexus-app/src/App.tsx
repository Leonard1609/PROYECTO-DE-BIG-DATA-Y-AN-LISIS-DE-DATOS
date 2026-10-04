import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Almacenamiento de sesión
import { authStorage } from './utils/authStorage';

// Páginas Principales
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProyectoDetallePage } from './pages/ProyectoDetallePage';

// Módulos
import { BigDataModulePage } from './modules/big-data/BigDataModulePage';
import { AzureFacialRecognitionPage } from './modules/azure/AzureModulePage';
import CloudOpsModulePage from './modules/cloud-ops/pages/CloudOpsModulePage';

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
      {/* 1. Login / Raíz */}
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

      {/* 2. Dashboard Principal */}
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

      {/* 3. Módulo Big Data (El /* es indispensable para sus subrutas /cargas, /analisis, etc.) */}
      <Route
        path="/big-data/*"
        element={
          isAuthenticated ? <BigDataModulePage /> : <Navigate to="/" replace />
        }
      />

      {/* 4. Módulo CloudOps */}
      <Route
        path="/cloud-ops"
        element={
          isAuthenticated ? <CloudOpsModulePage /> : <Navigate to="/" replace />
        }
      />

      {/* 5. Módulo Azure */}
      <Route
        path="/azure"
        element={
          isAuthenticated ? <AzureFacialRecognitionPage /> : <Navigate to="/" replace />
        }
      />

      {/* 6. Detalle de Proyectos genéricos */}
      <Route
        path="/proyecto/:id"
        element={
          isAuthenticated ? <ProyectoDetallePage /> : <Navigate to="/" replace />
        }
      />

      {/* 7. Redirección para rutas no encontradas (404) */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />}
      />
    </Routes>
  );
}