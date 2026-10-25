import {
  LayoutDashboard, Database, ShoppingCart, Truck, Boxes, Wallet,
  FolderOpen, BarChart3, ShieldCheck, Cloud,
  type LucideIcon,
} from 'lucide-react';

export const ERP_BASE = '/erp-enterprise-cloud';

export interface ErpSubmodulo {
  path: string;
  nombre: string;
}

export interface ErpModulo {
  path: string;
  nombre: string;
  icon: LucideIcon;
  descripcion: string;
  contiene: string[];
  justificacion: string;
  /** Pantallas del módulo. Se muestran debajo del módulo cuando está abierto. */
  submodulos?: ErpSubmodulo[];
}

export interface ErpGrupo {
  titulo: string;
  modulos: ErpModulo[];
}

/** Ruta absoluta de un módulo o de una de sus pantallas. */
export const ruta = (modulo: string, sub?: string): string =>
  `${ERP_BASE}/${modulo}${sub ? `/${sub}` : ''}`;

export const ERP_MENU: ErpGrupo[] = [
  {
    titulo: 'Principal',
    modulos: [
      {
        path: 'dashboard',
        nombre: 'Dashboard',
        icon: LayoutDashboard,
        descripcion: 'Resumen general de la operación.',
        contiene: ['Indicadores de ventas, compras y caja', 'Alertas de stock y de documentos pendientes', 'Cuentas por cobrar y por pagar', 'Utilidad'],
        justificacion: 'No guarda datos propios. Solo resume lo que producen los demás módulos.',
      },
    ],
  },
  {
    titulo: 'Maestros',
    modulos: [
      {
        path: 'mantenimiento',
        nombre: 'Mantenimiento',
        icon: Database,
        descripcion: 'Datos base que se registran una sola vez.',
        contiene: ['Clientes', 'Proveedores', 'Productos y categorías', 'Marcas y unidades', 'Monedas', 'Bancos', 'Almacenes', 'Personal y vendedores'],
        justificacion: 'Son datos maestros. Ventas y Compras los consultan, nunca los registran. Así se evita duplicar información entre áreas.',
      },
    ],
  },
  {
    titulo: 'Operaciones',
    modulos: [
      {
        path: 'ventas',
        nombre: 'Ventas',
        icon: ShoppingCart,
        descripcion: 'Del ofrecimiento al cobro, con un documento por etapa.',
        contiene: ['Cotizaciones', 'Órdenes de venta', 'Facturación', 'Estado de cuenta (cuentas por cobrar)'],
        justificacion: 'Cada documento nace del anterior: cotización, orden de venta, factura y cobro. Las cuentas por cobrar viven aquí porque vienen de clientes.',
        submodulos: [
          { path: 'cotizaciones', nombre: 'Cotizaciones' },
          { path: 'ordenes', nombre: 'Órdenes de venta' },
          { path: 'facturacion', nombre: 'Facturación' },
          { path: 'estado-cuenta', nombre: 'Estado de cuenta' },
        ],
      },
      {
        path: 'compras',
        nombre: 'Compras',
        icon: Truck,
        descripcion: 'Del pedido al proveedor hasta el pago.',
        contiene: ['Órdenes de compra', 'Kardex (recepción de mercadería)', 'Estado de cuenta (cuentas por pagar)'],
        justificacion: 'La orden de compra se recibe en Kardex, donde se verifica y entra al stock. Las cuentas por pagar viven aquí porque vienen de proveedores.',
        submodulos: [
          { path: 'ordenes', nombre: 'Órdenes de compra' },
          { path: 'kardex', nombre: 'Kardex' },
          { path: 'estado-cuenta', nombre: 'Estado de cuenta' },
        ],
      },
      {
        path: 'inventario',
        nombre: 'Inventario',
        icon: Boxes,
        descripcion: 'Existencias y movimientos por almacén.',
        contiene: ['Stock por almacén', 'Movimientos', 'Ajustes'],
        justificacion: 'Las existencias no se digitan: las generan Compras (entradas) y Ventas (salidas). Solo los ajustes se registran a mano.',
        submodulos: [
          { path: 'stock', nombre: 'Stock' },
          { path: 'movimientos', nombre: 'Movimientos' },
        ],
      },
      {
        path: 'tesoreria',
        nombre: 'Tesorería',
        icon: Wallet,
        descripcion: 'Dinero que entra y sale.',
        contiene: ['Caja: ingresos y egresos', 'Bancos: cuentas bancarias, depósitos y retiros'],
        justificacion: 'Caja y bancos son dinero real, distinto de las cuentas por cobrar y por pagar. Cada cobro o pago hecho en Ventas o Compras queda en Caja, y de ahí se deposita al banco.',
        submodulos: [{ path: 'caja', nombre: 'Caja' }, { path: 'bancos', nombre: 'Bancos' }],
      },
    ],
  },
  {
    titulo: 'Gestión',
    modulos: [
      {
        path: 'documentos',
        nombre: 'Documentos',
        icon: FolderOpen,
        descripcion: 'Repositorio de archivos empresariales.',
        contiene: ['Facturas y comprobantes', 'Contratos', 'Metadatos', 'Vínculo con la operación'],
        justificacion: 'Representa el almacenamiento de objetos (Amazon S3): el archivo va a la nube y su registro a la base de datos.',
      },
      {
        path: 'reportes',
        nombre: 'Reportes',
        icon: BarChart3,
        descripcion: 'Consultas que cruzan varios módulos.',
        contiene: ['Ventas por vendedor', 'Ventas por marca', 'Compras por proveedor', 'Inventario valorizado', 'Estado de cuenta'],
        justificacion: 'Es transversal: un reporte por marca o vendedor mezcla Ventas, Mantenimiento y Personal. Por eso no pertenece a un solo módulo.',
      },
    ],
  },
  {
    titulo: 'Sistema',
    modulos: [
      {
        path: 'administracion',
        nombre: 'Administración',
        icon: ShieldCheck,
        descripcion: 'Acceso, permisos y trazabilidad.',
        contiene: ['Usuarios', 'Roles y permisos', 'Auditoría', 'Parámetros'],
        justificacion: 'Define quién puede hacer qué en el resto de módulos y deja registro de las acciones críticas.',
      },
      {
        path: 'cloud',
        nombre: 'Cloud',
        icon: Cloud,
        descripcion: 'Análisis del sistema y costo de migración a la nube.',
        contiene: ['Tipo de proyecto', 'Porcentaje de seguridad', 'Servicios recomendados', 'Calculadora de costos'],
        justificacion: 'No es un proceso del negocio: evalúa el ERP completo para decidir qué servicios de AWS necesita.',
      },
    ],
  },
];

export const ERP_MODULOS: ErpModulo[] = ERP_MENU.flatMap((g) => g.modulos);
