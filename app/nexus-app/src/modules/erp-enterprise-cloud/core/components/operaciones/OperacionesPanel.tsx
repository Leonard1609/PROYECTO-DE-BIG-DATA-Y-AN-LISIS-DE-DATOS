import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle2, ArrowRight, Calendar, DollarSign, FileText, RotateCcw } from 'lucide-react';
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

  // Fecha de hoy por defecto (YYYY-MM-DD)
  const hoyISO = new Date().toISOString().split('T')[0];
  const [fechaFiltro, setFechaFiltro] = useState<string>(hoyISO);

  // Obtener todas las filas de la entidad
  const todasLasFilas: FilaOperacion[] = esVenta
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

  // Filtrado por fecha seleccionada
  const filasFiltradas = fechaFiltro
    ? todasLasFilas.filter((f) => f.fecha.startsWith(fechaFiltro))
    : todasLasFilas;

  // KPIs dinámicos calculados según las filas filtradas
  const totalMontoFiltrado = filasFiltradas.reduce((acc, f) => acc + f.total, 0);
  const totalRegistrosFiltrados = filasFiltradas.length;

  const faltantes: string[] = [];
  if (esVenta ? !hayActivo(state.clientes) : !hayActivo(state.proveedores)) faltantes.push(esVenta ? 'un cliente' : 'un proveedor');
  if (esVenta && !hayActivo(state.vendedores)) faltantes.push('un vendedor');
  if (!hayActivo(state.almacenes)) faltantes.push('un almacén');
  if (!hayActivo(state.productos)) faltantes.push('un producto');

  const limiteAlcanzado = todasLasFilas.length >= LIMITE_REGISTROS;

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

  const handleAvanzarEstado = (fila: FilaOperacion) => {
    const res = acciones.avanzarEstadoOperacion(esVenta ? 'Venta' : 'Compra', fila.id);
    if (res.ok) {
      setAviso(esVenta 
        ? `Cobro registrado con éxito para ${fila.numero}. Estado sincronizado a Pagada.` 
        : `Pago registrado con éxito para ${fila.numero}. Estado sincronizado a Pagada.`);
    }
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

      {/* Cadena de Flujo Documental requerida por el instructor */}
      {todasLasFilas.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Flujo de Trazabilidad Documental ({esVenta ? 'Comercial' : 'Compras'})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 font-medium">
              1. {esVenta ? 'Cotización / Orden' : 'Orden de Compra'} (Completado)
            </div>
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 font-medium">
              2. {esVenta ? 'Facturación / Comprobante' : 'Recepción en Kardex'} (Generado)
            </div>
            <div className={`p-3 rounded-lg border font-medium ${
              todasLasFilas[0].estado === 'Pagada' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              3. Estado de Cuenta ({todasLasFilas[0].estado === 'Pagada' ? 'Cancelado' : 'Pendiente'})
            </div>
            <div className={`p-3 rounded-lg border font-medium ${
              todasLasFilas[0].estado === 'Pagada' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              4. Tesorería / Caja ({todasLasFilas[0].estado === 'Pagada' ? 'Ingreso Registrado' : 'Esperando Cobro'})
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas Informativas y Filtro Corrección Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total {esVenta ? 'Ventas' : 'Compras'} (Fecha)</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatMoneda(totalMontoFiltrado)}</p>
          </div>
          <div className="p-3 bg-teal-50 rounded-lg text-teal-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Documentos Registrados</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{totalRegistrosFiltrados} de {todasLasFilas.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Control del Filtro por Fecha Corregido Visualmente */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <label className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            Filtrar por fecha
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              style={{ colorScheme: 'light' }}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
            />
            <div className="flex items-center gap-1 shrink-0">
              {fechaFiltro !== hoyISO && (
                <button
                  onClick={() => setFechaFiltro(hoyISO)}
                  title="Volver a la fecha de hoy"
                  className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Hoy
                </button>
              )}
              {fechaFiltro && (
                <button
                  onClick={() => setFechaFiltro('')}
                  className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                >
                  Todas
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {faltantes.length > 0 && (
        <div role="status" className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Para registrar {esVenta ? 'una venta' : 'una compra'} primero debes crear {faltantes.join(', ')} en{' '}
          <Link to={`${ERP_BASE}/mantenimiento`} className="underline font-medium">Mantenimiento</Link>.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {todasLasFilas.length} de {LIMITE_REGISTROS} {esVenta ? 'ventas' : 'compras'} permitidas en esta versión de prueba.
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
        filas={filasFiltradas}
        clave={(f) => f.id}
        vacio={
          <EmptyState
            titulo={fechaFiltro ? `No hay ${esVenta ? 'ventas' : 'compras'} en la fecha ${formatFecha(fechaFiltro)}` : esVenta ? 'Aún no hay ventas' : 'Aún no hay compras'}
            descripcion={fechaFiltro 
              ? 'Las operaciones del día empiezan en cero. Puedes presionar "Hoy", cambiar la fecha seleccionada o registrar una nueva operación.'
              : esVenta ? 'Registra la primera venta.' : 'Registra la primera compra.'}
          />
        }
        acciones={(f) => (
          <div className="flex items-center gap-2">
            <button onClick={() => setDetalle(f)}
              className="px-3 py-1.5 rounded-lg text-sm text-teal-700 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
              Ver detalle
            </button>
            {f.estado !== 'Pagada' && (
              <button
                onClick={() => handleAvanzarEstado(f)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none"
              >
                {esVenta ? 'Registrar Cobro' : 'Registrar Pago'}
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            {f.estado === 'Pagada' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> {esVenta ? 'Cobrado' : 'Pagado'}
              </span>
            )}
          </div>
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