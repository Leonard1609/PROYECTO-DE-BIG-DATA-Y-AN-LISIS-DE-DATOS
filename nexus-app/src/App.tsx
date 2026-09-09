import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
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