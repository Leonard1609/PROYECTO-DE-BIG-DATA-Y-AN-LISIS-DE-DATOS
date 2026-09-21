export interface CuentaActiva {
  id: number;
  nombre: string;
  cargo: string;
  correoNormal: string;
  correoEmpresarial: string;
  passwordPlana: string;
  rol: 'Admin' | 'Analista' | 'Empleado';
  proyecto: string;
  estado: 'Activo' | 'Inactivo';
  tiempoEstado: string;
}

export interface InvitacionSolicitud {
  id: string | number;
  origen: string;
  fase: string;
  destinatario: string;
  correoPersonal?: string;
  correoEmpresarial?: string;
  cargo?: string;
  proyecto?: string;
  rol?: string;
  fechaEnviado: string;
  estado?: string;
  // Campos del perfil amplio
  telefono?: string;
  direccion?: string;
  nivelEducacion?: string;
  empresa?: string;
}

export interface Proyecto {
  id: number;
  titulo: string;
  nrc: string;
  estado: string;
  lider: string;
  bg: string;
  colorBar: string;
}