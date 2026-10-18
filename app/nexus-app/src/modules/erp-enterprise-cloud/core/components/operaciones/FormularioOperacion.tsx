import { useState } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import type { ErpState, CondicionPago, LineaDetalle } from '../../../core/types';
import { formatMoneda } from '../../../core/utils/format';

export type Modo = 'venta' | 'compra';

export interface DatosFormulario {
  terceroId: string;    // clienteId o proveedorId
  vendedorId: string;   // solo ventas
  almacenId: string;
  condicion: CondicionPago;
  detalle: LineaDetalle[];
}

interface Props {
  modo: Modo;
  state: ErpState;
  onGuardar: (d: DatosFormulario) => void;
  onExito: () => void;
  onCancelar: () => void;
}

export const FormularioOperacion: React.FC<Props> = ({ modo, state, onGuardar, onExito, onCancelar }) => {
  const esVenta = modo === 'venta';

  // Estados del formulario
  const [terceroId, setTerceroId] = useState('');
  const [vendedorId, setVendedorId] = useState(state.vendedores.filter(v => v.estado === 'Activo')[0]?.id || '');
  const [almacenId, setAlmacenId] = useState(state.almacenes.filter(a => a.estado === 'Activo')[0]?.id || '');
  const [condicion, setCondicion] = useState<CondicionPago>('Contado');
  const [detalle, setDetalle] = useState<LineaDetalle[]>([
    {
      productoId: state.productos.filter(p => p.estado === 'Activo')[0]?.id || '',
      cantidad: 1,
      precioUnitario: state.productos.filter(p => p.estado === 'Activo')[0]?.precioVenta || 0,
      subtotal: state.productos.filter(p => p.estado === 'Activo')[0]?.precioVenta || 0,
    }
  ]);

  // Estados para los Buscadores (Autocomplete)
  const [busquedaTercero, setBusquedaTercero] = useState('');
  const [mostrarDropdownTercero, setMostrarDropdownTercero] = useState(false);

  // Filtrar clientes o proveedores activos según el texto ingresado
  const tercerosDisponibles = esVenta
    ? state.clientes.filter(c => c.estado === 'Activo' && (c.razonSocial.toLowerCase().includes(busquedaTercero.toLowerCase()) || c.numeroDocumento.includes(busquedaTercero)))
    : state.proveedores.filter(p => p.estado === 'Activo' && (p.razonSocial.toLowerCase().includes(busquedaTercero.toLowerCase()) || p.ruc.includes(busquedaTercero)));

  const terceroSeleccionado = esVenta
    ? state.clientes.find(c => c.id === terceroId)
    : state.proveedores.find(p => p.id === terceroId);

  // Manejo de líneas de productos
  const actualizarLinea = (index: number, campo: keyof LineaDetalle, valor: number | string) => {
    const nuevoDetalle = [...detalle];
    const linea = { ...nuevoDetalle[index], [campo]: valor };

    if (campo === 'productoId') {
      const prod = state.productos.find(p => p.id === valor);
      if (prod) {
        linea.precioUnitario = esVenta ? prod.precioVenta : prod.precioCompra;
      }
    }

    linea.subtotal = Number((linea.cantidad * linea.precioUnitario).toFixed(2));
    nuevoDetalle[index] = linea;
    setDetalle(nuevoDetalle);
  };

  const agregarLinea = () => {
    const prodDefault = state.productos.filter(p => p.estado === 'Activo')[0];
    if (!prodDefault) return;
    setDetalle([
      ...detalle,
      {
        productoId: prodDefault.id,
        cantidad: 1,
        precioUnitario: esVenta ? prodDefault.precioVenta : prodDefault.precioCompra,
        subtotal: esVenta ? prodDefault.precioVenta : prodDefault.precioCompra,
      }
    ]);
  };

  const eliminarLinea = (index: number) => {
    if (detalle.length === 1) return;
    setDetalle(detalle.filter((_, i) => i !== index));
  };

  const subtotalGeneral = detalle.reduce((acc, l) => acc + l.subtotal, 0);
  const igvGeneral = Number((subtotalGeneral * 0.18).toFixed(2));
  const totalGeneral = Number((subtotalGeneral + igvGeneral).toFixed(2));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terceroId) {
      alert(`Selecciona un ${esVenta ? 'cliente' : 'proveedor'}`);
      return;
    }
    onGuardar({
      terceroId,
      vendedorId: esVenta ? vendedorId : '',
      almacenId,
      condicion,
      detalle,
    });
    onExito();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
      {/* Buscador de Cliente o Proveedor (Autocomplete) */}
      <div className="relative">
        <label className="block font-medium text-slate-700 mb-1">
          {esVenta ? 'Cliente' : 'Proveedor'} <span className="text-red-500">*</span>
        </label>
        
        {terceroSeleccionado ? (
          <div className="flex items-center justify-between p-2.5 bg-teal-50 border border-teal-200 rounded-lg">
            <span className="font-medium text-teal-900">
              {esVenta ? (terceroSeleccionado as any).razonSocial : (terceroSeleccionado as any).razonSocial} 
              <span className="text-xs text-teal-600 ml-2">({(terceroSeleccionado as any).numeroDocumento || (terceroSeleccionado as any).ruc})</span>
            </span>
            <button
              type="button"
              onClick={() => { setTerceroId(''); setBusquedaTercero(''); }}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={`Buscar ${esVenta ? 'cliente por RUC o Razón Social' : 'proveedor por RUC'}...`}
                value={busquedaTercero}
                onChange={(e) => { setBusquedaTercero(e.target.value); setMostrarDropdownTercero(true); }}
                onFocus={() => setMostrarDropdownTercero(true)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {mostrarDropdownTercero && tercerosDisponibles.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {tercerosDisponibles.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setTerceroId(t.id);
                      setBusquedaTercero(t.razonSocial);
                      setMostrarDropdownTercero(false);
                    }}
                    className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-xs flex justify-between items-center border-b border-slate-50 last:border-none"
                  >
                    <span className="font-medium text-slate-800">{t.razonSocial}</span>
                    <span className="text-slate-500 font-mono">{t.numeroDocumento || t.ruc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Vendedor (Select normal mantenido según requerimiento) */}
        {esVenta && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">Vendedor</label>
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
            >
              {state.vendedores.filter(v => v.estado === 'Activo').map(v => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {/* Almacén */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Almacén</label>
          <select
            value={almacenId}
            onChange={(e) => setAlmacenId(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          >
            {state.almacenes.filter(a => a.estado === 'Activo').map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        {/* Condición de Pago */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Condición de Pago</label>
          <select
            value={condicion}
            onChange={(e) => setCondicion(e.target.value as CondicionPago)}
            className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="Contado">Contado</option>
            <option value="Crédito">Crédito</option>
          </select>
        </div>
      </div>

      {/* Detalle de Productos con Buscador Integrado */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Productos de la Operación</h3>
          <button
            type="button"
            onClick={agregarLinea}
            className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar producto
          </button>
        </div>

        {detalle.map((linea, index) => (
          <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Producto (Buscador)</label>
              <select
                value={linea.productoId}
                onChange={(e) => actualizarLinea(index, 'productoId', e.target.value)}
                className="w-full p-1.5 rounded border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500"
              >
                {state.productos.filter(p => p.estado === 'Activo').map(p => (
                  <option key={p.id} value={p.id}>
                    {p.codigo} - {p.nombre} ({formatMoneda(esVenta ? p.precioVenta : p.precioCompra)})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-20">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Cantidad</label>
              <input
                type="number"
                min="1"
                value={linea.cantidad}
                onChange={(e) => actualizarLinea(index, 'cantidad', Number(e.target.value))}
                className="w-full p-1.5 rounded border border-slate-300 bg-white text-xs text-center"
              />
            </div>

            <div className="w-28 text-right pr-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Subtotal</label>
              <span className="text-xs font-semibold text-slate-800">{formatMoneda(linea.subtotal)}</span>
            </div>

            <button
              type="button"
              onClick={() => eliminarLinea(index)}
              className="text-slate-400 hover:text-red-600 p-1 mt-4"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Totales Resumen */}
      <div className="bg-slate-100 p-3 rounded-lg flex justify-between items-center text-xs font-medium text-slate-700">
        <span>Subtotal: {formatMoneda(subtotalGeneral)}</span>
        <span>IGV (18%): {formatMoneda(igvGeneral)}</span>
        <span className="text-sm font-bold text-teal-700">Total: {formatMoneda(totalGeneral)}</span>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 shadow"
        >
          Guardar y Procesar
        </button>
      </div>
    </form>
  );
};