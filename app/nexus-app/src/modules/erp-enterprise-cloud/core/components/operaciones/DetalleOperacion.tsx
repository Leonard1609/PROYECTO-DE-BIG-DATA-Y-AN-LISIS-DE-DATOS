import type { CondicionPago, ErpState, LineaDetalle } from '../../types';
import { formatFechaHora, formatMoneda } from '../../utils/format';
import { Insignia } from '../Insignia';
import { Modal } from '../Modal';
import type { Modo } from './FormularioOperacion';

export interface FilaOperacion {
  id: string;
  numero: string;
  fecha: string;
  tercero: string;
  condicion: CondicionPago;
  estado: string;
  subtotal: number;
  igv: number;
  total: number;
  detalle: LineaDetalle[];
  documentoId: string;
}

interface Props {
  modo: Modo;
  fila: FilaOperacion;
  state: ErpState;
  onCerrar: () => void;
}

export const DetalleOperacion: React.FC<Props> = ({ modo, fila, state, onCerrar }) => {
  const esVenta = modo === 'venta';
  const documento = state.documentos.find((d) => d.id === fila.documentoId);
  const nombreProducto = (id: string) => state.productos.find((p) => p.id === id)?.nombre ?? '-';

  return (
    <Modal titulo={`${esVenta ? 'Venta' : 'Compra'} ${fila.numero}`} onCerrar={onCerrar}>
      <dl className="grid gap-4 sm:grid-cols-3 text-sm">
        <div><dt className="text-slate-500">{esVenta ? 'Cliente' : 'Proveedor'}</dt><dd className="font-medium text-slate-800">{fila.tercero}</dd></div>
        <div><dt className="text-slate-500">Fecha</dt><dd className="font-medium text-slate-800">{formatFechaHora(fila.fecha)}</dd></div>
        <div className="flex items-center gap-2"><Insignia texto={fila.condicion} /><Insignia texto={fila.estado} /></div>
      </dl>

      <div className="mt-5 overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <th className="px-4 py-2 text-left font-medium">Producto</th>
              <th className="px-4 py-2 text-right font-medium">Cant.</th>
              <th className="px-4 py-2 text-right font-medium">Precio</th>
              <th className="px-4 py-2 text-right font-medium">Importe</th>
            </tr>
          </thead>
          <tbody>
            {fila.detalle.map((l) => (
              <tr key={l.productoId} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{nombreProducto(l.productoId)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{l.cantidad}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatMoneda(l.precioUnitario)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatMoneda(l.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto mt-4 w-full sm:w-64 space-y-1 text-sm">
        <div className="flex justify-between text-slate-600"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoneda(fila.subtotal)}</dd></div>
        <div className="flex justify-between text-slate-600"><dt>IGV</dt><dd className="tabular-nums">{formatMoneda(fila.igv)}</dd></div>
        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold text-slate-900"><dt>Total</dt><dd className="tabular-nums">{formatMoneda(fila.total)}</dd></div>
      </dl>

      {documento && (
        <p className="mt-5 text-sm text-slate-500">
          {esVenta ? 'Comprobante' : 'Factura'} archivado: <span className="font-medium text-slate-700">{documento.nombre}</span>
        </p>
      )}
    </Modal>
  );
};
