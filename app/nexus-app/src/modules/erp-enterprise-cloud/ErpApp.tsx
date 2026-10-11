import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

export const ErpApp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-sm text-slate-600 hover:text-slate-900 mb-4"
      >
        ← Volver a Nexus
      </button>

      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<h1 className="text-xl font-bold">ERP · Dashboard</h1>} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};