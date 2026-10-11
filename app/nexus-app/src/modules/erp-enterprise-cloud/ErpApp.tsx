import type { ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErpLayout } from './layouts/ErpLayout';
import { ModuloPlaceholder } from './core/components/ModuloPlaceholder';
import { ERP_MODULOS } from './core/config/navigation';
import { MantenimientoPage } from './modules/mantenimiento/pages/MantenimientoPage';

/** Páginas ya construidas. Los módulos que no aparecen aquí muestran la página provisional. */
const PAGINAS: Record<string, ReactElement> = {
  mantenimiento: <MantenimientoPage />,
};

export const ErpApp: React.FC = () => (
  <Routes>
    <Route element={<ErpLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {ERP_MODULOS.map((modulo) => (
        <Route
          key={modulo.path}
          path={`${modulo.path}/*`}
          element={PAGINAS[modulo.path] ?? <ModuloPlaceholder modulo={modulo} />}
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);
