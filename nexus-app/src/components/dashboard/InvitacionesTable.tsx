import React from 'react';
import { UserPlus, Plus, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import type { InvitacionSolicitud } from '../../types/dashboard';

interface InvitacionesTableProps {
  invitaciones: InvitacionSolicitud[];
  onOpenInviteModal: () => void;
  onAprobarActivar: (item: InvitacionSolicitud) => void;
  onEliminarInvitacion: (id: number) => void;
}

export const InvitacionesTable: React.FC<InvitacionesTableProps> = ({
  invitaciones,
  onOpenInviteModal,
  onAprobarActivar,
  onEliminarInvitacion
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Historial de Invitaciones Enviadas & Cargos Solicitados
          </h2>
          <p className="text-xs text-slate-500">Muestra la fase de verificación, origen de la petición y permite la aprobación directa.</p>
        </div>

        <button 
          onClick={onOpenInviteModal}
          className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Invitación</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-3">Origen</th>
              <th className="p-3">Fase Verificación</th>
              <th className="p-3">Destinatario / Cargo</th>
              <th className="p-3">Correo Empresarial</th>
              <th className="p-3">Proyecto / Rol</th>
              <th className="p-3">Fecha Envío</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invitaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No hay solicitudes ni invitaciones pendientes.
                </td>
              </tr>
            ) : (
              invitaciones.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      inv.origen === 'Solicitud' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {inv.origen}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {inv.fase}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{inv.destinatario}</p>
                    <p className="text-[11px] text-slate-500">{inv.cargo}</p>
                  </td>
                  <td className="p-3 font-mono text-[11px] font-semibold text-slate-700">
                    {inv.correoEmpresarial}
                  </td>
                  <td className="p-3 text-slate-700">
                    <span className="font-bold text-[10px] block">{inv.rol}</span>
                    <span className="text-[10px] text-slate-500">{inv.proyecto}</span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {inv.fechaEnviado}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onAprobarActivar(inv)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[11px] font-semibold transition-colors"
                        title="Aprobar y Activar Cuenta"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Activar</span>
                      </button>
                      <button 
                        onClick={() => alert(`Reenviando notificación a ${inv.correoEmpresarial}`)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Reenviar Correo"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onEliminarInvitacion(inv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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