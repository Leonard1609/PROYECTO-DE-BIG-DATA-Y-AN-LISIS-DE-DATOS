import React, { useState } from 'react';
import { 
  User, 
  FolderKanban, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  Search, 
  Grid, 
  List, 
  Star, 
  UserPlus, 
  X,
  CheckCircle2,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
  Mail,
  Briefcase,
  Key,
  Clock,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

interface CuentaActiva {
  id: number;
  nombre: string;
  cargo: string;
  correoNormal: string;
  correoEmpresarial: string;
  passwordPlana: string;
  rol: 'Admin' | 'Analista' | 'Empleado';
  proyecto: string;
  estado: 'Activo' | 'Inactivo';
  tiempoEstado: string; // Ej: "hace 3 meses" o "hace 5 días"
}

interface InvitacionSolicitud {
  id: number;
  origen: 'Invitación' | 'Solicitud';
  fase: string; // Ej: "Fase 1/1 (Correo Enviado)" o "Fase 2/2 (Datos Completados)"
  destinatario: string;
  cargo: string;
  correoEmpresarial: string;
  proyecto: string;
  rol: 'Admin' | 'Analista' | 'Empleado';
  fechaEnviado: string;
  estado: 'Pendiente Activación' | 'Invitación Pendiente';
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  // Navegación lateral
  const [activeTab, setActiveTab] = useState<'perfil' | 'proyectos' | 'mensajes' | 'accesos'>('accesos');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  // Búsqueda y Filtros de Proyectos
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // --- RECUADRO MORADO: CUENTAS ACTIVAS ---
  const [cuentasActivas, setCuentasActivas] = useState<CuentaActiva[]>([
    {
      id: 1,
      nombre: 'Cesar Erinson Carlos Zamb',
      cargo: 'Líder de Arquitectura de Datos',
      correoNormal: 'cesar.carlos@gmail.com',
      correoEmpresarial: 'ccarlos@nexus-tech.com',
      passwordPlana: 'Nx$9823#Cesar',
      rol: 'Admin',
      proyecto: 'PROYECTO BIG DATA & ANALÍTICA',
      estado: 'Activo',
      tiempoEstado: 'hace 3 meses'
    },
    {
      id: 2,
      nombre: 'Leonard Dev',
      cargo: 'Desarrollador Senior Backend',
      correoNormal: 'leonard.dev99@outlook.com',
      correoEmpresarial: 'ldev@nexus-tech.com',
      passwordPlana: 'LDev_2026!Sec',
      rol: 'Analista',
      proyecto: 'GESTIÓN CRM & PIPELINE VENTAS',
      estado: 'Activo',
      tiempoEstado: 'hace 1 mes'
    },
    {
      id: 3,
      nombre: 'Alcides Llanos Nieto',
      cargo: 'Especialista Cloud AWS',
      correoNormal: 'alcides.llanos@yahoo.com',
      correoEmpresarial: 'allanos@nexus-tech.com',
      passwordPlana: 'AwsCloud#8821',
      rol: 'Empleado',
      proyecto: 'MIGRACIÓN CLOUD AWS',
      estado: 'Inactivo',
      tiempoEstado: 'hace 5 días'
    },
    {
      id: 4,
      nombre: 'Juan Jose Leon Suiyon',
      cargo: 'Administrador de Bases de Datos',
      correoNormal: 'juan.suiyon@hotmail.com',
      correoEmpresarial: 'jsuiyon@nexus-tech.com',
      passwordPlana: 'Postgre$Pass2026',
      rol: 'Analista',
      proyecto: 'MODELADO DE DATOS POSTGRES',
      estado: 'Activo',
      tiempoEstado: 'hace 2 semanas'
    }
  ]);

  // --- RECUADRO ROJO: HISTORIAL DE INVITACIONES Y SOLICITUDES ---
  const [invitacionesSolicitudes, setInvitacionesSolicitudes] = useState<InvitacionSolicitud[]>([
    {
      id: 101,
      origen: 'Solicitud',
      fase: 'Fase 2/2 (Datos Completados)',
      destinatario: 'María Fernanda Ruiz',
      cargo: 'Analista BI',
      correoEmpresarial: 'mruiz@nexus-tech.com',
      proyecto: 'PROYECTO BIG DATA & ANALÍTICA',
      rol: 'Analista',
      fechaEnviado: '08/09/2026',
      estado: 'Pendiente Activación'
    },
    {
      id: 102,
      origen: 'Invitación',
      fase: 'Fase 1/1 (Correo Enviado)',
      destinatario: 'Carlos Eduardo Mendoza',
      cargo: 'Ingeniero de Software',
      correoEmpresarial: 'cmendoza@nexus-tech.com',
      proyecto: 'GESTIÓN CRM & PIPELINE VENTAS',
      rol: 'Empleado',
      fechaEnviado: '05/09/2026',
      estado: 'Invitación Pendiente'
    }
  ]);

  // --- FORMULARIO DE INVITACIÓN (MODAL SIMPLIFICADO) ---
  const [inviteEmailNormal, setInviteEmailNormal] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Analista' | 'Empleado'>('Analista');
  const [inviteCargo, setInviteCargo] = useState('Analista (Big Data / Operativo)');
  const [inviteProject, setInviteProject] = useState('PROYECTO BIG DATA & ANALÍTICA');

  // Autogeneración dinámica del correo empresarial
  const correoEmpresarialGenerado = inviteEmailNormal 
    ? `${inviteEmailNormal.split('@')[0].toLowerCase()}@nexus-tech.com`
    : '';

  // Proyectos Lista Base
  const proyectos = [
    { id: 1, titulo: 'PROYECTO BIG DATA & ANALÍTICA', nrc: '202620-BD-01-NRC_7540', estado: 'Activo', lider: 'CESAR ERINSON CARLOS ZAMB', bg: 'from-blue-700 to-indigo-900', colorBar: 'bg-blue-600' },
    { id: 2, titulo: 'GESTIÓN CRM & PIPELINE VENTAS', nrc: '202620-CRM-02-NRC_7396', estado: 'Activo', lider: 'LEONARD DEV', bg: 'from-slate-800 to-blue-900', colorBar: 'bg-indigo-600' },
    { id: 3, titulo: 'MIGRACIÓN CLOUD AWS', nrc: '202620-AWS-03-NRC_7545', estado: 'Inactivo', lider: 'ALCIDES LLANOS NIETO', bg: 'from-slate-700 to-slate-900', colorBar: 'bg-amber-500' },
    { id: 4, titulo: 'MODELADO DE DATOS POSTGRES', nrc: '202620-BD-05-NRC_9351', estado: 'Pendiente', lider: 'JUAN JOSE LEON SUIYON', bg: 'from-amber-700 to-amber-900', colorBar: 'bg-emerald-600' },
  ];

  const filteredProyectos = proyectos.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nrc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.lider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' ? true : p.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- MANEJO DE INVITACIONES (CREAR) ---
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaInv: InvitacionSolicitud = {
      id: Date.now(),
      origen: 'Invitación',
      fase: 'Fase 1/1 (Correo Enviado)',
      destinatario: 'Pendiente de Login',
      cargo: inviteRole === 'Admin' ? 'Administrador de Control' : inviteCargo,
      correoEmpresarial: correoEmpresarialGenerado,
      proyecto: inviteRole === 'Admin' ? 'N/A (Acceso General Admin)' : inviteProject,
      rol: inviteRole,
      fechaEnviado: new Date().toLocaleDateString('es-ES'),
      estado: 'Invitación Pendiente'
    };

    setInvitacionesSolicitudes([nuevaInv, ...invitacionesSolicitudes]);
    alert(`Invitación enviada automáticamente a ${inviteEmailNormal}`);
    
    // Resetear formulario modal
    setInviteEmailNormal('');
    setInviteRole('Analista');
    setShowInviteModal(false);
  };

  // --- ACCIÓN APROBAR Y MOVER A CUENTAS ACTIVAS ---
  const handleAprobarActivar = (item: InvitacionSolicitud) => {
    const nuevaCuenta: CuentaActiva = {
      id: Date.now(),
      nombre: item.destinatario !== 'Pendiente de Login' ? item.destinatario : 'Usuario Confirmado',
      cargo: item.cargo,
      correoNormal: 'usuario.registrado@gmail.com',
      correoEmpresarial: item.correoEmpresarial,
      passwordPlana: 'Pass2026!Active',
      rol: item.rol,
      proyecto: item.proyecto,
      estado: 'Activo',
      tiempoEstado: 'hace un momento'
    };

    setCuentasActivas([...cuentasActivas, nuevaCuenta]);
    setInvitacionesSolicitudes(invitacionesSolicitudes.filter(i => i.id !== item.id));
    alert(`La cuenta de ${item.correoEmpresarial} ha sido activada con éxito.`);
  };

  // --- ACCIÓN EDITAR ÁREA / PROYECTO (CRUD CUENTAS ACTIVAS) ---
  const handleEditarProyectoCuenta = (id: number) => {
    const nuevoProyecto = prompt("Ingrese el nuevo proyecto o área de trabajo:");
    if (nuevoProyecto) {
      setCuentasActivas(cuentasActivas.map(c => c.id === id ? { ...c, proyecto: nuevoProyecto } : c));
    }
  };

  // --- ACCIÓN BORRAR / REVOCAR ACCESO ---
  const handleEliminarCuentaActiva = (id: number) => {
    if (confirm("¿Está seguro de revocar el acceso a este usuario?")) {
      setCuentasActivas(cuentasActivas.filter(c => c.id !== id));
    }
  };

  const handleEliminarInvitacion = (id: number) => {
    setInvitacionesSolicitudes(invitacionesSolicitudes.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm">
      
      {/* 1. BARRA LATERAL UNIFICADA */}
      <aside className="w-64 bg-[#1e1e1e] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-xl font-black text-white tracking-widest">NEXUS</h1>
          </div>

          <nav className="py-2 space-y-1">
            <div 
              onClick={() => setActiveTab('perfil')}
              className={`mx-2 p-2.5 rounded-md flex items-center gap-3 cursor-pointer transition-all border ${
                activeTab === 'perfil' 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                  : 'hover:bg-zinc-800/80 border-transparent text-slate-200'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-white shrink-0 overflow-hidden">
                <User className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="font-bold text-xs uppercase truncate leading-tight">
                  {userEmail.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Admin General (Sistemas)</p>
              </div>
            </div>

            <div className="my-2 border-b border-zinc-800/80" />

            <button 
              onClick={() => setActiveTab('proyectos')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'proyectos' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Proyectos</span>
            </button>

            <button 
              onClick={() => setActiveTab('mensajes')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'mensajes' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Mensajes e Informes</span>
            </button>

            <button 
              onClick={() => setActiveTab('accesos')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'accesos' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Gestión de Accesos e Invitaciones</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-rose-400 hover:bg-zinc-800 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between min-h-[57px]">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'perfil' && 'Perfil de Usuario'}
            {activeTab === 'proyectos' && 'Proyectos'}
            {activeTab === 'mensajes' && 'Mensajes e Informes de Proyectos'}
            {activeTab === 'accesos' && 'Gestión Unificada de Accesos e Invitaciones'}
          </h1>
          
          {activeTab === 'accesos' && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-[#0056d2] text-white rounded-md text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Generar Nueva Invitación / Cargo</span>
            </button>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 p-6 overflow-y-auto space-y-6">

            {/* VISTA COMBINADA: GESTIÓN DE ACCESOS E INVITACIONES */}
            {activeTab === 'accesos' && (
              <div className="max-w-7xl mx-auto space-y-8">
                
                {/* TARJETAS RESUMEN DE CONTROL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cuentas Activas</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{cuentasActivas.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Invitaciones / Solicitudes Pendientes</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {invitacionesSolicitudes.length}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Cargos Asignados</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{cuentasActivas.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                </div>



                {/* SECCIÓN 1 (RECUADRO MORADO): HISTORIAL DE CUENTAS ACTIVAS */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Historial de Cuentas Activas y Credenciales de Acceso
                      </h2>
                      <p className="text-xs text-slate-500">Muestra datos corporativos, personales, tiempo de inactividad/permanencia y gestión CRUD de acceso.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Usuario y Cargo</th>
                          <th className="p-3">Correo Personal</th>
                          <th className="p-3">Correo Empresarial</th>
                          <th className="p-3">Contraseña Oculta</th>
                          <th className="p-3">Rol / Proyecto</th>
                          <th className="p-3">Estado / Tiempo</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cuentasActivas.map((cuenta) => (
                          <tr key={cuenta.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-slate-800">{cuenta.nombre}</p>
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                                <Briefcase className="w-3 h-3 text-blue-500" />
                                {cuenta.cargo}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-mono text-[11px]">
                              {cuenta.correoNormal}
                            </td>
                            <td className="p-3 font-mono text-[11px] font-semibold text-slate-800">
                              {cuenta.correoEmpresarial}
                            </td>
                            <td className="p-3 font-mono">
                              <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 w-fit">
                                <Key className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-700 text-[11px] font-bold">
                                  {visiblePasswords[cuenta.id] ? cuenta.passwordPlana : '••••••••••••'}
                                </span>
                                <button 
                                  onClick={() => togglePasswordVisibility(cuenta.id)}
                                  className="text-slate-400 hover:text-slate-700 transition-colors ml-1"
                                >
                                  {visiblePasswords[cuenta.id] ? (
                                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-3 space-y-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                cuenta.rol === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                cuenta.rol === 'Analista' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {cuenta.rol}
                              </span>
                              <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                                {cuenta.proyecto}
                              </p>
                            </td>
                            <td className="p-3">
                              <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                cuenta.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cuenta.estado === 'Activo' ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                {cuenta.estado} ({cuenta.tiempoEstado})
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEditarProyectoCuenta(cuenta.id)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Mover de Área / Proyecto"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleEliminarCuentaActiva(cuenta.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Revocar / Quitar Acceso"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECCIÓN 2 (RECUADRO ROJO): HISTORIAL DE INVITACIONES Y SOLICITUDES DE ACCESO */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                        Historial de Invitaciones Enviadas & Cargos Solicitados
                      </h2>
                      <p className="text-xs text-slate-500">Muestra la fase de verificación, origen de la petición y permite la aprobación directa.</p>
                    </div>

                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Invitación</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="p-3">Origen</th>
                          <th className="p-3">Fase Verificación</th>
                          <th className="p-3">Destinatario / Cargo</th>
                          <th className="p-3">Correo Empresarial</th>
                          <th className="p-3">Proyecto / Rol</th>
                          <th className="p-3">Fecha Envío</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invitacionesSolicitudes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400">
                              No hay solicitudes ni invitaciones pendientes.
                            </td>
                          </tr>
                        ) : (
                          invitacionesSolicitudes.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                  inv.origen === 'Solicitud' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {inv.origen}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  {inv.fase}
                                </span>
                              </td>
                              <td className="p-3">
                                <p className="font-bold text-slate-800">{inv.destinatario}</p>
                                <p className="text-[11px] text-slate-500">{inv.cargo}</p>
                              </td>
                              <td className="p-3 font-mono text-[11px] font-semibold text-slate-700">
                                {inv.correoEmpresarial}
                              </td>
                              <td className="p-3 text-slate-700">
                                <span className="font-bold text-[10px] block">{inv.rol}</span>
                                <span className="text-[10px] text-slate-500">{inv.proyecto}</span>
                              </td>
                              <td className="p-3 text-slate-500 font-mono text-[11px]">
                                {inv.fechaEnviado}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => handleAprobarActivar(inv)}
                                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                                    title="Aprobar y Activar Cuenta"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Activar</span>
                                  </button>
                                  <button 
                                    onClick={() => alert(`Reenviando notificación a ${inv.correoEmpresarial}`)}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Reenviar Correo"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleEliminarInvitacion(inv.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* VISTA 1: PERFIL */}
            {activeTab === 'perfil' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 relative" />
                  <div className="px-6 pb-6 pt-0 relative flex flex-col items-center -mt-16 text-center">
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-slate-800 shadow-md flex items-center justify-center text-white overflow-hidden mb-3">
                      <User className="w-14 h-14 text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                      {userEmail.split('@')[0]} (Sistemas)
                    </h2>
                    <p className="text-xs text-blue-600 font-semibold">{userEmail}</p>
                  </div>
                </div>
              </div>
            )}


            {/* VISTA 2: MENSAJES E INFORMES */}
            {activeTab === 'mensajes' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between bg-white p-4 rounded-md border border-slate-200">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Bandeja de Mensajes, Informes y Solicitudes</h2>
                    <p className="text-xs text-slate-500">Comunicaciones e informes enviados directamente por cada proyecto asignado.</p>
                  </div>
                </div>
              </div>
            )}

            {/* VISTA 3: PROYECTOS */}
            {activeTab === 'proyectos' && (
              <>
                <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 w-72 bg-white">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Busque sus proyectos..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <select className="border border-slate-300 rounded px-3 py-1.5 bg-white">
                      <option>Todos los periodos</option>
                      <option>2026 - Trimestre 1</option>
                    </select>

                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-slate-300 rounded px-3 py-1.5 bg-white font-medium"
                    >
                      <option value="Todos">Todos los estados</option>
                      <option value="Activo">Proyectos Activos</option>
                      <option value="Inactivo">Proyectos Inactivos</option>
                      <option value="Pendiente">Pendientes de activación</option>
                    </select>

                    <div className="flex items-center gap-1 border-l pl-3">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded border ${viewMode === 'grid' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'hover:bg-slate-100 border-transparent text-slate-400'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded border ${viewMode === 'list' ? 'bg-slate-200 border-slate-400 text-slate-800' : 'hover:bg-slate-100 border-transparent text-slate-400'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-500">{filteredProyectos.length} resultados</p>

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProyectos.map((p) => (
                      <div key={p.id} className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className={`h-28 bg-gradient-to-r ${p.bg} p-3 text-white flex flex-col justify-between`}>
                            <span className="text-[10px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded w-fit font-mono">
                              {p.nrc}
                            </span>
                            <h2 className="font-bold text-sm tracking-wide line-clamp-2 leading-tight">
                              {p.titulo}
                            </h2>
                          </div>

                          <div className="p-3 space-y-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                              p.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {p.estado}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium truncate uppercase pt-1">
                              Líder: {p.lider}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                          <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">Acceder al proyecto →</span>
                          <Star className="w-4 h-4 cursor-pointer hover:text-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Código</th>
                          <th className="p-3">Nombre del Proyecto</th>
                          <th className="p-3">Líder</th>
                          <th className="p-3">Estado</th>
                          <th className="p-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProyectos.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-600">{p.nrc}</td>
                            <td className="p-3 font-bold text-slate-800">{p.titulo}</td>
                            <td className="p-3 text-slate-600 uppercase">{p.lider}</td>
                            <td className="p-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                p.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' :
                                p.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button className="text-blue-600 font-semibold hover:underline">Acceder →</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

          </main>

          {/* 3. PANEL DERECHO: TAREAS PENDIENTES */}
          <aside className="w-80 bg-white border-l border-slate-200 p-5 hidden xl:block overflow-y-auto">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Tareas pendientes</h2>
            <div className="p-6 border border-dashed border-slate-200 rounded-md text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">Sin tareas pendientes</p>
            </div>
          </aside>

        </div>
      </div>

      {/* 4. MODAL SIMPLIFICADO: GENERAR INVITACIÓN DE USUARIO */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#1e1e1e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Generar Invitación</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-5 space-y-4">
              
              {/* Correo Personal / Normal (@gmail.com) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correo Personal (Gmail)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input 
                    type="email" 
                    required
                    placeholder="ejemplo@gmail.com"
                    value={inviteEmailNormal}
                    onChange={(e) => setInviteEmailNormal(e.target.value)}
                    className="w-full border border-slate-300 rounded pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Correo Empresarial Autogenerado */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Correo Empresarial (Autogenerado)
                </label>
                <input 
                  type="text" 
                  readOnly 
                  value={correoEmpresarialGenerado}
                  placeholder="ejemplo@nexus-tech.com"
                  className="w-full border border-slate-200 bg-slate-100 text-slate-600 rounded px-3 py-2 text-xs font-mono cursor-not-allowed"
                />
              </div>

              {/* Rol Asignado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rol Asignado
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Analista' | 'Empleado')}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium bg-white"
                >
                  <option value="Admin">Admin (Documentación / Control)</option>
                  <option value="Analista">Analista (Big Data / Operativo)</option>
                  <option value="Empleado">Empleado (General)</option>
                </select>
              </div>

              {/* Desplegable de Cargo (si no es Admin) */}
              {inviteRole !== 'Admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cargo / Puesto
                  </label>
                  <select 
                    value={inviteCargo}
                    onChange={(e) => setInviteCargo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Analista (Big Data / Operativo)">Analista (Big Data / Operativo)</option>
                    <option value="Desarrollador Senior Backend">Desarrollador Senior Backend</option>
                    <option value="Empleado (General)">Empleado (General)</option>
                  </select>
                </div>
              )}

              {/* Proyecto Asignado (OCULTO SI ES ADMIN) */}
              {inviteRole !== 'Admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Proyecto Asignado
                  </label>
                  <select 
                    value={inviteProject}
                    onChange={(e) => setInviteProject(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {proyectos.map(p => (
                      <option key={p.id} value={p.titulo}>{p.titulo}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0056d2] hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enviar Invitación</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};