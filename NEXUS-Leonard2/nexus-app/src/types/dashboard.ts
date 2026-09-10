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
  id: number;
  origen: 'Invitación' | 'Solicitud';
  fase: string;
  destinatario: string;
  cargo: string;
  correoEmpresarial: string;
  proyecto: string;
  rol: 'Admin' | 'Analista' | 'Empleado';
  fechaEnviado: string;
  estado: 'Pendiente Activación' | 'Invitación Pendiente';
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