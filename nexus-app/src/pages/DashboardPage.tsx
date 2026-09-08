import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Activity, 
  FolderKanban, 
  Users, 
  Calendar, 
  MessageSquare, 
  ShieldCheck, 
  Wrench, 
  LogOut, 
  Search, 
  Grid, 
  List, 
  Star, 
  UserPlus, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ userEmail, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'proyectos' | 'invitaciones' | 'actividad'>('proyectos');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Formulario de invitación
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Analista Big Data');
  const [inviteProject, setInviteProject] = useState('PROYECTO BIG DATA & ANALÍTICA');

  // Lista de proyectos estilo tarjetas de Blackboard
  const proyectos = [
    { id: 1, titulo: 'PROYECTO BIG DATA & ANALÍTICA', nrc: '202620-BD-01', estado: 'Abierto', lider: 'CESAR ERINSON CARLOS ZAMB', bg: 'from-blue-700 to-indigo-900' },
    { id: 2, titulo: 'GESTIÓN CRM & PIPELINE VENTAS', nrc: '202620-CRM-02', estado: 'Abierto', lider: 'LEONARD DEV', bg: 'from-slate-800 to-blue-900' },
    { id: 3, titulo: 'MIGRACIÓN CLOUD AWS', nrc: '202620-AWS-03', estado: 'Abierto', lider: 'ALCIDES LLANOS NIETO', bg: 'from-blue-600 to-cyan-800' },
    { id: 4, titulo: 'SISTEMA ERP & PROYECTOS', nrc: '202620-ERP-04', estado: 'Abierto', lider: 'JUAN RAMON MANSILLA NEYRA', bg: 'from-indigo-800 to-slate-900' },
    { id: 5, titulo: 'MODELADO DE DATOS POSTGRES', nrc: '202620-BD-05', estado: 'Abierto', lider: 'JUAN JOSE LEON SUIYON', bg: 'from-blue-800 to-teal-900' },
    { id: 6, titulo: 'MÉTODOS DE TRABAJO & AGILE', nrc: '202620-METH-06', estado: 'Abierto', lider: 'ARTURO FLORENCIO HUAPAYA', bg: 'from-slate-900 to-blue-950' },
  ];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invitación enviada a ${inviteEmail} con el cargo: "${inviteRole}" para el proyecto ${inviteProject}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex font-sans text-sm">
      
      {/* 1. MENÚ LATERAL ESTILO BLACKBOARD (Dark Sidebar) */}
      <aside className="w-64 bg-[#1e1e1e] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-zinc-800">
            <h1 className="text-xl font-black text-white tracking-widest">NEXUS</h1>
          </div>

          {/* Menú de Navegación */}
          <nav className="py-2">
            {/* Perfil Usuario */}
            <div className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/60 cursor-pointer transition-colors text-xs border-b border-zinc-800/80 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-white uppercase truncate">{userEmail.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400">Administrador</p>
              </div>
            </div>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Página de la Empresa</span>
            </button>

            <button 
              onClick={() => setActiveTab('actividad')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'actividad' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <Activity className="w-4 h-4" />
              <span>Flujo de Actividad</span>
            </button>

            <button 
              onClick={() => setActiveTab('proyectos')}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-xs transition-colors ${activeTab === 'proyectos' ? 'bg-[#0056d2] text-white font-semibold' : 'hover:bg-zinc-800'}`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Proyectos</span>
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Equipos / Áreas</span>
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Calendario</span>
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span>Mensajes</span>
            </button>

            {/* Opción de Gestión de Permisos & Invitaciones */}
            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors text-blue-400 font-medium"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Generar Invitación / Cargo</span>
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Roles y Accesos</span>
            </button>

            <button className="w-full flex items-center gap-3 px-5 py-2.5 text-xs hover:bg-zinc-800 transition-colors">
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>Herramientas ERP</span>
            </button>
          </nav>
        </div>

        {/* Cerrar Sesión */}
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

      {/* 2. ÁREA CENTRAL DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Superior */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Proyectos</h1>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="bg-[#0056d2] hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar Usuario / Dar Cargo</span>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Contenido Principal (Buscador y Grilla) */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 border border-slate-300 rounded px-3 py-1.5 w-72 bg-white">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Busque sus proyectos" 
                  className="w-full text-xs outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                <select className="border border-slate-300 rounded px-3 py-1.5 bg-white">
                  <option>Todos los periodos</option>
                  <option>2026 - Trimestre 1</option>
                </select>

                <select className="border border-slate-300 rounded px-3 py-1.5 bg-white">
                  <option>Todos los proyectos</option>
                  <option>Módulo Big Data</option>
                  <option>Módulo CRM</option>
                </select>

                <div className="flex items-center gap-1 border-l pl-3">
                  <button className="p-1.5 bg-slate-100 rounded border border-slate-300">
                    <Grid className="w-4 h-4 text-slate-700" />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded">
                    <List className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500">{proyectos.length} resultados</p>

            {/* Grilla de Tarjetas estilo Blackboard Ultra */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {proyectos.map((p) => (
                <div key={p.id} className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    {/* Banner Superior con Gradiente y Título Integrado */}
                    <div className={`h-28 bg-gradient-to-r ${p.bg} p-3 text-white flex flex-col justify-between relative`}>
                      <span className="text-[10px] bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded w-fit font-mono">
                        {p.nrc}
                      </span>
                      <h2 className="font-bold text-sm tracking-wide line-clamp-2 leading-tight drop-shadow-sm">
                        {p.titulo}
                      </h2>
                    </div>

                    {/* Detalles del Proyecto */}
                    <div className="p-3 space-y-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
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

          </main>

          {/* 3. PANEL DERECHO: TAREAS PENDIENTES & ALERTAS */}
          <aside className="w-80 bg-white border-l border-slate-200 p-5 hidden xl:block overflow-y-auto">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Tareas pendientes</h2>

            <div className="space-y-6 text-xs">
              
              {/* Sección Vencidas */}
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Vencida</p>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-rose-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ingesta Dataset CSV</span>
                  </div>
                  <p className="text-[11px] text-rose-700">BIG DATA & ANALÍTICA</p>
                  <p className="text-[10px] text-slate-500">Venció ayer a las 23:59</p>
                </div>
              </div>

              {/* Sección Vence hoy */}
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Vence hoy</p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Asignación de Permisos PostgreSQL</span>
                  </div>
                  <p className="text-[11px] text-amber-800">SISTEMA ERP</p>
                  <p className="text-[10px] text-slate-500">Hoy a las 23:59</p>
                </div>
              </div>

              {/* Sección Vence pronto */}
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2">Vence pronto</p>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                    <p className="font-semibold text-slate-800">Carga de Leads CRM</p>
                    <p className="text-[11px] text-slate-500">GESTIÓN CRM</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                    <p className="font-semibold text-slate-800">Despliegue de Instancia AWS</p>
                    <p className="text-[11px] text-slate-500">MIGRACIÓN CLOUD</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {/* 4. MODAL: GENERAR INVITACIÓN / ASIGNAR CARGO */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#1e1e1e] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Generar Invitación Web</h3>
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
                  Proyecto Destino
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
                  Cargo / Permiso en el Proyecto
                </label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="Analista Big Data">Analista Big Data (Acceso a CSV y lectura)</option>
                  <option value="Project Manager">Project Manager (Control total de tareas)</option>
                  <option value="Gestor CRM">Gestor CRM (Edición de Leads)</option>
                  <option value="Consultor Externo">Consultor Externo (Solo Lectura)</option>
                </select>
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