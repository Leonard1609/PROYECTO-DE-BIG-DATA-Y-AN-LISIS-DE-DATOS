import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Upload } from 'lucide-react';
import { DatasetProvider } from '../context/DatasetContext';
import { AppFooter, AppHeader } from '../components/AppChrome';

const links = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/admin/cargas', label: 'Subir', icon: Upload, end: false },
  { to: '/admin/analisis', label: 'Comparar', icon: BarChart3, end: false },
];

export const AdminLayout: React.FC = () => {
  return (
    <DatasetProvider>
      <div className="min-h-screen flex">
        <aside className="w-56 shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur flex flex-col">
          <div className="px-5 h-14 flex items-center border-b border-white/10">
            <p className="font-display text-xs tracking-[0.25em] text-blue-400">NEXUS</p>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <AppHeader roleLabel="Administrador" />
          <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-auto">
            <Outlet />
          </main>
          <AppFooter />
        </div>
      </div>
    </DatasetProvider>
  );
};
