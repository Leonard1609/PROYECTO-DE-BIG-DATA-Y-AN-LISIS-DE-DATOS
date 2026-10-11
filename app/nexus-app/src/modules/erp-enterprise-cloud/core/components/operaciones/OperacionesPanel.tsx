import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useErp } from '../../hooks/useErp';
import { LIMITE_REGISTROS } from '../../services/erpStore';
import { ERP_BASE } from '../../config/navigation';
import { formatFecha, formatMoneda } from '../../utils/format';
import { DataTable, type ColumnaTabla } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { Insignia } from '../Insignia';
import { Modal } from '../Modal';
import { DetalleOperacion, type FilaOperacion } from './DetalleOperacion';
import { FormularioOperacion, type DatosFormulario, type Modo } from './FormularioOperacion';

const hayActivo = (lista: { estado: string }[]): boolean => lista.some((x) => x.estado === 'Activo');

export const OperacionesPanel: React.FC<{ modo: Modo }> = ({ modo }) => {
  const { state, acciones } = useErp();
  const esVenta = modo === 'venta';
  const [creando, setCreando] = useState(false);
  const [detalle, setDetalle] = useState<FilaOperacion | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const filas: FilaOperacion[] = esVenta
    ? state.ventas.map((v) => ({
        id: v.id, numero: v.numero, fecha: v.fecha,
        tercero: state.clientes.find((c) => c.id === v.clienteId)?.razonSocial ?? '-',
        condicion: v.condicion, estado: v.estado, subtotal: v.subtotal, igv: v.igv, total: v.total,
        detalle: v.detalle, documentoId: v.comprobanteId,
      }))
    : state.compras.map((c) => ({
        id: c.id, numero: c.numero, fecha: c.fecha,
        tercero: state.proveedores.find((p) => p.id === c.proveedorId)?.razonSocial ?? '-',
        condicion: c.condicion, estado: c.estado, subtotal: c.subtotal, igv: c.igv, total: c.total,
        detalle: c.detalle, documentoId: c.facturaId,
      }));

  const faltantes: string[] = [];
  if (esVenta ? !hayActivo(state.clientes) : !hayActivo(state.proveedores)) faltantes.push(esVenta ? 'un cliente' : 'un proveedor');
  if (esVenta && !hayActivo(state.vendedores)) faltantes.push('un vendedor');
  if (!hayActivo(state.almacenes)) faltantes.push('un almacén');
  if (!hayActivo(state.productos)) faltantes.push('un producto');

  const limiteAlcanzado = filas.length >= LIMITE_REGISTROS;

  const guardar = (d: DatosFormulario) =>
    esVenta
      ? acciones.registrarVenta({ clienteId: d.terceroId, vendedorId: d.vendedorId, almacenId: d.almacenId, condicion: d.condicion, detalle: d.detalle })
      : acciones.registrarCompra({ proveedorId: d.terceroId, almacenId: d.almacenId, condicion: d.condicion, detalle: d.detalle });

  const exito = () => {
    setCreando(false);
    setAviso(esVenta
      ? 'Venta registrada. Se descontó el stock, se archivó el comprobante y se actualizó Finanzas.'
      : 'Compra registrada. Entró stock al almacén, se archivó la factura y se actualizó Finanzas.');
  };

  const columnas: ColumnaTabla<FilaOperacion>[] = [
    { titulo: 'Número', celda: (f) => f.numero },
    { titulo: 'Fecha', celda: (f) => formatFecha(f.fecha) },
    { titulo: esVenta ? 'Cliente' : 'Proveedor', celda: (f) => f.tercero },
    { titulo: 'Condición', celda: (f) => <Insignia texto={f.condicion} /> },
    { titulo: 'Total', celda: (f) => formatMoneda(f.total), derecha: true },
    { titulo: 'Estado', celda: (f) => <Insignia texto={f.estado} /> },
  ];

  const botonNuevo = (
    <button
      onClick={() => { setAviso(null); setCreando(true); }}
      disabled={limiteAlcanzado || faltantes.length > 0}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
    >
      <Plus className="w-4 h-4" />
      Nueva {modo}
    </button>
  );

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-slate-500 max-w-2xl">
        {esVenta
          ? 'Cada venta selecciona un cliente y un vendedor ya registrados, descuenta stock y genera el comprobante y la cuenta por cobrar.'
          : 'Cada compra selecciona un proveedor ya registrado, aumenta el stock y genera la factura y la cuenta por pagar.'}
      </p>

      {faltantes.length > 0 && (
        <div role="status" className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Para registrar {esVenta ? 'una venta' : 'una compra'} primero debes crear {faltantes.join(', ')} en{' '}
          <Link to={`${ERP_BASE}/mantenimiento`} className="underline font-medium">Mantenimiento</Link>.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filas.length} de {LIMITE_REGISTROS} {esVenta ? 'ventas' : 'compras'} permitidas en esta versión de prueba.
        </p>
        {botonNuevo}
      </div>

      {aviso && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="underline shrink-0">Cerrar</button>
        </div>
      )}

      <DataTable
        columnas={columnas}
        filas={filas}
        clave={(f) => f.id}
        vacio={
          <EmptyState
            titulo={esVenta ? 'Aún no hay ventas' : 'Aún no hay compras'}
            descripcion={esVenta
              ? 'Registra la primera venta. Necesitas tener stock: si no hay, empieza por una compra.'
              : 'Registra la primera compra para que el producto tenga stock disponible.'}
          />
        }
        acciones={(f) => (
          <button onClick={() => setDetalle(f)}
            className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
            Ver detalle
          </button>
        )}
      />

      {creando && (
        <Modal titulo={`Nueva ${modo}`} onCerrar={() => setCreando(false)}>
          <FormularioOperacion modo={modo} state={state} onGuardar={guardar} onExito={exito} onCancelar={() => setCreando(false)} />
        </Modal>
      )}
      {detalle && <DetalleOperacion modo={modo} fila={detalle} state={state} onCerrar={() => setDetalle(null)} />}
    </div>
  );
};
