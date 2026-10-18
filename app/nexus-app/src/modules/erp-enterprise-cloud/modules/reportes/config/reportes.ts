import type { ErpState } from '../../../core/types';
import { stockDe } from '../../../core/services/erpStore';
import { fechaLocal, formatFecha } from '../../../core/utils/format';

export type TipoColumna = 'texto' | 'entero' | 'moneda';
export interface ColumnaReporte { titulo: string; tipo: TipoColumna }
export type CeldaReporte = string | number;

export interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  usaFechas: boolean;
  columnas: ColumnaReporte[];
  /** Columnas (por posición) que suman en la fila Total. */
  sumar: number[];
  filas: (s: ErpState, desde: string, hasta: string) => CeldaReporte[][];
}

const r2 = (n: number): number => Math.round(n * 100) / 100;
const enRango = (iso: string, desde: string, hasta: string): boolean => {
  const f = fechaLocal(iso);
  return (desde === '' || f >= desde) && (hasta === '' || f <= hasta);
};

export const REPORTES: Reporte[] = [
  {
    id: 'ventas-vendedor', titulo: 'Ventas por vendedor', usaFechas: true,
    descripcion: 'Cuánto vendió cada vendedor en el período.',
    columnas: [
      { titulo: 'Vendedor', tipo: 'texto' }, { titulo: 'Ventas', tipo: 'entero' },
      { titulo: 'Subtotal', tipo: 'moneda' }, { titulo: 'IGV', tipo: 'moneda' }, { titulo: 'Total', tipo: 'moneda' },
    ],
    sumar: [1, 2, 3, 4],
    filas: (s, desde, hasta) => {
      const ventas = s.ventas.filter((v) => v.estado === 'Emitida' && enRango(v.fecha, desde, hasta));
      return s.vendedores.map((vend) => {
        const propias = ventas.filter((v) => v.vendedorId === vend.id);
        return [vend.nombre, propias.length,
          r2(propias.reduce((a, v) => a + v.subtotal, 0)),
          r2(propias.reduce((a, v) => a + v.igv, 0)),
          r2(propias.reduce((a, v) => a + v.total, 0))];
      });
    },
  },
  {
    id: 'ventas-marca', titulo: 'Ventas por marca', usaFechas: true,
    descripcion: 'Unidades e importe vendido por cada marca.',
    columnas: [
      { titulo: 'Marca', tipo: 'texto' }, { titulo: 'Unidades vendidas', tipo: 'entero' }, { titulo: 'Importe sin IGV', tipo: 'moneda' },
    ],
    sumar: [1, 2],
    filas: (s, desde, hasta) => {
      const lineas = s.ventas
        .filter((v) => v.estado === 'Emitida' && enRango(v.fecha, desde, hasta))
        .flatMap((v) => v.detalle);
      return s.marcas.map((m) => {
        const propias = lineas.filter((l) => s.productos.find((p) => p.id === l.productoId)?.marcaId === m.id);
        return [m.nombre, propias.reduce((a, l) => a + l.cantidad, 0), r2(propias.reduce((a, l) => a + l.subtotal, 0))];
      });
    },
  },
  {
    id: 'compras-proveedor', titulo: 'Compras por proveedor', usaFechas: true,
    descripcion: 'Cuánto se compró a cada proveedor en el período.',
    columnas: [
      { titulo: 'Proveedor', tipo: 'texto' }, { titulo: 'Compras', tipo: 'entero' },
      { titulo: 'Subtotal', tipo: 'moneda' }, { titulo: 'IGV', tipo: 'moneda' }, { titulo: 'Total', tipo: 'moneda' },
    ],
    sumar: [1, 2, 3, 4],
    filas: (s, desde, hasta) => {
      const compras = s.compras.filter((c) => c.estado === 'Recibida' && enRango(c.fecha, desde, hasta));
      return s.proveedores.map((prov) => {
        const propias = compras.filter((c) => c.proveedorId === prov.id);
        return [prov.razonSocial, propias.length,
          r2(propias.reduce((a, c) => a + c.subtotal, 0)),
          r2(propias.reduce((a, c) => a + c.igv, 0)),
          r2(propias.reduce((a, c) => a + c.total, 0))];
      });
    },
  },
  {
    id: 'kardex-valorizado', titulo: 'Inventario valorizado', usaFechas: false,
    descripcion: 'Stock actual por producto y almacén, valorizado a precio de compra.',
    columnas: [
      { titulo: 'Producto', tipo: 'texto' }, { titulo: 'Almacén', tipo: 'texto' }, { titulo: 'Stock', tipo: 'entero' },
      { titulo: 'Costo unitario', tipo: 'moneda' }, { titulo: 'Valor', tipo: 'moneda' },
    ],
    sumar: [2, 4],
    filas: (s) => s.productos.flatMap((p) => s.almacenes.map((a) => {
      const stock = stockDe(s.movimientos, p.id, a.id);
      return [p.nombre, a.nombre, stock, p.precioCompra, r2(stock * p.precioCompra)];
    })),
  },
  {
    id: 'estado-cuenta', titulo: 'Estado de cuenta', usaFechas: false,
    descripcion: 'Cuentas por cobrar y por pagar con su saldo.',
    columnas: [
      { titulo: 'Tipo', tipo: 'texto' }, { titulo: 'Cliente / Proveedor', tipo: 'texto' }, { titulo: 'Documento', tipo: 'texto' },
      { titulo: 'Vence', tipo: 'texto' }, { titulo: 'Monto', tipo: 'moneda' }, { titulo: 'Saldo', tipo: 'moneda' },
    ],
    sumar: [4, 5],
    filas: (s) => s.cuentas.map((c) => [
      c.tipo === 'Cobrar' ? 'Por cobrar' : 'Por pagar',
      (c.tipo === 'Cobrar'
        ? s.clientes.find((x) => x.id === c.terceroId)?.razonSocial
        : s.proveedores.find((x) => x.id === c.terceroId)?.razonSocial) ?? '-',
      c.documentoNumero, formatFecha(c.vencimiento), c.monto, c.saldo,
    ]),
  },
];

/** Agrega al final la fila Total cuando el reporte tiene filas y columnas sumables. */
export function conTotal(r: Reporte, filas: CeldaReporte[][]): CeldaReporte[][] {
  if (filas.length === 0 || r.sumar.length === 0) return filas;
  const total: CeldaReporte[] = r.columnas.map((_, i) =>
    r.sumar.includes(i) ? r2(filas.reduce((a, f) => a + Number(f[i]), 0)) : '',
  );
  total[0] = 'Total';
  return [...filas, total];
}
