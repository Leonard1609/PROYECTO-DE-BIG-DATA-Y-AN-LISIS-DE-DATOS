import { Routes, Route, Navigate } from 'react-router-dom';
import { useErp } from '../../../core/hooks/useErp';
import { CadenaFlujo, type PasoFlujo } from '../../../core/components/CadenaFlujo';
import { EstadoCuenta } from '../../../core/components/operaciones/EstadoCuenta';
import { OrdenesCompraPage } from './OrdenesCompraPage';
import { KardexPage } from './KardexPage';

export const ComprasPage: React.FC = () => {
  const { state } = useErp();
  const pagar = state.cuentas.filter((c) => c.tipo === 'Pagar');

  const pasos: PasoFlujo[] = [
    { sub: 'ordenes', titulo: 'Órdenes de compra', cantidad: state.ordenesCompra.length, pendientes: 0, textoPendiente: '' },
    { sub: 'kardex', titulo: 'Kardex', cantidad: state.compras.length,
      pendientes: state.ordenesCompra.filter((o) => o.estado === 'Pendiente').length, textoPendiente: 'por recibir' },
    { sub: 'estado-cuenta', titulo: 'Estado de cuenta', cantidad: pagar.length,
      pendientes: pagar.filter((c) => c.estado === 'Pendiente').length, textoPendiente: 'por pagar' },
  ];

  return (
    <div className="max-w-6xl space-y-6">
      <CadenaFlujo modulo="compras" pasos={pasos} />
      <Routes>
        <Route index element={<Navigate to="ordenes" replace />} />
        <Route path="ordenes" element={<OrdenesCompraPage />} />
        <Route path="kardex" element={<KardexPage />} />
        <Route path="estado-cuenta" element={<EstadoCuenta tipo="Pagar" />} />
        <Route path="*" element={<Navigate to="ordenes" replace />} />
      </Routes>
    </div>
  );
};
