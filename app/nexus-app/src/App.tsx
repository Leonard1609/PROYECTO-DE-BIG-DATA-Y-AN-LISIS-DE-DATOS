import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Almacenamiento de sesión
import { authStorage } from './utils/authStorage';

// Estilos del selector de tema y modo oscuro del dashboard
import './shared/styles/nexus-theme.css';
import { ThemeProvider } from './shared/context/ThemeContext';

// Páginas Principales
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProyectoDetallePage } from './pages/ProyectoDetallePage';

// Módulos
import { BigDataModulePage } from './modules/big-data/BigDataModulePage';
import { AzureFacialRecognitionPage } from './modules/azure/AzureModulePage';

// Pantalla a la que se llega al entrar o al salir de un módulo
const HOME_PATH = '/dashboard/proyectos';

function AppRoutes() {
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
            <Navigate to={HOME_PATH} replace />
          ) : (
            <LoginPage onLoginSuccess={handleLogin} />
          )
        }
      />

      {/* 2. Dashboard Principal: una URL por sección (proyectos, accesos, mensajes, perfil) */}
      <Route path="/dashboard" element={<Navigate to={HOME_PATH} replace />} />
      <Route
        path="/dashboard/:section"
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


      {/* 5. Módulo Azure */}
      <Route
        path="/azure"
        element={
          isAuthenticated ? <AzureFacialRecognitionPage /> : <Navigate to="/" replace />
        }
      />

      {/* 7. Detalle de Proyectos genéricos */}
      <Route
        path="/proyecto/:id"
        element={
          isAuthenticated ? <ProyectoDetallePage /> : <Navigate to="/" replace />
        }
      />

      {/* 8. Redirección para rutas no encontradas (404) */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? HOME_PATH : '/'} replace />}
      />
    </Routes>
  );
}

// El ThemeProvider envuelve toda la app: el selector de apariencia lo necesita en cualquier pantalla
export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
