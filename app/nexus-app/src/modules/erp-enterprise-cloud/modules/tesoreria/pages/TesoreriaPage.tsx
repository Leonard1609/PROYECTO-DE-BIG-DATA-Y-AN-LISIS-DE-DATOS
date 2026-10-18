import { Routes, Route, Navigate } from 'react-router-dom';
import { CajaPage } from './CajaPage';

export const TesoreriaPage: React.FC = () => (
  <div className="max-w-6xl space-y-6">
    <Routes>
      <Route index element={<Navigate to="caja" replace />} />
      <Route path="caja" element={<CajaPage />} />
      <Route path="*" element={<Navigate to="caja" replace />} />
    </Routes>
  </div>
);
