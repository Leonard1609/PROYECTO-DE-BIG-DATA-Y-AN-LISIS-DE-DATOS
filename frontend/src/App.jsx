import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Customers from './pages/Customers'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Orders from './pages/Orders'
import LogisticsReport from './pages/reports/LogisticsReport'
import LtvReport from './pages/reports/LtvReport'
import PaymentsReport from './pages/reports/PaymentsReport'
import RfmReport from './pages/reports/RfmReport'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<Customers />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="reportes/rfm" element={<RfmReport />} />
              <Route path="reportes/logistica" element={<LogisticsReport />} />
              <Route path="reportes/ltv" element={<LtvReport />} />
              <Route path="reportes/pagos" element={<PaymentsReport />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
