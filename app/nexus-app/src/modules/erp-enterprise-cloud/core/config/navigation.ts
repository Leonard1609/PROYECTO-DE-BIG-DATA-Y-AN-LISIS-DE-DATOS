import {
  LayoutDashboard, Database, ShoppingCart, Truck, Boxes, Wallet,
  FolderOpen, BarChart3, ShieldCheck, Cloud,
  type LucideIcon,
} from 'lucide-react';

export const ERP_BASE = '/erp-enterprise-cloud';

export interface ErpModulo {
  path: string;
  nombre: string;
  icon: LucideIcon;
  descripcion: string;
  contiene: string[];
  justificacion: string;
}

export interface ErpGrupo {
  titulo: string;
  modulos: ErpModulo[];
}

export const ERP_MENU: ErpGrupo[] = [
  {
    titulo: 'Principal',
    modulos: [
      {
        path: 'dashboard',
        nombre: 'Dashboard',
        icon: LayoutDashboard,
        descripcion: 'Resumen general de la operación.',
        contiene: ['Indicadores de ventas, compras y stock', 'Alertas de stock crítico', 'Cuentas por cobrar y por pagar', 'Utilidad'],
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
        contiene: ['Clientes', 'Proveedores', 'Productos y categorías', 'Marcas y unidades', 'Monedas', 'Almacenes', 'Personal y vendedores', 'Tipos de documento'],
        justificacion: 'Son datos maestros. Ventas y compras los consultan, nunca los registran. Así se evita duplicar información entre áreas.',
      },
    ],
  },
  {
    titulo: 'Operaciones',
    modulos: [
      {
        path: 'comercial',
        nombre: 'Comercial',
        icon: ShoppingCart,
        descripcion: 'Proceso de venta, de la cotización al cobro.',
        contiene: ['Cotizaciones', 'Pedidos', 'Ventas', 'Comprobantes', 'Cobros y devoluciones'],
        justificacion: 'Cada documento nace del anterior. Selecciona clientes y productos de Mantenimiento.',
      },
      {
        path: 'compras',
        nombre: 'Compras',
        icon: Truck,
        descripcion: 'Proceso de abastecimiento con proveedores.',
        contiene: ['Solicitudes', 'Órdenes de compra', 'Recepción', 'Facturas de proveedor', 'Pagos y devoluciones'],
        justificacion: 'Es el espejo de Comercial del lado del proveedor. Su efecto es aumentar el stock.',
      },
      {
        path: 'inventario',
        nombre: 'Inventario',
        icon: Boxes,
        descripcion: 'Existencias y movimientos por almacén.',
        contiene: ['Stock por almacén', 'Kardex', 'Transferencias', 'Ajustes'],
        justificacion: 'Los movimientos los generan las ventas y compras, no se digitan a mano. El producto en sí vive en Mantenimiento.',
      },
      {
        path: 'finanzas',
        nombre: 'Finanzas',
        icon: Wallet,
        descripcion: 'Efecto monetario de las operaciones.',
        contiene: ['Cuentas por cobrar', 'Cuentas por pagar', 'Caja', 'Bancos', 'Ingresos y egresos'],
        justificacion: 'Comercial registra el hecho comercial; Finanzas lleva el saldo del dinero.',
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
        contiene: ['Ventas por vendedor', 'Ventas por marca', 'Compras por proveedor', 'Kardex valorizado', 'Estado de cuenta'],
        justificacion: 'Es transversal: un reporte por marca o vendedor mezcla Comercial, Mantenimiento y Personal. Por eso no pertenece a un solo módulo.',
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
        contiene: ['Usuarios', 'Roles', 'Permisos', 'Parámetros', 'Auditoría'],
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
