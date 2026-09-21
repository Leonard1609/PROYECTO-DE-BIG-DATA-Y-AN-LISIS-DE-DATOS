import React from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';

interface Solicitud {
  id: string;
  nombre_completo: string;
  email: string;
  modulo_interes?: string;
  estado: string;
}

interface SolicitudesTableProps {
  solicitudes: Solicitud[];
  onAprobar: (solicitud: Solicitud) => void;
  onRechazar: (id: string) => void;
}

export const SolicitudesTable: React.FC<SolicitudesTableProps> = ({
  solicitudes,
  onAprobar,
  onRechazar
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800">Solicitudes de Acceso Pendientes</h3>
        <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">
          {solicitudes.length} pendientes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs uppercase bg-slate-100/70 text-slate-500">
            <tr>
              <th className="px-6 py-3">Usuario / Solicitante</th>
              <th className="px-6 py-3">Correo</th>
              <th className="px-6 py-3">Módulo de Interés</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {solicitudes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  No hay solicitudes pendientes de activación.
                </td>
              </tr>
            ) : (
              solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {sol.nombre_completo || 'Sin Nombre'}
                  </td>
                  <td className="px-6 py-4">{sol.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                      {sol.modulo_interes || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Pendiente
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onAprobar(sol)}
                        title="Aprobar y Activar Cuenta"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border border-emerald-200"
                      >
                        <CheckCircle2 size={16} />
                        Activar
                      </button>
                      <button
                        onClick={() => onRechazar(sol.id)}
                        title="Rechazar Solicitud"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};