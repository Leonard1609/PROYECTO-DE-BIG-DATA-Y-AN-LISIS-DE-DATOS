import { useErp } from '../../../core/hooks/useErp';
import { formatFechaHora, formatMoneda } from '../../../core/utils/format';
import { DataTable, type ColumnaTabla } from '../../../core/components/DataTable';
import { EmptyState } from '../../../core/components/EmptyState';
import { Indicador } from '../../../core/components/Indicador';
import { Insignia } from '../../../core/components/Insignia';
import type { MovimientoCaja } from '../../../core/types';

type FilaCaja = MovimientoCaja & { acumulado: number };

export const CajaTab: React.FC = () => {
  const { state } = useErp();

  let acumulado = 0;
  const filas: FilaCaja[] = state.caja
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((m) => {
      acumulado += m.tipo === 'Ingreso' ? m.monto : -m.monto;
      return { ...m, acumulado };
    });

  const ingresos = state.caja.filter((m) => m.tipo === 'Ingreso').reduce((a, m) => a + m.monto, 0);
  const egresos = state.caja.filter((m) => m.tipo === 'Egreso').reduce((a, m) => a + m.monto, 0);

  const columnas: ColumnaTabla<FilaCaja>[] = [
    { titulo: 'Fecha', celda: (m) => formatFechaHora(m.fecha) },
    { titulo: 'Concepto', celda: (m) => m.concepto },
    { titulo: 'Tipo', celda: (m) => <Insignia texto={m.tipo} /> },
    { titulo: 'Importe', celda: (m) => (m.tipo === 'Egreso' ? `- ${formatMoneda(m.monto)}` : formatMoneda(m.monto)), derecha: true },
    { titulo: 'Saldo de caja', celda: (m) => formatMoneda(m.acumulado), derecha: true },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Indicador titulo="Ingresos" valor={formatMoneda(ingresos)} />
        <Indicador titulo="Egresos" valor={formatMoneda(egresos)} />
        <Indicador titulo="Saldo de caja" valor={formatMoneda(ingresos - egresos)} />
      </div>
      <DataTable
        columnas={columnas}
        filas={filas}
        clave={(m) => m.id}
        vacio={<EmptyState titulo="Caja sin movimientos" descripcion="Las ventas y compras al contado, y los cobros y pagos de cuentas, se registran aquí." />}
      />
    </div>
  );
};
