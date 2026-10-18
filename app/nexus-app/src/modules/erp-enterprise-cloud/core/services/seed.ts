import type { ErpState } from '../types';

/**
 * Estado inicial: un registro por cada dato maestro y ninguna operación.
 * Las operaciones (compra, venta) las registra la persona durante la demostración.
 */
export function crearEstadoInicial(): ErpState {
  return {
    clientes: [{
      id: 'CLI-001', tipoDocumento: 'RUC', numeroDocumento: '20512345678',
      razonSocial: 'Distribuidora Andina S.A.C.', correo: 'compras@andina.pe',
      telefono: '014567890', direccion: 'Av. Javier Prado Este 1250, San Isidro, Lima',
      limiteCredito: 20000, estado: 'Activo',
    }],
    proveedores: [{
      id: 'PRV-001', ruc: '20601234567',
      razonSocial: 'Importaciones Tecnológicas del Perú S.A.C.', contacto: 'Luis Ramos',
      correo: 'ventas@itperu.pe', telefono: '017654321',
      direccion: 'Av. Argentina 2450, Callao', estado: 'Activo',
    }],
    productos: [{
      id: 'PRD-001', codigo: 'LAP-0001', nombre: 'Laptop 15.6" Core i5 16 GB',
      categoriaId: 'CAT-001', marcaId: 'MAR-001', unidadId: 'UND-001', monedaId: 'MON-001',
      precioCompra: 1800, precioVenta: 2400, stockMinimo: 5, estado: 'Activo',
    }],
    almacenes: [{
      id: 'ALM-001', nombre: 'Almacén Central', direccion: 'Av. Argentina 2450, Callao', estado: 'Activo',
    }],
    vendedores: [{
      id: 'VEN-001', nombre: 'Rosa Quispe Mendoza', documento: '45873216',
      cargo: 'Ejecutiva comercial', estado: 'Activo',
    }],
    categorias: [{ id: 'CAT-001', nombre: 'Equipos de cómputo', estado: 'Activo' }],
    marcas: [{ id: 'MAR-001', nombre: 'Lenovo', estado: 'Activo' }],
    unidades: [{ id: 'UND-001', nombre: 'Unidad', estado: 'Activo' }],
    monedas: [{ id: 'MON-001', nombre: 'Soles (PEN)', estado: 'Activo' }],
    ventas: [],
    compras: [],
    cotizaciones: [],
    ordenesVenta: [],
    ordenesCompra: [],
    movimientos: [],
    cuentas: [],
    caja: [],
    documentos: [],
    roles: [{
      id: 'ROL-001', nombre: 'Administrador',
      permisos: ['mantenimiento', 'ventas', 'compras', 'inventario', 'tesoreria',
                 'documentos', 'reportes', 'administracion', 'cloud'],
    }],
    usuarios: [{
      id: 'USR-001', nombre: 'Administrador', correo: 'admin@enterprisecloud.pe',
      rolId: 'ROL-001', estado: 'Activo',
    }],
    auditoria: [],
  };
}
