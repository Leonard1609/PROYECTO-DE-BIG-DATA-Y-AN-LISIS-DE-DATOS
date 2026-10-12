import { useState } from 'react';
import { useErp } from '../../../core/hooks/useErp';
import { formatFecha, formatMoneda } from '../../../core/utils/format';
import { DataTable, type ColumnaTabla } from '../../../core/components/DataTable';
import { EmptyState } from '../../../core/components/EmptyState';
import { Indicador } from '../../../core/components/Indicador';
import { Insignia } from '../../../core/components/Insignia';
import { Modal } from '../../../core/components/Modal';
import type { CuentaFinanciera } from '../../../core/types';

interface Props { tipo: 'Cobrar' | 'Pagar' }

export const CuentasTab: React.FC<Props> = ({ tipo }) => {
  const { state, acciones } = useErp();
  const esCobrar = tipo === 'Cobrar';
  const [liquidando, setLiquidando] = useState<CuentaFinanciera | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const cuentas = state.cuentas.filter((c) => c.tipo === tipo);
  const pendientes = cuentas.filter((c) => c.estado === 'Pendiente');
  const saldo = pendientes.reduce((a, c) => a + c.saldo, 0);
  const hoy = new Date().toISOString();

  const tercero = (c: CuentaFinanciera) =>
    (esCobrar
      ? state.clientes.find((x) => x.id === c.terceroId)?.razonSocial
      : state.proveedores.find((x) => x.id === c.terceroId)?.razonSocial) ?? '-';
  const situacion = (c: CuentaFinanciera) => (c.estado === 'Pendiente' && c.vencimiento < hoy ? 'Vencida' : c.estado);

  const confirmar = () => {
    if (!liquidando) return;
    const r = acciones.liquidarCuenta(liquidando.id);
    setAviso(r.ok
      ? { ok: true, texto: `${esCobrar ? 'Cobro' : 'Pago'} registrado. El movimiento ya figura en Caja.` }
      : { ok: false, texto: r.error });
    setLiquidando(null);
  };

  const columnas: ColumnaTabla<CuentaFinanciera>[] = [
    { titulo: 'Documento', celda: (c) => c.documentoNumero },
    { titulo: esCobrar ? 'Cliente' : 'Proveedor', celda: tercero },
    { titulo: 'Vence', celda: (c) => formatFecha(c.vencimiento) },
    { titulo: 'Monto', celda: (c) => formatMoneda(c.monto), derecha: true },
    { titulo: 'Saldo', celda: (c) => formatMoneda(c.saldo), derecha: true },
    { titulo: 'Situación', celda: (c) => <Insignia texto={situacion(c)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Indicador titulo={esCobrar ? 'Por cobrar' : 'Por pagar'} valor={formatMoneda(saldo)} nota="Saldo pendiente" />
        <Indicador titulo="Cuentas pendientes" valor={pendientes.length} />
      </div>

      {aviso && (
        <div role="status" className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
          aviso.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} className="underline shrink-0">Cerrar</button>
        </div>
      )}

      <DataTable
        columnas={columnas}
        filas={cuentas}
        clave={(c) => c.id}
        vacio={
          <EmptyState
            titulo={esCobrar ? 'No hay cuentas por cobrar' : 'No hay cuentas por pagar'}
            descripcion={esCobrar
              ? 'Aparecen cuando registras una venta a crédito. Las ventas al contado van directo a Caja.'
              : 'Aparecen cuando registras una compra a crédito. Las compras al contado van directo a Caja.'}
          />
        }
        acciones={(c) => c.estado === 'Pendiente' ? (
          <button onClick={() => { setAviso(null); setLiquidando(c); }}
            className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            {esCobrar ? 'Registrar cobro' : 'Registrar pago'}
          </button>
        ) : null}
      />

      {liquidando && (
        <Modal titulo={esCobrar ? 'Registrar cobro' : 'Registrar pago'} onCerrar={() => setLiquidando(null)} ancho="sm">
          <p className="text-sm text-slate-600">
            Se {esCobrar ? 'cobrará' : 'pagará'} el saldo completo de {formatMoneda(liquidando.saldo)} del documento {liquidando.documentoNumero}
            {' '}y se registrará {esCobrar ? 'un ingreso' : 'un egreso'} en Caja.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setLiquidando(null)}
              className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
              Cancelar
            </button>
            <button onClick={confirmar}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
              Confirmar {esCobrar ? 'cobro' : 'pago'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
