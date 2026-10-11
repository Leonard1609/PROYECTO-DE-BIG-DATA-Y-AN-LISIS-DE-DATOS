import { useState } from 'react';
import { useErp } from '../../../core/hooks/useErp';
import { formatFechaHora } from '../../../core/utils/format';
import { DataTable, type ColumnaTabla } from '../../../core/components/DataTable';
import { EmptyState } from '../../../core/components/EmptyState';
import { Insignia } from '../../../core/components/Insignia';
import type { MovimientoInventario } from '../../../core/types';

export const KardexTab: React.FC = () => {
  const { state } = useErp();
  const [productoId, setProductoId] = useState('');

  const movimientos = state.movimientos
    .filter((m) => productoId === '' || m.productoId === productoId)
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const almacen = (id: string) => state.almacenes.find((a) => a.id === id)?.nombre ?? '-';

  const columnas: ColumnaTabla<MovimientoInventario>[] = [
    { titulo: 'Fecha', celda: (m) => formatFechaHora(m.fecha) },
    { titulo: 'Documento', celda: (m) => m.documentoNumero },
    { titulo: 'Origen', celda: (m) => <Insignia texto={m.origen} /> },
    { titulo: 'Almacén', celda: (m) => almacen(m.almacenId) },
    { titulo: 'Entrada', celda: (m) => (m.tipo === 'Entrada' ? m.cantidad : '-'), derecha: true },
    { titulo: 'Salida', celda: (m) => (m.tipo === 'Salida' ? m.cantidad : '-'), derecha: true },
    { titulo: 'Saldo', celda: (m) => m.saldo, derecha: true },
    { titulo: 'Motivo', celda: (m) => m.motivo ?? '' },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <label htmlFor="kardex-producto" className="block text-sm font-medium text-slate-700 mb-1">Producto</label>
        <select
          id="kardex-producto"
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="">Todos los productos</option>
          {state.productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} · {p.nombre}</option>)}
        </select>
      </div>
      <DataTable
        columnas={columnas}
        filas={movimientos}
        clave={(m) => m.id}
        vacio={<EmptyState titulo="Aún no hay movimientos" descripcion="Cada compra, venta o ajuste deja aquí su entrada o salida con el saldo resultante." />}
      />
    </div>
  );
};
