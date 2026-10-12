import type { ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErpLayout } from './layouts/ErpLayout';
import { ModuloPlaceholder } from './core/components/ModuloPlaceholder';
import { SinAcceso } from './core/components/SinAcceso';
import { ERP_MODULOS } from './core/config/navigation';
import { usePermisos } from './core/hooks/usePermisos';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { MantenimientoPage } from './modules/mantenimiento/pages/MantenimientoPage';
import { ComercialPage } from './modules/comercial/pages/ComercialPage';
import { ComprasPage } from './modules/compras/pages/ComprasPage';
import { InventarioPage } from './modules/inventario/pages/InventarioPage';
import { FinanzasPage } from './modules/finanzas/pages/FinanzasPage';
import { DocumentosPage } from './modules/documentos/pages/DocumentosPage';
import { ReportesPage } from './modules/reportes/pages/ReportesPage';
import { AdministracionPage } from './modules/administracion/pages/AdministracionPage';

/** Páginas ya construidas. Los módulos que no aparecen aquí muestran la página provisional. */
const PAGINAS: Record<string, ReactElement> = {
  dashboard: <DashboardPage />,
  mantenimiento: <MantenimientoPage />,
  comercial: <ComercialPage />,
  compras: <ComprasPage />,
  inventario: <InventarioPage />,
  finanzas: <FinanzasPage />,
  documentos: <DocumentosPage />,
  reportes: <ReportesPage />,
  administracion: <AdministracionPage />,
};

/** Solo muestra el módulo si el rol de la sesión lo permite. */
const Protegido: React.FC<{ ruta: string; children: ReactElement }> = ({ ruta, children }) => {
  const { puede } = usePermisos();
  return puede(ruta) ? children : <SinAcceso />;
};

export const ErpApp: React.FC = () => (
  <Routes>
    <Route element={<ErpLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {ERP_MODULOS.map((modulo) => (
        <Route
          key={modulo.path}
          path={`${modulo.path}/*`}
          element={
            <Protegido ruta={modulo.path}>
              {PAGINAS[modulo.path] ?? <ModuloPlaceholder modulo={modulo} />}
            </Protegido>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Route>
  </Routes>
);
