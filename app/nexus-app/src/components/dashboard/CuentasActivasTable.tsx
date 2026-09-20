import React, { useState } from 'react';
import { ShieldCheck, Briefcase, Key, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import type { CuentaActiva } from '../../types/dashboard';

interface CuentasActivasTableProps {
  cuentas: CuentaActiva[];
  onEditarProyecto: (id: number) => void;
  onEliminar: (id: number) => void;
}

export const CuentasActivasTable: React.FC<CuentasActivasTableProps> = ({
  cuentas,
  onEditarProyecto,
  onEliminar
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Historial de Cuentas Activas y Credenciales de Acceso
          </h2>
          <p className="text-xs text-slate-500">
            Muestra datos corporativos, personales, tiempo de inactividad/permanencia y gestión CRUD de acceso.
          </p>
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
            {cuentas.map((cuenta) => (
              <tr key={cuenta.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-3">
                  <p className="font-bold text-slate-800">{cuenta.nombre}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                    <Briefcase className="w-3 h-3 text-blue-500" />
                    {cuenta.cargo}
                  </span>
                </td>
                <td className="p-3 text-slate-600 font-mono text-[11px]">{cuenta.correoNormal}</td>
                <td className="p-3 font-mono text-[11px] font-semibold text-slate-800">{cuenta.correoEmpresarial}</td>
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
                  <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{cuenta.proyecto}</p>
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
                      onClick={() => onEditarProyecto(cuenta.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Mover de Área / Proyecto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEliminar(cuenta.id)}
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
  );
};