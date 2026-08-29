export type Cargo = 'Administrador' | 'Analista BI' | 'Empleado' | 'Asesor CRM';

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  cargo: Cargo;
}