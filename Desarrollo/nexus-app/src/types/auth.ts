export type Role = 'admin_general' | 'admin' | 'analista' | 'empleado';

export interface Project {
  id: number;
  titulo: string;
  nrc: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
  lider: string;
  bg: string;
  colorBar: string;
}

export interface AccountUser {
  id: string;
  gmailPersonal: string;
  correoEmpresarial: string;
  rol: 'admin' | 'analista' | 'empleado';
  proyecto: string | null;
  estado: 'Pendiente Fase 2' | 'Activo' | 'Inactivo';
  passwordTemp: string;
  ultimoIngreso: string;
  esAdminGeneral?: boolean;
}