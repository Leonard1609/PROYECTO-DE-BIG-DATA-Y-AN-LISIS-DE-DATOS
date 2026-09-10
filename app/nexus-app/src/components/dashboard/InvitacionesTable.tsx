import React from 'react';
import { UserPlus, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import type { InvitacionSolicitud } from '../../types/dashboard';

interface InvitacionesTableProps {
  invitaciones: InvitacionSolicitud[];
  onOpenInviteModal: () => void;
  onAprobarActivar: (item: InvitacionSolicitud) => void;
  onEliminarInvitacion: (id: string | number) => void;
}

export const InvitacionesTable: React.FC<InvitacionesTableProps> = ({
  invitaciones,
  onOpenInviteModal,
  onAprobarActivar,
  onEliminarInvitacion
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Historial de Invitaciones Enviadas & Cargos Solicitados
          </h3>
        </div>
        <button
          onClick={onOpenInviteModal}
          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Nueva Invitación</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Origen</th>
              <th className="py-3 px-4">Fase Verificación</th>
              <th className="py-3 px-4">Destinatario / Cargo</th>
              <th className="py-3 px-4">Correo Empresarial</th>
              <th className="py-3 px-4">Proyecto / Rol</th>
              <th className="py-3 px-4">Fecha Envío</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invitaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  No hay solicitudes ni invitaciones pendientes.
                </td>
              </tr>
            ) : (
              invitaciones.map((item) => {
                const esInvitacion = item.origen === 'Invitación';
                const estadoStr = String(item.estado || '');
                const datosCompletados = estadoStr === 'DATOS_COMPLETADOS' || item.fase.includes('Fase 2/3');
                const puedeActivar = true;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        esInvitacion ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.origen}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      <span className={`px-2 py-0.5 rounded ${
                        datosCompletados ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.fase}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{item.destinatario || 'Pendiente de Registro'}</div>
                      <div className="text-[11px] text-slate-500">{item.cargo}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {item.correoEmpresarial || 'Pendiente de generación'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{item.rol}</div>
                      <div className="text-[11px] text-slate-400">{item.proyecto}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{item.fechaEnviado}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {puedeActivar ? (
                          <button
                            onClick={() => onAprobarActivar(item)}
                            className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 transition-all flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Activar</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
                            Esperando usuario
                          </span>
                        )}

                        <button
                          onClick={() => window.location.reload()}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Recargar"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onEliminarInvitacion(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar / Rechazar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};