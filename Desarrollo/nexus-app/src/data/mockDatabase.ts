import type { AccountUser, Project } from '../types/auth';

// 1. Proyectos Iniciales de la Empresa
export const INITIAL_PROJECTS: Project[] = [
  { id: 1, titulo: 'PROYECTO BIG DATA & ANALÍTICA', nrc: '202620-BD-01-NRC_7540', estado: 'Activo', lider: 'CESAR ERINSON CARLOS ZAMB', bg: 'from-blue-700 to-indigo-900', colorBar: 'bg-blue-600' },
  { id: 2, titulo: 'GESTIÓN CRM & PIPELINE VENTAS', nrc: '202620-CRM-02-NRC_7396', estado: 'Activo', lider: 'LEONARD DEV', bg: 'from-slate-800 to-blue-900', colorBar: 'bg-indigo-600' },
  { id: 3, titulo: 'MIGRACIÓN CLOUD AWS', nrc: '202620-AWS-03-NRC_7545', estado: 'Inactivo', lider: 'ALCIDES LLANOS NIETO', bg: 'from-slate-700 to-slate-900', colorBar: 'bg-amber-500' },
  { id: 4, titulo: 'MODELADO DE DATOS POSTGRES', nrc: '202620-BD-05-NRC_9351', estado: 'Pendiente', lider: 'JUAN JOSE LEON SUIYON', bg: 'from-amber-700 to-amber-900', colorBar: 'bg-emerald-600' },
];

// 2. Usuarios Iniciales del Sistema
export const INITIAL_USERS: AccountUser[] = [
  {
    id: '001600055-SYS',
    gmailPersonal: 'ramirez@gmail.com',
    correoEmpresarial: 'admin@nexus.com',
    rol: 'admin',
    proyecto: null,
    estado: 'Activo',
    passwordTemp: 'NEXUS_SYS_MASTER_2026#',
    ultimoIngreso: 'Hoy, 08:45 PM',
    esAdminGeneral: true
  },
  {
    id: '001600088-ADM',
    gmailPersonal: 'carlos.dev@gmail.com',
    correoEmpresarial: 'carlos.doc@nexus.corp',
    rol: 'admin',
    proyecto: null,
    estado: 'Activo',
    passwordTemp: 'DocPass9982!',
    ultimoIngreso: 'Ayer, 04:12 PM',
    esAdminGeneral: false
  },
  {
    id: '001600102-EMP',
    gmailPersonal: 'sistemas.dev@gmail.com',
    correoEmpresarial: 'ramirez.dev@nexus.corp',
    rol: 'empleado',
    proyecto: 'PROYECTO BIG DATA & ANALÍTICA',
    estado: 'Activo',
    passwordTemp: 'Ramirez2026$',
    ultimoIngreso: 'Hace 3 horas',
    esAdminGeneral: false
  }
];

// Funciones Auxiliares para obtener y guardar en localStorage

export const getStoredUsers = (): AccountUser[] => {
  const data = localStorage.getItem('nexus_users');
  return data ? JSON.parse(data) : INITIAL_USERS;
};

export const saveUsers = (users: AccountUser[]) => {
  localStorage.setItem('nexus_users', JSON.stringify(users));
};