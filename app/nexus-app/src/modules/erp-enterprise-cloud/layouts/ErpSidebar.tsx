import { NavLink } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { ERP_MENU, ERP_BASE } from '../core/config/navigation';

interface Props {
  onNavigate?: () => void;
  onExit: () => void;
}

export const ErpSidebar: React.FC<Props> = ({ onNavigate, onExit }) => (
  <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
    <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-200">
      <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center">
        <Layers className="w-5 h-5" />
      </div>
      <div className="leading-tight">
        <p className="font-semibold text-slate-900">EnterpriseCloud</p>
        <p className="text-xs text-slate-500">Gestión empresarial</p>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {ERP_MENU.map((grupo) => (
        <div key={grupo.titulo}>
          <p className="px-3 mb-1.5 text-xs font-medium text-slate-400">{grupo.titulo}</p>
          <ul className="space-y-0.5">
            {grupo.modulos.map(({ path, nombre, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={`${ERP_BASE}/${path}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {nombre}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>

    <div className="p-3 border-t border-slate-200">
      <button
        onClick={onExit}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
        Volver a Nexus
      </button>
    </div>
  </aside>
);
