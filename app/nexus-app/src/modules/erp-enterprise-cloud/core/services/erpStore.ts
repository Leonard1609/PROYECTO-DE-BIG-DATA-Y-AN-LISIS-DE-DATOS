import type {
  ColeccionMaestra, CondicionPago, ErpState, LineaDetalle,
  MovimientoInventario, Resultado, Auditoria,
} from '../types';
import { crearEstadoInicial } from './seed';

/** Máximo de registros por colección. Para la entrega es 1; usa Infinity para quitar el tope. */
export const LIMITE_REGISTROS = 1;
export const IGV = 0.18;
const STORAGE_KEY = 'erp-enterprise-cloud:v1';
const USUARIO_SIMULADO = 'Administrador';
const BUCKET_S3 = 's3://erp-enterprise-cloud-docs';

/* ───────── Núcleo del store ───────── */

function cargar(): ErpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ErpState;
  } catch {
    /* sin almacenamiento o dato corrupto: se usa el estado inicial */
  }
  return crearEstadoInicial();
}

let state: ErpState = cargar();
const listeners = new Set<() => void>();

type Evento = Omit<Auditoria, 'id' | 'fecha' | 'usuario'>;

function commit(next: ErpState, evento?: Evento): void {
  const auditoria = evento
    ? [...next.auditoria, { ...evento, id: nuevoId('AUD'), fecha: ahora(), usuario: USUARIO_SIMULADO }]
    : next.auditoria;
  state = { ...next, auditoria };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* si no se puede persistir, el ERP sigue funcionando en memoria */
  }
  listeners.forEach((l) => l());
}

const nuevoId = (prefijo: string): string =>
  `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const ahora = (): string => new Date().toISOString();
const r2 = (n: number): number => Math.round(n * 100) / 100;
const sumarDias = (iso: string, dias: number): string => {
  const f = new Date(iso);
  f.setDate(f.getDate() + dias);
  return f.toISOString();
};
const fallo = (error: string): Resultado => ({ ok: false, error });

function rechazar(modulo: string, accion: string, error: string): Resultado {
  commit(state, { modulo, accion, registroId: '-', resultado: 'Rechazado', detalle: error });
  return fallo(error);
}

/* ───────── Consultas ───────── */

export function stockDe(
  movimientos: MovimientoInventario[], productoId: string, almacenId: string,
): number {
  return movimientos
    .filter((m) => m.productoId === productoId && m.almacenId === almacenId)
    .reduce((acc, m) => acc + (m.tipo === 'Entrada' ? m.cantidad : -m.cantidad), 0);
}

/* ───────── Mantenimiento ───────── */

const META: Record<ColeccionMaestra, { prefijo: string; etiqueta: string }> = {
  clientes: { prefijo: 'CLI', etiqueta: 'clientes' },
  proveedores: { prefijo: 'PRV', etiqueta: 'proveedores' },
  productos: { prefijo: 'PRD', etiqueta: 'productos' },
  almacenes: { prefijo: 'ALM', etiqueta: 'almacenes' },
  vendedores: { prefijo: 'VEN', etiqueta: 'vendedores' },
  categorias: { prefijo: 'CAT', etiqueta: 'categorías' },
  marcas: { prefijo: 'MAR', etiqueta: 'marcas' },
  unidades: { prefijo: 'UND', etiqueta: 'unidades' },
  monedas: { prefijo: 'MON', etiqueta: 'monedas' },
};

function enUso(col: ColeccionMaestra, id: string, s: ErpState): boolean {
  switch (col) {
    case 'clientes': return s.ventas.some((v) => v.clienteId === id);
    case 'proveedores': return s.compras.some((c) => c.proveedorId === id);
    case 'productos': return s.movimientos.some((m) => m.productoId === id);
    case 'almacenes':
      return s.movimientos.some((m) => m.almacenId === id)
        || s.ventas.some((v) => v.almacenId === id)
        || s.compras.some((c) => c.almacenId === id);
    case 'vendedores': return s.ventas.some((v) => v.vendedorId === id);
    case 'categorias': return s.productos.some((p) => p.categoriaId === id);
    case 'marcas': return s.productos.some((p) => p.marcaId === id);
    case 'unidades': return s.productos.some((p) => p.unidadId === id);
    case 'monedas': return s.productos.some((p) => p.monedaId === id);
  }
}

function crearMaestro<K extends ColeccionMaestra>(
  col: K, datos: Omit<ErpState[K][number], 'id'>,
): Resultado {
  const { prefijo, etiqueta } = META[col];
  const lista = state[col] as Array<{ id: string }>;
  if (lista.length >= LIMITE_REGISTROS) {
    return rechazar('Mantenimiento', `Crear en ${etiqueta}`,
      `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en ${etiqueta}.`);
  }
  const id = nuevoId(prefijo);
  commit({ ...state, [col]: [...lista, { ...datos, id }] } as ErpState,
    { modulo: 'Mantenimiento', accion: `Crear en ${etiqueta}`, registroId: id, resultado: 'Exitoso' });
  return { ok: true, id };
}

function actualizarMaestro<K extends ColeccionMaestra>(
  col: K, id: string, cambios: Partial<ErpState[K][number]>,
): Resultado {
  const { etiqueta } = META[col];
  const lista = state[col] as Array<{ id: string }>;
  if (!lista.some((x) => x.id === id)) return fallo('El registro no existe.');
  const nueva = lista.map((x) => (x.id === id ? { ...x, ...cambios } : x));
  commit({ ...state, [col]: nueva } as ErpState,
    { modulo: 'Mantenimiento', accion: `Editar en ${etiqueta}`, registroId: id, resultado: 'Exitoso' });
  return { ok: true, id };
}

function eliminarMaestro(col: ColeccionMaestra, id: string): Resultado {
  const { etiqueta } = META[col];
  if (enUso(col, id, state)) {
    return rechazar('Mantenimiento', `Eliminar en ${etiqueta}`,
      'No se puede eliminar: el registro ya fue usado en otros módulos.');
  }
  const lista = (state[col] as Array<{ id: string }>).filter((x) => x.id !== id);
  commit({ ...state, [col]: lista } as ErpState,
    { modulo: 'Mantenimiento', accion: `Eliminar en ${etiqueta}`, registroId: id, resultado: 'Exitoso' });
  return { ok: true, id };
}

/* ───────── Operaciones comunes ───────── */

interface LineaEntrada { productoId: string; cantidad: number; precioUnitario: number }

function armarDetalle(lineas: LineaEntrada[]): { detalle: LineaDetalle[]; subtotal: number; igv: number; total: number } {
  const detalle = lineas.map((l) => ({ ...l, subtotal: r2(l.cantidad * l.precioUnitario) }));
  const subtotal = r2(detalle.reduce((a, l) => a + l.subtotal, 0));
  const igv = r2(subtotal * IGV);
  return { detalle, subtotal, igv, total: r2(subtotal + igv) };
}

function lineasValidas(s: ErpState, lineas: LineaEntrada[]): string | null {
  if (lineas.length === 0) return 'Agrega al menos un producto.';
  for (const l of lineas) {
    if (!s.productos.some((p) => p.id === l.productoId && p.estado === 'Activo')) return 'El producto no existe o está inactivo.';
    if (!(l.cantidad > 0)) return 'La cantidad debe ser mayor que cero.';
    if (l.precioUnitario < 0) return 'El precio no puede ser negativo.';
  }
  return null;
}

/* ───────── Comercial ───────── */

export interface DatosVenta {
  clienteId: string; vendedorId: string; almacenId: string;
  condicion: CondicionPago; detalle: LineaEntrada[];
}

function registrarVenta(d: DatosVenta): Resultado {
  const M = 'Comercial', A = 'Registrar venta';
  const s = state;
  if (s.ventas.length >= LIMITE_REGISTROS) {
    return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en ventas.`);
  }
  const cliente = s.clientes.find((c) => c.id === d.clienteId && c.estado === 'Activo');
  if (!cliente) return rechazar(M, A, 'Selecciona un cliente activo.');
  if (!s.vendedores.some((v) => v.id === d.vendedorId && v.estado === 'Activo')) return rechazar(M, A, 'Selecciona un vendedor activo.');
  if (!s.almacenes.some((a) => a.id === d.almacenId && a.estado === 'Activo')) return rechazar(M, A, 'Selecciona un almacén activo.');
  const errLinea = lineasValidas(s, d.detalle);
  if (errLinea) return rechazar(M, A, errLinea);

  const fecha = ahora();
  const numero = `V-${String(s.ventas.length + 1).padStart(4, '0')}`;
  const { detalle, subtotal, igv, total } = armarDetalle(d.detalle);

  if (d.condicion === 'Crédito' && total > cliente.limiteCredito) {
    return rechazar(M, A, 'El total supera el límite de crédito del cliente.');
  }

  const movimientos: MovimientoInventario[] = [];
  for (const l of detalle) {
    const disponible = stockDe([...s.movimientos, ...movimientos], l.productoId, d.almacenId);
    if (disponible < l.cantidad) {
      return rechazar(M, A, `Stock insuficiente: disponible ${disponible}, solicitado ${l.cantidad}.`);
    }
    movimientos.push({
      id: nuevoId('MOV'), fecha, tipo: 'Salida', origen: 'Venta', documentoNumero: numero,
      productoId: l.productoId, almacenId: d.almacenId, cantidad: l.cantidad, saldo: disponible - l.cantidad,
    });
  }

  const ventaId = nuevoId('VTA');
  const comprobanteId = nuevoId('DOC');
  const nombreArchivo = `${numero}.pdf`;

  commit({
    ...s,
    ventas: [...s.ventas, {
      id: ventaId, numero, fecha, clienteId: d.clienteId, vendedorId: d.vendedorId, almacenId: d.almacenId,
      condicion: d.condicion, detalle, subtotal, igv, total, estado: 'Emitida', comprobanteId,
    }],
    movimientos: [...s.movimientos, ...movimientos],
    cuentas: d.condicion === 'Crédito'
      ? [...s.cuentas, {
          id: nuevoId('CXC'), tipo: 'Cobrar', documentoNumero: numero, terceroId: d.clienteId,
          monto: total, saldo: total, vencimiento: sumarDias(fecha, 30), estado: 'Pendiente',
        }]
      : s.cuentas,
    caja: d.condicion === 'Contado'
      ? [...s.caja, { id: nuevoId('CAJ'), fecha, tipo: 'Ingreso', concepto: `Venta ${numero}`, monto: total, documentoNumero: numero }]
      : s.caja,
    documentos: [...s.documentos, {
      id: comprobanteId, nombre: nombreArchivo, tipo: 'Comprobante de venta', tamanoKb: 118,
      fecha, entidad: 'Venta', entidadId: ventaId, rutaS3: `${BUCKET_S3}/comprobantes/${nombreArchivo}`,
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });

  return { ok: true, id: ventaId };
}

/* ───────── Compras ───────── */

export interface DatosCompra {
  proveedorId: string; almacenId: string; condicion: CondicionPago; detalle: LineaEntrada[];
}

function registrarCompra(d: DatosCompra): Resultado {
  const M = 'Compras', A = 'Registrar compra';
  const s = state;
  if (s.compras.length >= LIMITE_REGISTROS) {
    return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en compras.`);
  }
  if (!s.proveedores.some((p) => p.id === d.proveedorId && p.estado === 'Activo')) return rechazar(M, A, 'Selecciona un proveedor activo.');
  if (!s.almacenes.some((a) => a.id === d.almacenId && a.estado === 'Activo')) return rechazar(M, A, 'Selecciona un almacén activo.');
  const errLinea = lineasValidas(s, d.detalle);
  if (errLinea) return rechazar(M, A, errLinea);

  const fecha = ahora();
  const numero = `C-${String(s.compras.length + 1).padStart(4, '0')}`;
  const { detalle, subtotal, igv, total } = armarDetalle(d.detalle);

  const movimientos: MovimientoInventario[] = [];
  for (const l of detalle) {
    const actual = stockDe([...s.movimientos, ...movimientos], l.productoId, d.almacenId);
    movimientos.push({
      id: nuevoId('MOV'), fecha, tipo: 'Entrada', origen: 'Compra', documentoNumero: numero,
      productoId: l.productoId, almacenId: d.almacenId, cantidad: l.cantidad, saldo: actual + l.cantidad,
    });
  }

  const compraId = nuevoId('CMP');
  const facturaId = nuevoId('DOC');
  const nombreArchivo = `${numero}.pdf`;

  commit({
    ...s,
    compras: [...s.compras, {
      id: compraId, numero, fecha, proveedorId: d.proveedorId, almacenId: d.almacenId,
      condicion: d.condicion, detalle, subtotal, igv, total, estado: 'Recibida', facturaId,
    }],
    movimientos: [...s.movimientos, ...movimientos],
    cuentas: d.condicion === 'Crédito'
      ? [...s.cuentas, {
          id: nuevoId('CXP'), tipo: 'Pagar', documentoNumero: numero, terceroId: d.proveedorId,
          monto: total, saldo: total, vencimiento: sumarDias(fecha, 30), estado: 'Pendiente',
        }]
      : s.cuentas,
    caja: d.condicion === 'Contado'
      ? [...s.caja, { id: nuevoId('CAJ'), fecha, tipo: 'Egreso', concepto: `Compra ${numero}`, monto: total, documentoNumero: numero }]
      : s.caja,
    documentos: [...s.documentos, {
      id: facturaId, nombre: nombreArchivo, tipo: 'Factura de proveedor', tamanoKb: 96,
      fecha, entidad: 'Compra', entidadId: compraId, rutaS3: `${BUCKET_S3}/facturas/${nombreArchivo}`,
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });

  return { ok: true, id: compraId };
}

/* ───────── Finanzas ───────── */

function liquidarCuenta(cuentaId: string): Resultado {
  const M = 'Finanzas';
  const cuenta = state.cuentas.find((c) => c.id === cuentaId);
  if (!cuenta) return rechazar(M, 'Liquidar cuenta', 'La cuenta no existe.');
  if (cuenta.estado === 'Cancelada') return rechazar(M, 'Liquidar cuenta', 'La cuenta ya está cancelada.');

  const esCobro = cuenta.tipo === 'Cobrar';
  commit({
    ...state,
    cuentas: state.cuentas.map((c) => (c.id === cuentaId ? { ...c, saldo: 0, estado: 'Cancelada' } : c)),
    caja: [...state.caja, {
      id: nuevoId('CAJ'), fecha: ahora(), tipo: esCobro ? 'Ingreso' : 'Egreso',
      concepto: `${esCobro ? 'Cobro' : 'Pago'} ${cuenta.documentoNumero}`,
      monto: cuenta.saldo, documentoNumero: cuenta.documentoNumero,
    }],
  }, { modulo: M, accion: esCobro ? 'Registrar cobro' : 'Registrar pago', registroId: cuenta.documentoNumero, resultado: 'Exitoso' });
  return { ok: true, id: cuentaId };
}

/* ───────── API pública ───────── */

function restablecer(): void {
  commit(crearEstadoInicial(), { modulo: 'Administración', accion: 'Restablecer datos de demostración', registroId: '-', resultado: 'Exitoso' });
}

export const erpStore = {
  getState: (): ErpState => state,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  acciones: {
    crearMaestro, actualizarMaestro, eliminarMaestro,
    registrarVenta, registrarCompra, liquidarCuenta, restablecer,
  },
};
