import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboard } from '../pages/AdminDashboard';
import { EmployeeDashboard } from '../pages/EmployeeDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowed: string[] }> = ({ children, allowed }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.cargo)) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowed={['Administrador', 'Analista BI']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowed={['Empleado', 'Asesor CRM']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};