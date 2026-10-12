export type Estado = 'Activo' | 'Inactivo';
export type CondicionPago = 'Contado' | 'Crédito';

/* ───────── Mantenimiento (datos maestros) ───────── */

/** Catálogo simple: categorías, marcas, unidades y monedas. */
export interface Maestro {
  id: string;
  nombre: string;
  estado: Estado;
}

export interface Cliente {
  id: string;
  tipoDocumento: 'RUC' | 'DNI';
  numeroDocumento: string;
  razonSocial: string;
  correo: string;
  telefono: string;
  direccion: string;
  limiteCredito: number;
  estado: Estado;
}

export interface Proveedor {
  id: string;
  ruc: string;
  razonSocial: string;
  contacto: string;
  correo: string;
  telefono: string;
  direccion: string;
  estado: Estado;
}

export interface Almacen {
  id: string;
  nombre: string;
  direccion: string;
  estado: Estado;
}

export interface Vendedor {
  id: string;
  nombre: string;
  documento: string;
  cargo: string;
  estado: Estado;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoriaId: string;
  marcaId: string;
  unidadId: string;
  monedaId: string;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  estado: Estado;
}

/* ───────── Operaciones ───────── */

export interface LineaDetalle {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  numero: string;
  fecha: string;
  clienteId: string;
  vendedorId: string;
  almacenId: string;
  condicion: CondicionPago;
  detalle: LineaDetalle[];
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Emitida' | 'Anulada';
  comprobanteId: string;
}

export interface Compra {
  id: string;
  numero: string;
  fecha: string;
  proveedorId: string;
  almacenId: string;
  condicion: CondicionPago;
  detalle: LineaDetalle[];
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Recibida' | 'Anulada';
  facturaId: string;
}

/* ───────── Inventario ───────── */

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: 'Entrada' | 'Salida';
  origen: 'Compra' | 'Venta' | 'Ajuste';
  documentoNumero: string;
  productoId: string;
  almacenId: string;
  cantidad: number;
  saldo: number;
  motivo?: string;
}

/* ───────── Finanzas ───────── */

export interface CuentaFinanciera {
  id: string;
  tipo: 'Cobrar' | 'Pagar';
  documentoNumero: string;
  terceroId: string;
  monto: number;
  saldo: number;
  vencimiento: string;
  estado: 'Pendiente' | 'Cancelada';
}

export interface MovimientoCaja {
  id: string;
  fecha: string;
  tipo: 'Ingreso' | 'Egreso';
  concepto: string;
  monto: number;
  documentoNumero: string;
}

/* ───────── Documentos ───────── */

export interface Documento {
  id: string;
  nombre: string;
  tipo: 'Comprobante de venta' | 'Factura de proveedor' | 'Contrato' | 'Otro';
  tamanoKb: number;
  fecha: string;
  entidad: 'Venta' | 'Compra' | 'Otro';
  entidadId: string;
  /** Ruta simulada del objeto en Amazon S3. */
  rutaS3: string;
}

/* ───────── Administración ───────── */

export interface Rol {
  id: string;
  nombre: string;
  permisos: string[];
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rolId: string;
  estado: Estado;
}

export interface Auditoria {
  id: string;
  fecha: string;
  usuario: string;
  modulo: string;
  accion: string;
  registroId: string;
  resultado: 'Exitoso' | 'Rechazado';
  detalle?: string;
}

/* ───────── Estado global del ERP ───────── */

export interface ErpState {
  clientes: Cliente[];
  proveedores: Proveedor[];
  productos: Producto[];
  almacenes: Almacen[];
  vendedores: Vendedor[];
  categorias: Maestro[];
  marcas: Maestro[];
  unidades: Maestro[];
  monedas: Maestro[];
  ventas: Venta[];
  compras: Compra[];
  movimientos: MovimientoInventario[];
  cuentas: CuentaFinanciera[];
  caja: MovimientoCaja[];
  documentos: Documento[];
  roles: Rol[];
  usuarios: Usuario[];
  auditoria: Auditoria[];
}

export type ColeccionMaestra =
  | 'clientes' | 'proveedores' | 'productos' | 'almacenes' | 'vendedores'
  | 'categorias' | 'marcas' | 'unidades' | 'monedas';

export type Resultado = { ok: true; id: string } | { ok: false; error: string };
