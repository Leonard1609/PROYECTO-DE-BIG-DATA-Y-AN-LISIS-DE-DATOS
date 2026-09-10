import React from 'react';
import { User, FolderKanban, MessageSquare, ShieldCheck, LogOut } from 'lucide-react';

interface SidebarProps {
  userEmail: string;
  activeTab: 'perfil' | 'proyectos' | 'mensajes' | 'accesos';
  setActiveTab: (tab: 'perfil' | 'proyectos' | 'mensajes' | 'accesos') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userEmail, activeTab, setActiveTab, onLogout }) => {
  return (
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
  );
};