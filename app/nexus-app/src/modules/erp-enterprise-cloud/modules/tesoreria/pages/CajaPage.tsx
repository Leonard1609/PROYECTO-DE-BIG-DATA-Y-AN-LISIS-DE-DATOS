import { useErp } from '../../../core/hooks/useErp';
import { formatFechaHora, formatMoneda, formatMonedaConSigno } from '../../../core/utils/format';
import { DataTable, type ColumnaTabla } from '../../../core/components/DataTable';
import { EmptyState } from '../../../core/components/EmptyState';
import { FiltroFechas, useFiltroFechas } from '../../../core/components/FiltroFechas';
import { Indicador } from '../../../core/components/Indicador';
import { Insignia } from '../../../core/components/Insignia';
import type { MovimientoCaja } from '../../../core/types';

type FilaCaja = MovimientoCaja & { acumulado: number };

export const CajaPage: React.FC = () => {
  const { state } = useErp();
  const filtro = useFiltroFechas();

  // El saldo acumulado se calcula sobre todo el historial; el filtro solo decide qué filas se ven.
  let acumulado = 0;
  const todas: FilaCaja[] = state.caja
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((m) => {
      acumulado += m.tipo === 'Ingreso' ? m.monto : -m.monto;
      return { ...m, acumulado };
    });
  const filas = todas.filter((m) => filtro.enRango(m.fecha));

  const ingresos = filas.filter((m) => m.tipo === 'Ingreso').reduce((a, m) => a + m.monto, 0);
  const egresos = filas.filter((m) => m.tipo === 'Egreso').reduce((a, m) => a + m.monto, 0);
  const ocultos = todas.length - filas.length;

  const columnas: ColumnaTabla<FilaCaja>[] = [
    { titulo: 'Fecha', celda: (m) => formatFechaHora(m.fecha) },
    { titulo: 'Concepto', celda: (m) => m.concepto },
    { titulo: 'Tipo', celda: (m) => <Insignia texto={m.tipo} /> },
    { titulo: 'Importe', celda: (m) => (m.tipo === 'Egreso' ? `- ${formatMoneda(m.monto)}` : formatMoneda(m.monto)), derecha: true },
    { titulo: 'Saldo de caja', celda: (m) => formatMonedaConSigno(m.acumulado), derecha: true },
  ];

  return (
    <div className="space-y-4">
      <p className="text-slate-500 max-w-2xl">
        Caja es el dinero que entró o salió de verdad. Cada cobro registrado en Ventas y cada pago registrado en Compras aparece aquí.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Indicador titulo="Ingresos" valor={formatMoneda(ingresos)} nota={filtro.esHoy ? 'De hoy' : 'En el período filtrado'} />
        <Indicador titulo="Egresos" valor={formatMoneda(egresos)} />
        <Indicador titulo="Saldo de caja" valor={formatMonedaConSigno(todas.length ? todas[todas.length - 1].acumulado : 0)} nota="Acumulado total" />
      </div>

      <FiltroFechas filtro={filtro} />

      {ocultos > 0 && !filtro.invalido && (
        <p className="text-sm text-slate-500">
          Hay {ocultos} movimiento{ocultos === 1 ? '' : 's'} fuera del período filtrado.{' '}
          <button onClick={filtro.verTodo} className="text-teal-700 underline">Ver todo</button>
        </p>
      )}

      <DataTable
        columnas={columnas}
        filas={filas}
        clave={(m) => m.id}
        vacio={<EmptyState titulo="Caja sin movimientos en este período" descripcion="Las facturas y compras al contado, y los cobros y pagos de cuentas, se registran aquí." />}
      />
    </div>
  );
};
