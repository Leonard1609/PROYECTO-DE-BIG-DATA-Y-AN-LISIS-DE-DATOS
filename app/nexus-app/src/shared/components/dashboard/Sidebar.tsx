import React from 'react';
import { User, FolderKanban, MessageSquare, ShieldCheck, LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
  userEmail: string;
  activeTab: 'perfil' | 'proyectos' | 'mensajes' | 'accesos';
  setActiveTab: (tab: 'perfil' | 'proyectos' | 'mensajes' | 'accesos') => void;
  onLogout: () => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userEmail,
  activeTab,
  setActiveTab,
  onLogout,
  userRole = 'ANALISTA'
}) => {
  const nombreUsuario = userEmail ? userEmail.split('@')[0].toUpperCase() : 'SAD.SAF';
  
  // Verificar si el usuario actual tiene permisos de Administrador
  const rolUpper = userRole.toUpperCase();
  const esAdmin = rolUpper === 'ADMIN' || rolUpper === 'ADMINISTRADOR' || rolUpper === 'SUB_ADMIN';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-screen border-r border-slate-800/80 font-sans select-none">
      <div className="p-4 space-y-5">
        {/* LOGO & BRAND */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              N
            </div>
            <span className="text-base font-black tracking-wider text-white">NEXUS</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
            v2.0
          </span>
        </div>

        {/* TARJETA DE PERFIL DE USUARIO */}
        <button
          onClick={() => setActiveTab('perfil')}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left border ${
            activeTab === 'perfil'
              ? 'bg-blue-600/10 border-blue-500/40 text-white shadow-sm'
              : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0 font-bold">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">{nombreUsuario}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${esAdmin ? 'bg-emerald-400' : 'bg-blue-400'}`} />
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase truncate">
                {userRole}
              </p>
            </div>
          </div>
        </button>

        {/* NAVEGACIÓN Y MENÚ */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Menú Principal
          </p>

          {/* Opción Accesible para Todos: Proyectos */}
          <button
            onClick={() => setActiveTab('proyectos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              activeTab === 'proyectos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <FolderKanban className="w-4 h-4 shrink-0" />
            <span className="truncate">Proyectos</span>
          </button>

          {/* Opciones Restringidas ÚNICAMENTE para Administradores */}
          {esAdmin && (
            <>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-3 mb-2">
                Administración
              </p>

              <button
                onClick={() => setActiveTab('mensajes')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeTab === 'mensajes'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">Mensajes e Informes</span>
              </button>

              <button
                onClick={() => setActiveTab('accesos')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeTab === 'accesos'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">Gestión de Accesos</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* FOOTER - CERRAR SESIÓN */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};