import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Activity, 
  FolderKanban, 
  Users, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  ShieldCheck, 
  Wrench, 
  LogOut, 
  Search, 
  Grid, 
  List, 
  Star, 
  UserPlus, 
  X,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Lock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Settings,
  ChevronRight,
  FileText
} from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  // Estado de navegación lateral (incluye 'perfil')
  const [activeTab, setActiveTab] = useState<
    'perfil' | 'empresa' | 'actividad' | 'proyectos' | 'equipos' | 'calendario' | 'mensajes' | 'roles' | 'herramientas'
  >('proyectos');

  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Búsqueda y vista
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Formulario de invitación
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'analista' | 'empleado'>('analista');
  const [inviteProject, setInviteProject] = useState('PROYECTO BIG DATA & ANALÍTICA');

  // Proyectos
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

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitación enviada a ${inviteEmail} con rol "${inviteRole.toUpperCase()}" para el proyecto: ${inviteProject}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm">
      
      {/* 1. BARRA LATERAL */}
      <aside className="w-64 bg-[#1e1e1e] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-xl font-black text-white tracking-widest">NEXUS</h1>
            <span className="text-[9px] bg-blue-900/80 text-blue-300 font-mono px-1.5 py-0.5 rounded border border-blue-700">
              SYS-ADMIN
            </span>
          </div>

          <nav className="py-2">
            {/* ÁREA DE USUARIO/ADMIN CLICABLE (Estilo Blackboard) */}
            <div 
              onClick={() => setActiveTab('perfil')}
              className={`mx-2 p-2.5 rounded-md flex items-center gap-3 cursor-pointer transition-all border ${
                activeTab === 'perfil' 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                  : 'hover:bg-zinc-800/80 border-transparent text-slate-200'
              }`}
              title="Ver datos del Administrador Actual"
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
              onClick={() => setActiveTab('empresa')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'empresa' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Página de la Empresa</span>
            </button>

            <button 
              onClick={() => setActiveTab('actividad')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'actividad' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <Activity className="w-4 h-4 text-slate-400" />
              <span>Flujo de Actividad</span>
            </button>

            <button 
              onClick={() => setActiveTab('proyectos')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'proyectos' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Proyectos</span>
            </button>

            <button 
              onClick={() => setActiveTab('equipos')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'equipos' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Equipos / Áreas</span>
            </button>

            <button 
              onClick={() => setActiveTab('calendario')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'calendario' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              <span>Calendario</span>
            </button>

            <button 
              onClick={() => setActiveTab('mensajes')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'mensajes' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Mensajes e Informes</span>
            </button>

            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors text-blue-400 font-medium"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Generar Invitación / Cargo</span>
            </button>

            <button 
              onClick={() => setActiveTab('roles')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'roles' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Roles y Accesos</span>
            </button>

            <button 
              onClick={() => setActiveTab('herramientas')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'herramientas' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>Herramientas ERP</span>
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
            {activeTab === 'empresa' && 'Página de la Empresa'}
            {activeTab === 'actividad' && 'Flujo de Actividad'}
            {activeTab === 'proyectos' && 'Proyectos'}
            {activeTab === 'equipos' && 'Equipos y Áreas'}
            {activeTab === 'calendario' && 'Calendario de Entregas'}
            {activeTab === 'mensajes' && 'Mensajes e Informes de Proyectos'}
            {activeTab === 'roles' && 'Roles y Permisos de Acceso'}
            {activeTab === 'herramientas' && 'Herramientas Integradas ERP'}
          </h1>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 p-6 overflow-y-auto space-y-6">

            {/* VISTA 1: PERFIL ESTILO BLACKBOARD */}
            {activeTab === 'perfil' && (
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Banner Header Perfil */}
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
                    <span className="mt-2 text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-mono border">
                      ID: 001600055-SYS
                    </span>
                  </div>
                </div>

                {/* Dos Columnas Estilo Blackboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Columna Izquierda: Información Básica & Adicional */}
                  <div className="space-y-6">
                    {/* Información básica */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Información básica</h3>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Nombre completo</span>
                          <span className="text-slate-800 font-medium uppercase">{userEmail.split('@')[0]} ADMIN SISTEMAS</span>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Dirección de correo electrónico</span>
                          <span className="text-slate-800 font-mono">{userEmail}</span>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">ID de usuario</span>
                          <span className="text-slate-800 font-mono">001600055</span>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Contraseña</span>
                          <button className="text-blue-600 hover:underline font-semibold text-[11px]">Cambiar contraseña</button>
                        </div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Información adicional</h3>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Sexo</span>
                          <button className="text-blue-600 hover:underline">Agregar género</button>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Nombre adicional</span>
                          <button className="text-blue-600 hover:underline">Agregar nombre adicional</button>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Fecha de nacimiento</span>
                          <button className="text-blue-600 hover:underline">Agregar fecha de nacimiento</button>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Nivel de educación</span>
                          <span className="text-slate-800">Especialista TI / Ingeniería</span>
                        </div>
                      </div>
                    </div>

                    {/* Información de contacto */}
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Información de contacto</h3>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="p-3.5 flex justify-between items-start">
                          <span className="font-semibold text-slate-600">Dirección postal</span>
                          <span className="text-slate-800 text-right">LIMA, PE</span>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Número de teléfono</span>
                          <span className="text-blue-600 font-mono">+51 963256957 (Móvil)</span>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Empresa / Cargo</span>
                          <span className="text-slate-800 font-semibold">NEXUS Corp. / Administrador de Sistemas</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Configuración del Sistema */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Configuración del sistema</h3>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Idioma</span>
                          <button className="text-blue-600 hover:underline">Predeterminado del sistema (Español)</button>
                        </div>
                        <div className="p-3.5 flex justify-between items-center">
                          <span className="font-semibold text-slate-600">Ajustes de privacidad</span>
                          <button className="text-blue-600 hover:underline text-right max-w-[200px]">Solo administradores pueden ver mi perfil</button>
                        </div>
                        <div className="p-3.5 space-y-2">
                          <span className="font-semibold text-slate-600 block">Ajustes de notificaciones generales</span>
                          <ul className="space-y-1.5 pl-2 pt-1">
                            <li><button className="text-blue-600 hover:underline">Notificaciones de secuencias</button></li>
                            <li><button className="text-blue-600 hover:underline">Notificaciones por correo electrónico</button></li>
                            <li><button className="text-blue-600 hover:underline">Notificaciones emergentes</button></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs space-y-2">
                      <p className="font-bold text-blue-900">Modo Usuario General (Pruebas)</p>
                      <p className="text-blue-700 leading-relaxed">
                        Actualmente estás navegando con el rol de <strong>Sistemas / Admin General</strong>. Este usuario tiene permisos totales para probar el sistema antes de simular las vistas de <em>Admin de Documentación</em>, <em>Analista</em> y <em>Empleado</em>.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VISTA 2: MENSAJES E INFORMES ESTILO BLACKBOARD */}
            {activeTab === 'mensajes' && (
              <div className="space-y-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between bg-white p-4 rounded-md border border-slate-200">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Bandeja de Mensajes, Informes y Solicitudes</h2>
                    <p className="text-xs text-slate-500">Comunicaciones e informes enviados directamente por cada proyecto asignado.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#0056d2] text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Informe</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {proyectos.map((p) => (
                    <div 
                      key={p.id} 
                      className="bg-white rounded-md border border-slate-200 shadow-sm flex items-center justify-between p-4 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Barra de color lateral estilo Blackboard */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${p.colorBar}`} />

                      <div className="pl-3 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase">
                          ID: {p.nrc}
                        </span>
                        <h3 className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition-colors">
                          {p.titulo}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Líder a cargo: <span className="font-medium text-slate-700">{p.lider}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 border border-slate-300 rounded px-3 py-1.5 hover:border-blue-400 transition-colors bg-white font-medium">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>Enviar solicitud</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline">
                          <span>Ver reportes</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROYECTOS */}
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

            {/* OTROS TABS */}
            {activeTab === 'empresa' && (
              <div className="bg-white p-6 rounded-md border border-slate-200 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Organización NEXUS Corp.</h2>
                <p className="text-xs text-slate-600">Sistema unificado de gestión de proyectos, analítica de datos y optimización de flujos de trabajo CRM.</p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded border text-center">
                    <p className="text-2xl font-black text-blue-600">2</p>
                    <p className="text-xs text-slate-500 font-medium">Proyectos Activos</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded border text-center">
                    <p className="text-2xl font-black text-emerald-600">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Operatividad del Sistema</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded border text-center">
                    <p className="text-2xl font-black text-indigo-600">PostgreSQL</p>
                    <p className="text-xs text-slate-500 font-medium">Motor de Datos</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actividad' && (
              <div className="bg-white p-6 rounded-md border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-800 mb-2">Historial Reciente</h2>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start pb-3 border-b">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Se actualizó el perfil del Administrador General</p>
                      <p className="text-[10px] text-slate-400">Hace 2 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'equipos' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-bold text-sm text-slate-800">Equipo de Big Data & Analítica</h3>
                  <p className="text-xs text-slate-500 mt-1">Líder: CESAR ERINSON CARLOS ZAMB</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-2">3 Integrantes asignados</p>
                </div>
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-bold text-sm text-slate-800">Equipo CRM & Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-1">Líder: LEONARD DEV</p>
                  <p className="text-[11px] text-blue-600 font-semibold mt-2">2 Integrantes asignados</p>
                </div>
              </div>
            )}

            {activeTab === 'calendario' && (
              <div className="bg-white p-6 rounded border space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">Cronograma de Revisiones</h3>
                <div className="p-3 bg-blue-50 border-l-4 border-blue-600 text-xs">
                  <p className="font-bold text-blue-900">Entrega de Avance de Proyecto</p>
                  <p className="text-blue-700 text-[11px]">Presentación de arquitectura y módulos activos.</p>
                </div>
              </div>
            )}

            {activeTab === 'roles' && (
              <div className="bg-white rounded border p-5 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Configuración de los 4 Roles del Sistema NEXUS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 border rounded bg-slate-50">
                    <p className="font-bold text-blue-700">1. Admin General (Sistemas)</p>
                    <p className="text-slate-600 text-[11px] mt-1">Acceso total para pruebas y control maestro.</p>
                  </div>
                  <div className="p-3 border rounded bg-slate-50">
                    <p className="font-bold text-slate-800">2. Admin (Documentación)</p>
                    <p className="text-slate-600 text-[11px] mt-1">Gestión de documentos, invitaciones e informes.</p>
                  </div>
                  <div className="p-3 border rounded bg-slate-50">
                    <p className="font-bold text-slate-800">3. Analista</p>
                    <p className="text-slate-600 text-[11px] mt-1">Análisis de datos y métricas de proyectos.</p>
                  </div>
                  <div className="p-3 border rounded bg-slate-50">
                    <p className="font-bold text-slate-800">4. Empleado</p>
                    <p className="text-slate-600 text-[11px] mt-1">Desarrollo y trabajo general asignado.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'herramientas' && (
              <div className="bg-white p-6 rounded border space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">Módulos ERP Conectados</h3>
                <p className="text-xs text-slate-600">Integración directa con PostgreSQL para almacenamiento y generación de reportes.</p>
              </div>
            )}

          </main>

          {/* 3. PANEL DERECHO: TAREAS PENDIENTES */}
          <aside className="w-80 bg-white border-l border-slate-200 p-5 hidden xl:block overflow-y-auto">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Tareas pendientes</h2>
            <div className="p-6 border border-dashed border-slate-200 rounded-md text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">Sin tareas pendientes</p>
              <p className="text-[10px] text-slate-400">Las tareas aparecerán automáticamente al conectar la base de datos.</p>
            </div>
          </aside>

        </div>
      </div>

      {/* 4. MODAL DE INVITACIÓN (CON SELECCIÓN DE ROLES) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#1e1e1e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Generar Invitación NEXUS</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico del Usuario
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="ejemplo@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proyecto Asignado
                </label>
                <select 
                  value={inviteProject}
                  onChange={(e) => setInviteProject(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                >
                  {proyectos.map(p => (
                    <option key={p.id} value={p.titulo}>{p.titulo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rol Asignado
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'analista' | 'empleado')}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="admin">Admin (Gestión & Documentación)</option>
                  <option value="analista">Analista (Big Data / Datos)</option>
                  <option value="empleado">Empleado (General)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Al recibir la invitación, la barra lateral del usuario filtrará sus permisos según este rol.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0056d2] hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};