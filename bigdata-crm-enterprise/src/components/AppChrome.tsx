import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConnectionBar } from './ConnectionBar';
import { ThemeToggle } from './ThemeToggle';

function titleFor(path: string) {
  if (path.startsWith('/admin/cargas')) return 'Carga';
  if (path.startsWith('/admin/analisis')) return 'Comparar';
  if (path === '/admin' || path === '/admin/') return 'Inicio';
  if (path.startsWith('/employee/sistema')) return 'Salud del servicio';
  if (path.startsWith('/employee')) return 'Tareas';
  return 'Nexus';
}

export const AppHeader: React.FC<{ roleLabel: string }> = ({ roleLabel }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const initials = (user?.nombre ?? 'N')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 shrink-0 border-b border-white/10 bg-slate-950/80 backdrop-blur flex items-center justify-between gap-4 px-5 lg:px-8">
      <p className="text-sm text-slate-400 truncate">
        <span className="text-white font-medium">{titleFor(pathname)}</span>
        <span className="text-slate-600 mx-2">/</span>
        {roleLabel}
      </p>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <ConnectionBar compact />
        <ThemeToggle />
        <div className="hidden sm:flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-blue-600/30 text-blue-200 text-xs font-semibold grid place-items-center">
            {initials}
          </span>
          <span className="text-sm text-slate-300 max-w-[10rem] truncate">{user?.nombre}</span>
        </div>
        <button
          type="button"
          onClick={() => void logout().then(() => navigate('/login'))}
          className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-white/5"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export const AppFooter: React.FC = () => (
  <footer className="h-11 shrink-0 border-t border-white/10 bg-slate-950/80 px-5 lg:px-8 flex items-center justify-between text-[11px] text-slate-400">
    <span className="font-display tracking-[0.2em] text-slate-500">NEXUS</span>
    <span>Inteligencia de negocio · {new Date().getFullYear()}</span>
  </footer>
);
