import { Routes, Route, Navigate } from 'react-router-dom';
import { ErpLayout } from './layouts/ErpLayout';
import { ModuloPlaceholder } from './core/components/ModuloPlaceholder';
import { ERP_MODULOS } from './core/config/navigation';

export const ErpApp: React.FC = () => (
  <Routes>
    <Route element={<ErpLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {ERP_MODULOS.map((modulo) => (
        <Route
          key={modulo.path}
          path={`${modulo.path}/*`}
          element={<ModuloPlaceholder modulo={modulo} />}
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);
