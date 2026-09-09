import React, { useState, useEffect } from 'react';
import { authStorage } from './utils/authStorage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // 1. AUTO-LOGIN al cargar la aplicación
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
    <div>
      {isAuthenticated ? (
        <DashboardPage userEmail={userEmail} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;