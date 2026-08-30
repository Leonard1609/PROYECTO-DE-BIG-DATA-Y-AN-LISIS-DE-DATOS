import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, LayoutDashboard, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DatasetProvider } from '../context/DatasetContext';
import { ConnectionBar } from '../components/ConnectionBar';

const links = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/admin/cargas', label: 'Subir', icon: Upload, end: false },
  { to: '/admin/analisis', label: 'Comparar', icon: BarChart3, end: false },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <DatasetProvider>
      <div className="min-h-screen flex">
        <aside className="w-64 shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur flex flex-col">
          <div className="px-6 py-8 border-b border-white/10">
            <p className="font-display text-xs tracking-[0.25em] text-blue-400">NEXUS</p>
            <p className="mt-4 text-white font-medium truncate">{user?.nombre}</p>
            <p className="text-xs text-slate-500 mt-0.5">Administrador</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
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
          <button
            type="button"
            onClick={() => void logout().then(() => navigate('/login'))}
            className="m-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-white hover:bg-white/5"
          >
            <LogOut size={18} />
            Salir
          </button>
        </aside>
        <main className="flex-1 min-w-0 p-8 lg:p-10 space-y-6 overflow-auto">
          <ConnectionBar />
          <Outlet />
        </main>
      </div>
    </DatasetProvider>
  );
};
