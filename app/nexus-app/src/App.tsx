import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { authStorage } from '../src/utils/authStorage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BigDataModulePage } from './pages/BigDataModulePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // 1. AUTO-LOGIN al cargar la aplicación desde authStorage
  useEffect(() => {
    const session = authStorage.get();
    if (session?.email) {
      setUserEmail(session.email);
      setIsAuthenticated(true);
    }
  }, []);

  // 2. MANEJAR LOGIN EXITOSO
  const handleLoginSuccess = (email: string, usuarioData?: any) => {
    authStorage.set(email, usuarioData);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  // 3. MANEJAR CERRAR SESIÓN
  const handleLogout = () => {
    authStorage.clear();
    setIsAuthenticated(false);
    setUserEmail('');
  };

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Dashboard Principal */}
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

      {/* Módulo Big Data Analytics */}
      <Route
        path="/big-data/*"
        element={
          isAuthenticated ? (
            <BigDataModulePage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Fallback general */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;