import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useErp } from '../../../core/hooks/useErp';
import { ruta } from '../../../core/config/navigation';
import { filasFacturas, filasOrdenesVenta } from '../../../core/utils/filas';
import { formatFecha, formatMoneda } from '../../../core/utils/format';
import { AvisoFlujo, type Aviso } from '../../../core/components/AvisoFlujo';
import { DataTable, type ColumnaTabla } from '../../../core/components/DataTable';
import { Insignia } from '../../../core/components/Insignia';
import { ListaDocumentos } from '../../../core/components/operaciones/ListaDocumentos';
import type { FilaDocumento } from '../../../core/utils/filas';

export const FacturacionPage: React.FC = () => {
  const { state, acciones } = useErp();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const porFacturar = filasOrdenesVenta(state).filter((o) => o.estado === 'Pendiente');

  const facturar = (f: FilaDocumento) => {
    const r = acciones.facturarOrdenVenta(f.id);
    if (r.ok) {
      setAviso({
        ok: true,
        texto: f.condicion === 'Contado'
          ? 'Factura emitida. Salió el stock, se cobró al contado y el comprobante quedó archivado.'
          : 'Factura emitida. Salió el stock y el comprobante quedó archivado. Falta cobrarla en Estado de cuenta.',
        siguiente: { to: ruta('ventas', 'estado-cuenta'), texto: 'Ir a Estado de cuenta' },
      });
    } else {
      setAviso({
        ok: false,
        texto: r.error,
        siguiente: /Stock insuficiente/.test(r.error) ? { to: ruta('compras', 'ordenes'), texto: 'Ir a Compras' } : undefined,
      });
    }
  };

  const columnas: ColumnaTabla<FilaDocumento>[] = [
    { titulo: 'Orden', celda: (f) => f.numero },
    { titulo: 'Fecha', celda: (f) => formatFecha(f.fecha) },
    { titulo: 'Cliente', celda: (f) => f.tercero },
    { titulo: 'Condición', celda: (f) => <Insignia texto={f.condicion} /> },
    { titulo: 'Total', celda: (f) => formatMoneda(f.total), derecha: true },
  ];

  return (
    <div className="space-y-6">
      <p className="text-slate-500 max-w-2xl">
        Al emitir la factura sale el stock, se archiva el comprobante y se abre la cuenta por cobrar. Su estado de pago se actualiza cuando se cobra en Estado de cuenta.
      </p>

      {aviso && <AvisoFlujo aviso={aviso} onCerrar={() => setAviso(null)} />}

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">Órdenes pendientes de facturar</h2>
        {porFacturar.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay órdenes esperando factura. Se generan en{' '}
            <Link to={ruta('ventas', 'ordenes')} className="text-teal-700 underline">Órdenes de venta</Link>.
          </p>
        ) : (
          <DataTable
            columnas={columnas}
            filas={porFacturar}
            clave={(f) => f.id}
            vacio={null}
            acciones={(f) => (
              <button onClick={() => { setAviso(null); facturar(f); }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2">
                Emitir factura
              </button>
            )}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900">Facturas emitidas</h2>
        <ListaDocumentos
          documento={{ articulo: 'una', singular: 'factura', plural: 'facturas', tituloDetalle: 'Factura' }}
          etiquetaTercero="Cliente"
          etiquetaEstado="Estado de pago"
          filas={filasFacturas(state)}
          estadosPendientes={['Pendiente']}
          etiquetaPendientes="Por cobrar"
          vacio="Aún no se emitió ninguna factura en este período."
        />
      </section>
    </div>
  );
};
