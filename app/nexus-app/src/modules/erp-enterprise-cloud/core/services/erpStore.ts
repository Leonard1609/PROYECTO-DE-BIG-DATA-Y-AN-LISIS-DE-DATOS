import type {
  ColeccionMaestra, CondicionPago, ErpState, LineaDetalle,
  MovimientoInventario, Resultado, Auditoria,
} from '../types';
import { crearEstadoInicial } from './seed';

/** Máximo de registros por colección. Para la entrega es 1; usa Infinity para quitar el tope. */
export const LIMITE_REGISTROS = 1;
export const IGV = 0.18;
const STORAGE_KEY = 'erp-enterprise-cloud:v2';
export const USUARIO_ACTUAL_ID = 'USR-001';
export const DIAS_CREDITO = 30;
export const BUCKET_S3 = 's3://erp-enterprise-cloud-docs';

/* ───────── Núcleo del store ───────── */

function cargar(): ErpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...crearEstadoInicial(), ...(JSON.parse(raw) as Partial<ErpState>) };
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
    ? [...next.auditoria, { ...evento, id: nuevoId('AUD'), fecha: ahora(), usuario: next.usuarios.find((u) => u.id === USUARIO_ACTUAL_ID)?.nombre ?? 'Administrador' }]
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
  usuarios: { prefijo: 'USR', etiqueta: 'usuarios' },
};

function enUso(col: ColeccionMaestra, id: string, s: ErpState): boolean {
  const lineasConProducto = [...s.cotizaciones, ...s.ordenesVenta, ...s.ordenesCompra, ...s.ventas, ...s.compras];
  switch (col) {
    case 'clientes':
      return s.ventas.some((v) => v.clienteId === id) || s.cotizaciones.some((c) => c.clienteId === id)
        || s.ordenesVenta.some((o) => o.clienteId === id);
    case 'proveedores':
      return s.compras.some((c) => c.proveedorId === id) || s.ordenesCompra.some((o) => o.proveedorId === id);
    case 'productos':
      return s.movimientos.some((m) => m.productoId === id)
        || lineasConProducto.some((d) => d.detalle.some((l) => l.productoId === id));
    case 'almacenes':
      return s.movimientos.some((m) => m.almacenId === id) || lineasConProducto.some((d) => d.almacenId === id);
    case 'vendedores':
      return s.ventas.some((v) => v.vendedorId === id) || s.cotizaciones.some((c) => c.vendedorId === id)
        || s.ordenesVenta.some((o) => o.vendedorId === id);
    case 'categorias': return s.productos.some((p) => p.categoriaId === id);
    case 'marcas': return s.productos.some((p) => p.marcaId === id);
    case 'unidades': return s.productos.some((p) => p.unidadId === id);
    case 'monedas': return s.productos.some((p) => p.monedaId === id);
    case 'usuarios': return false;
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
  if (col === 'usuarios' && id === USUARIO_ACTUAL_ID) {
    return rechazar('Administración', 'Eliminar en usuarios', 'No puedes eliminar al usuario de la sesión actual.');
  }
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

const numerar = (prefijo: string, cantidadActual: number): string =>
  `${prefijo}-${String(cantidadActual + 1).padStart(4, '0')}`;

/* ───────── Ventas: cotización → orden de venta → facturación → estado de cuenta ───────── */

export interface DatosDocumentoVenta {
  clienteId: string; vendedorId: string; almacenId: string;
  condicion: CondicionPago; detalle: LineaEntrada[];
}

function errorCabeceraVenta(s: ErpState, d: DatosDocumentoVenta): string | null {
  if (!s.clientes.some((c) => c.id === d.clienteId && c.estado === 'Activo')) return 'Selecciona un cliente activo.';
  if (!s.vendedores.some((v) => v.id === d.vendedorId && v.estado === 'Activo')) return 'Selecciona un vendedor activo.';
  if (!s.almacenes.some((a) => a.id === d.almacenId && a.estado === 'Activo')) return 'Selecciona un almacén activo.';
  return lineasValidas(s, d.detalle);
}

function registrarCotizacion(d: DatosDocumentoVenta): Resultado {
  const M = 'Ventas', A = 'Registrar cotización';
  const s = state;
  if (s.cotizaciones.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en cotizaciones.`);
  const err = errorCabeceraVenta(s, d);
  if (err) return rechazar(M, A, err);

  const id = nuevoId('COT');
  const numero = numerar('COT', s.cotizaciones.length);
  commit({
    ...s,
    cotizaciones: [...s.cotizaciones, { id, numero, fecha: ahora(), ...d, ...armarDetalle(d.detalle), estado: 'Pendiente', ordenId: '' }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });
  return { ok: true, id };
}

function aceptarCotizacion(cotizacionId: string): Resultado {
  const M = 'Ventas', A = 'Aceptar cotización';
  const s = state;
  const cot = s.cotizaciones.find((c) => c.id === cotizacionId);
  if (!cot) return rechazar(M, A, 'La cotización no existe.');
  if (cot.estado !== 'Pendiente') return rechazar(M, A, 'La cotización ya fue aceptada.');
  if (s.ordenesVenta.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en órdenes de venta.`);

  const ordenId = nuevoId('OVT');
  const numero = numerar('OV', s.ordenesVenta.length);
  commit({
    ...s,
    cotizaciones: s.cotizaciones.map((c) => (c.id === cotizacionId ? { ...c, estado: 'Aceptada', ordenId } : c)),
    ordenesVenta: [...s.ordenesVenta, {
      id: ordenId, numero, fecha: ahora(), cotizacionId: cot.id, clienteId: cot.clienteId, vendedorId: cot.vendedorId,
      almacenId: cot.almacenId, condicion: cot.condicion, detalle: cot.detalle, subtotal: cot.subtotal, igv: cot.igv,
      total: cot.total, estado: 'Pendiente', ventaId: '',
    }],
  }, { modulo: M, accion: A, registroId: `${cot.numero} a ${numero}`, resultado: 'Exitoso' });
  return { ok: true, id: ordenId };
}

function registrarOrdenVenta(d: DatosDocumentoVenta): Resultado {
  const M = 'Ventas', A = 'Registrar orden de venta';
  const s = state;
  if (s.ordenesVenta.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en órdenes de venta.`);
  const err = errorCabeceraVenta(s, d);
  if (err) return rechazar(M, A, err);

  const id = nuevoId('OVT');
  const numero = numerar('OV', s.ordenesVenta.length);
  commit({
    ...s,
    ordenesVenta: [...s.ordenesVenta, {
      id, numero, fecha: ahora(), cotizacionId: '', ...d, ...armarDetalle(d.detalle), estado: 'Pendiente', ventaId: '',
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });
  return { ok: true, id };
}

/** Emite la factura de una orden de venta: descuenta stock, archiva el comprobante y abre el estado de cuenta. */
function facturarOrdenVenta(ordenId: string): Resultado {
  const M = 'Ventas', A = 'Emitir factura';
  const s = state;
  const orden = s.ordenesVenta.find((o) => o.id === ordenId);
  if (!orden) return rechazar(M, A, 'La orden de venta no existe.');
  if (orden.estado === 'Facturada') return rechazar(M, A, 'La orden ya fue facturada.');
  if (s.ventas.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en facturas.`);

  const cliente = s.clientes.find((c) => c.id === orden.clienteId && c.estado === 'Activo');
  if (!cliente) return rechazar(M, A, 'El cliente de la orden ya no está activo.');
  if (orden.condicion === 'Crédito' && orden.total > cliente.limiteCredito) {
    return rechazar(M, A, 'El total supera el límite de crédito del cliente.');
  }

  const fecha = ahora();
  const numero = numerar('F001', s.ventas.length);
  const movimientos: MovimientoInventario[] = [];
  for (const l of orden.detalle) {
    const disponible = stockDe([...s.movimientos, ...movimientos], l.productoId, orden.almacenId);
    if (disponible < l.cantidad) {
      return rechazar(M, A, `Stock insuficiente: disponible ${disponible}, solicitado ${l.cantidad}.`);
    }
    movimientos.push({
      id: nuevoId('MOV'), fecha, tipo: 'Salida', origen: 'Venta', documentoNumero: numero,
      productoId: l.productoId, almacenId: orden.almacenId, cantidad: l.cantidad, saldo: disponible - l.cantidad,
    });
  }

  const contado = orden.condicion === 'Contado';
  const ventaId = nuevoId('VTA');
  const comprobanteId = nuevoId('DOC');
  const nombreArchivo = `${numero}.pdf`;

  commit({
    ...s,
    ventas: [...s.ventas, {
      id: ventaId, numero, fecha, clienteId: orden.clienteId, vendedorId: orden.vendedorId, almacenId: orden.almacenId,
      condicion: orden.condicion, detalle: orden.detalle, subtotal: orden.subtotal, igv: orden.igv, total: orden.total,
      estado: 'Emitida', comprobanteId, ordenId: orden.id, estadoPago: contado ? 'Pagada' : 'Pendiente',
    }],
    ordenesVenta: s.ordenesVenta.map((o) => (o.id === orden.id ? { ...o, estado: 'Facturada', ventaId } : o)),
    movimientos: [...s.movimientos, ...movimientos],
    cuentas: [...s.cuentas, {
      id: nuevoId('CXC'), tipo: 'Cobrar', documentoNumero: numero, terceroId: orden.clienteId, monto: orden.total,
      saldo: contado ? 0 : orden.total, vencimiento: contado ? fecha : sumarDias(fecha, DIAS_CREDITO),
      estado: contado ? 'Cancelada' : 'Pendiente',
    }],
    caja: contado
      ? [...s.caja, { id: nuevoId('CAJ'), fecha, tipo: 'Ingreso', concepto: `Cobro ${numero}`, monto: orden.total, documentoNumero: numero }]
      : s.caja,
    documentos: [...s.documentos, {
      id: comprobanteId, nombre: nombreArchivo, tipo: 'Comprobante de venta', tamanoKb: 118,
      fecha, entidad: 'Venta', entidadId: ventaId, rutaS3: `${BUCKET_S3}/comprobantes/${nombreArchivo}`,
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });
  return { ok: true, id: ventaId };
}

/* ───────── Compras: orden de compra → Kardex (recepción) → estado de cuenta ───────── */

export interface DatosOrdenCompra {
  proveedorId: string; almacenId: string; condicion: CondicionPago; detalle: LineaEntrada[];
}

function registrarOrdenCompra(d: DatosOrdenCompra): Resultado {
  const M = 'Compras', A = 'Registrar orden de compra';
  const s = state;
  if (s.ordenesCompra.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en órdenes de compra.`);
  if (!s.proveedores.some((p) => p.id === d.proveedorId && p.estado === 'Activo')) return rechazar(M, A, 'Selecciona un proveedor activo.');
  if (!s.almacenes.some((a) => a.id === d.almacenId && a.estado === 'Activo')) return rechazar(M, A, 'Selecciona un almacén activo.');
  const errLinea = lineasValidas(s, d.detalle);
  if (errLinea) return rechazar(M, A, errLinea);

  const id = nuevoId('ORC');
  const numero = numerar('OC', s.ordenesCompra.length);
  commit({
    ...s,
    ordenesCompra: [...s.ordenesCompra, { id, numero, fecha: ahora(), ...d, ...armarDetalle(d.detalle), estado: 'Pendiente', compraId: '' }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });
  return { ok: true, id };
}

/** Recibe la orden en Kardex: entra el stock, se archiva la factura y se abre el estado de cuenta. */
function recibirOrdenCompra(ordenId: string): Resultado {
  const M = 'Compras', A = 'Recibir en Kardex';
  const s = state;
  const orden = s.ordenesCompra.find((o) => o.id === ordenId);
  if (!orden) return rechazar(M, A, 'La orden de compra no existe.');
  if (orden.estado === 'Recibida') return rechazar(M, A, 'La orden ya fue recibida.');
  if (s.compras.length >= LIMITE_REGISTROS) return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en recepciones.`);
  if (!s.proveedores.some((p) => p.id === orden.proveedorId && p.estado === 'Activo')) return rechazar(M, A, 'El proveedor de la orden ya no está activo.');

  const fecha = ahora();
  const numero = numerar('REC', s.compras.length);
  const movimientos: MovimientoInventario[] = [];
  for (const l of orden.detalle) {
    const actual = stockDe([...s.movimientos, ...movimientos], l.productoId, orden.almacenId);
    movimientos.push({
      id: nuevoId('MOV'), fecha, tipo: 'Entrada', origen: 'Compra', documentoNumero: numero,
      productoId: l.productoId, almacenId: orden.almacenId, cantidad: l.cantidad, saldo: actual + l.cantidad,
    });
  }

  const contado = orden.condicion === 'Contado';
  const compraId = nuevoId('CMP');
  const facturaId = nuevoId('DOC');
  const nombreArchivo = `${numero}.pdf`;

  commit({
    ...s,
    compras: [...s.compras, {
      id: compraId, numero, fecha, proveedorId: orden.proveedorId, almacenId: orden.almacenId, condicion: orden.condicion,
      detalle: orden.detalle, subtotal: orden.subtotal, igv: orden.igv, total: orden.total, estado: 'Recibida', facturaId,
      ordenId: orden.id, estadoPago: contado ? 'Pagada' : 'Pendiente',
    }],
    ordenesCompra: s.ordenesCompra.map((o) => (o.id === orden.id ? { ...o, estado: 'Recibida', compraId } : o)),
    movimientos: [...s.movimientos, ...movimientos],
    cuentas: [...s.cuentas, {
      id: nuevoId('CXP'), tipo: 'Pagar', documentoNumero: numero, terceroId: orden.proveedorId, monto: orden.total,
      saldo: contado ? 0 : orden.total, vencimiento: contado ? fecha : sumarDias(fecha, DIAS_CREDITO),
      estado: contado ? 'Cancelada' : 'Pendiente',
    }],
    caja: contado
      ? [...s.caja, { id: nuevoId('CAJ'), fecha, tipo: 'Egreso', concepto: `Pago ${numero}`, monto: orden.total, documentoNumero: numero }]
      : s.caja,
    documentos: [...s.documentos, {
      id: facturaId, nombre: nombreArchivo, tipo: 'Factura de proveedor', tamanoKb: 96,
      fecha, entidad: 'Compra', entidadId: compraId, rutaS3: `${BUCKET_S3}/facturas/${nombreArchivo}`,
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso' });
  return { ok: true, id: compraId };
}

/* ───────── Inventario ───────── */

export interface DatosAjuste {
  productoId: string; almacenId: string; tipo: 'Entrada' | 'Salida'; cantidad: number; motivo: string;
}

function registrarAjuste(d: DatosAjuste): Resultado {
  const M = 'Inventario', A = 'Registrar ajuste';
  const s = state;
  if (!s.productos.some((p) => p.id === d.productoId && p.estado === 'Activo')) return rechazar(M, A, 'Selecciona un producto activo.');
  if (!s.almacenes.some((a) => a.id === d.almacenId && a.estado === 'Activo')) return rechazar(M, A, 'Selecciona un almacén activo.');
  if (!Number.isInteger(d.cantidad) || d.cantidad <= 0) return rechazar(M, A, 'La cantidad debe ser un entero mayor que cero.');
  if (d.motivo.trim() === '') return rechazar(M, A, 'Indica el motivo del ajuste.');

  const actual = stockDe(s.movimientos, d.productoId, d.almacenId);
  if (d.tipo === 'Salida' && d.cantidad > actual) return rechazar(M, A, `Stock insuficiente. Disponible: ${actual}.`);

  const numero = `AJ-${String(s.movimientos.filter((m) => m.origen === 'Ajuste').length + 1).padStart(4, '0')}`;
  const id = nuevoId('MOV');
  commit({
    ...s,
    movimientos: [...s.movimientos, {
      id, fecha: ahora(), tipo: d.tipo, origen: 'Ajuste', documentoNumero: numero,
      productoId: d.productoId, almacenId: d.almacenId, cantidad: d.cantidad,
      saldo: d.tipo === 'Entrada' ? actual + d.cantidad : actual - d.cantidad, motivo: d.motivo.trim(),
    }],
  }, { modulo: M, accion: A, registroId: numero, resultado: 'Exitoso', detalle: d.motivo.trim() });
  return { ok: true, id };
}

/* ───────── Estado de cuenta: cobros y pagos ───────── */

/** Cobra o paga el saldo de una cuenta. Actualiza caja y marca la factura o recepción como pagada. */
function liquidarCuenta(cuentaId: string): Resultado {
  const cuenta = state.cuentas.find((c) => c.id === cuentaId);
  const esCobro = cuenta?.tipo === 'Cobrar';
  const M = esCobro ? 'Ventas' : 'Compras';
  if (!cuenta) return rechazar('Tesorería', 'Liquidar cuenta', 'La cuenta no existe.');
  if (cuenta.estado === 'Cancelada') return rechazar(M, 'Liquidar cuenta', 'La cuenta ya está cancelada.');

  commit({
    ...state,
    cuentas: state.cuentas.map((c) => (c.id === cuentaId ? { ...c, saldo: 0, estado: 'Cancelada' } : c)),
    ventas: esCobro
      ? state.ventas.map((v) => (v.numero === cuenta.documentoNumero ? { ...v, estadoPago: 'Pagada' } : v))
      : state.ventas,
    compras: esCobro
      ? state.compras
      : state.compras.map((c) => (c.numero === cuenta.documentoNumero ? { ...c, estadoPago: 'Pagada' } : c)),
    caja: [...state.caja, {
      id: nuevoId('CAJ'), fecha: ahora(), tipo: esCobro ? 'Ingreso' : 'Egreso',
      concepto: `${esCobro ? 'Cobro' : 'Pago'} ${cuenta.documentoNumero}`,
      monto: cuenta.saldo, documentoNumero: cuenta.documentoNumero,
    }],
  }, { modulo: M, accion: esCobro ? 'Registrar cobro' : 'Registrar pago', registroId: cuenta.documentoNumero, resultado: 'Exitoso' });
  return { ok: true, id: cuentaId };
}

/* ───────── Documentos ───────── */

export interface DatosDocumento {
  nombre: string; tamanoKb: number; tipo: 'Contrato' | 'Otro';
  entidad: 'Venta' | 'Compra' | 'Otro'; entidadId: string;
}

export const EXTENSIONES_PERMITIDAS = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'xlsx'];
export const MAX_ARCHIVO_KB = 5120;
const esManual = (tipo: string): boolean => tipo === 'Contrato' || tipo === 'Otro';

function registrarDocumento(d: DatosDocumento): Resultado {
  const M = 'Documentos', A = 'Subir documento';
  const s = state;
  const nombre = d.nombre.trim();
  const ext = nombre.split('.').pop()?.toLowerCase() ?? '';
  if (nombre === '') return rechazar(M, A, 'Selecciona un archivo.');
  if (!EXTENSIONES_PERMITIDAS.includes(ext)) return rechazar(M, A, `Formato no permitido. Usa: ${EXTENSIONES_PERMITIDAS.join(', ')}.`);
  if (d.tamanoKb > MAX_ARCHIVO_KB) return rechazar(M, A, 'El archivo supera los 5 MB permitidos.');
  if (s.documentos.filter((x) => esManual(x.tipo)).length >= LIMITE_REGISTROS) {
    return rechazar(M, A, `Se alcanzó el límite de ${LIMITE_REGISTROS} registro en documentos subidos.`);
  }
  if (d.entidad === 'Venta' && !s.ventas.some((v) => v.id === d.entidadId)) return rechazar(M, A, 'La venta indicada no existe.');
  if (d.entidad === 'Compra' && !s.compras.some((c) => c.id === d.entidadId)) return rechazar(M, A, 'La compra indicada no existe.');

  const id = nuevoId('DOC');
  commit({
    ...s,
    documentos: [...s.documentos, {
      id, nombre, tipo: d.tipo, tamanoKb: d.tamanoKb, fecha: ahora(), entidad: d.entidad,
      entidadId: d.entidad === 'Otro' ? '' : d.entidadId,
      rutaS3: `${BUCKET_S3}/archivos/${nombre.replace(/[^\w.-]+/g, '_')}`,
    }],
  }, { modulo: M, accion: A, registroId: nombre, resultado: 'Exitoso' });
  return { ok: true, id };
}

function eliminarDocumento(id: string): Resultado {
  const M = 'Documentos', A = 'Eliminar documento';
  const doc = state.documentos.find((x) => x.id === id);
  if (!doc) return rechazar(M, A, 'El documento no existe.');
  if (!esManual(doc.tipo)) return rechazar(M, A, 'Los comprobantes y facturas los genera el sistema y no se eliminan.');
  commit({ ...state, documentos: state.documentos.filter((x) => x.id !== id) },
    { modulo: M, accion: A, registroId: doc.nombre, resultado: 'Exitoso' });
  return { ok: true, id };
}

/* ───────── Administración ───────── */

export const MODULOS_CON_PERMISO = [
  'mantenimiento', 'ventas', 'compras', 'inventario', 'tesoreria',
  'documentos', 'reportes', 'administracion', 'cloud',
];

function actualizarPermisos(rolId: string, permisos: string[]): Resultado {
  const M = 'Administración', A = 'Cambiar permisos';
  const rol = state.roles.find((r) => r.id === rolId);
  if (!rol) return rechazar(M, A, 'El rol no existe.');
  if (permisos.some((p) => !MODULOS_CON_PERMISO.includes(p))) return rechazar(M, A, 'Hay un permiso que no corresponde a ningún módulo.');
  const usuario = state.usuarios.find((u) => u.id === USUARIO_ACTUAL_ID);
  if (usuario?.rolId === rolId && !permisos.includes('administracion')) {
    return rechazar(M, A, 'No puedes quitar el acceso a Administración al rol de la sesión actual.');
  }
  commit({ ...state, roles: state.roles.map((r) => (r.id === rolId ? { ...r, permisos } : r)) },
    { modulo: M, accion: A, registroId: rol.nombre, resultado: 'Exitoso', detalle: `${permisos.length} módulos permitidos` });
  return { ok: true, id: rolId };
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
    registrarCotizacion, aceptarCotizacion, registrarOrdenVenta, facturarOrdenVenta,
    registrarOrdenCompra, recibirOrdenCompra, registrarAjuste, liquidarCuenta,
    registrarDocumento, eliminarDocumento, actualizarPermisos, restablecer,
  },
};
