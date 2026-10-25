import {
  Users, Truck, UserCheck, Package, Building2, Tag, Award, Ruler, Coins, Landmark,
  type LucideIcon,
} from 'lucide-react';

export interface Tarjeta {
  icon: LucideIcon;
  grupo: string;
  descripcion: string;
  /** Qué módulos consumen este dato. Refuerza la separación entre datos base y operaciones. */
  usadoEn: string;
}

export const GRUPOS_TARJETAS = ['Personas y empresas', 'Productos y almacenes', 'Catálogos'];

export const TARJETAS: Record<string, Tarjeta> = {
  clientes: {
    icon: Users, grupo: 'Personas y empresas',
    descripcion: 'A quién se le vende.',
    usadoEn: 'Se selecciona en cotizaciones y órdenes de venta.',
  },
  proveedores: {
    icon: Truck, grupo: 'Personas y empresas',
    descripcion: 'A quién se le compra.',
    usadoEn: 'Se selecciona en órdenes de compra.',
  },
  vendedores: {
    icon: UserCheck, grupo: 'Personas y empresas',
    descripcion: 'Quién realiza las ventas.',
    usadoEn: 'Se asigna a cada venta y alimenta el reporte por vendedor.',
  },
  productos: {
    icon: Package, grupo: 'Productos y almacenes',
    descripcion: 'Qué se compra y se vende.',
    usadoEn: 'Se elige en ventas y compras. Su stock se ve en Inventario.',
  },
  almacenes: {
    icon: Building2, grupo: 'Productos y almacenes',
    descripcion: 'Dónde se guarda la mercadería.',
    usadoEn: 'Define dónde entra y de dónde sale el stock.',
  },
  categorias: {
    icon: Tag, grupo: 'Catálogos',
    descripcion: 'Clasifica los productos.',
    usadoEn: 'Se asigna a cada producto.',
  },
  marcas: {
    icon: Award, grupo: 'Catálogos',
    descripcion: 'Marca de cada producto.',
    usadoEn: 'Alimenta el reporte de ventas por marca.',
  },
  unidades: {
    icon: Ruler, grupo: 'Catálogos',
    descripcion: 'Cómo se mide cada producto.',
    usadoEn: 'Se asigna a cada producto.',
  },
  bancos: {
    icon: Landmark, grupo: 'Catálogos',
    descripcion: 'Entidades financieras con las que se opera.',
    usadoEn: 'Se elige al abrir una cuenta bancaria en Tesorería.',
  },
  monedas: {
    icon: Coins, grupo: 'Catálogos',
    descripcion: 'En qué moneda se valoriza.',
    usadoEn: 'Se asigna a cada producto.',
  },
};
