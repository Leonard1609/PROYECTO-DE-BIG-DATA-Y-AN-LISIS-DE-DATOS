import React from 'react';
import { Menu } from 'lucide-react';
import { CLOUDOPS_NAV } from '../data/cloudOpsNav';
import { useCloudOps } from '../context/CloudOpsContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { activeTab, isLive, toggleLive, liveMetrics } = useCloudOps();
  const currentLabel = CLOUDOPS_NAV.find((item) => item.id === activeTab)?.label ?? 'Dashboard';
  const lastUpdate = new Date(liveMetrics.updatedAt).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="no-print sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú de navegación"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Ruta actual" className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
          <span className="hidden sm:inline">Nexus</span>
          <span className="hidden sm:inline">/</span>
          <span>CloudOps</span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-800">{currentLabel}</span>
        </nav>

        <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 lg:inline-block">
          ● AWS Cloud Foundations
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-slate-400 sm:inline">
          Actualizado <span className="font-mono text-slate-500">{lastUpdate}</span>
        </span>
        <button
          onClick={toggleLive}
          aria-pressed={isLive}
          title={isLive ? 'Pausar monitoreo' : 'Reanudar monitoreo'}
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isLive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`} />
          {isLive ? 'En vivo' : 'Pausado'}
        </button>
      </div>
    </header>
  );
};
